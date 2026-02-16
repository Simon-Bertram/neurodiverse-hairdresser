# Astro on Cloudflare: Configuration and Deployment

A short guide to configuring Astro for Cloudflare and deploying with **Workers** or **Pages**, plus when to choose which.

---

## Workers vs Pages: Quick comparison

| Aspect | Cloudflare Workers | Cloudflare Pages |
|--------|--------------------|------------------|
| **Target** | Single Worker app (code + static assets). | Git-connected project or directory deploy; framework presets. |
| **Config** | `main` + `assets` (binding + directory). | `pages_build_output_dir` (no `main`). |
| **Routing** | Worker serves assets from `./dist`; fallback to Worker for SSR. | `_routes.json` decides which paths hit the server function vs static. |
| **`.assetsignore`** | **Required** in `public/` so `_worker.js` and `_routes.json` are not served as assets. | Not used (or remove it); Pages uses `_routes.json`. |
| **Preview** | `wrangler dev` (after `astro build`). | `wrangler pages dev ./dist`. |
| **Deploy** | `wrangler deploy`. | `wrangler pages deploy ./dist` or Git integration in dashboard. |
| **CI/CD** | Build: `astro build`. Deploy: `wrangler deploy`. | Connect repo in dashboard: build output = `dist`, framework = Astro. |
| **Best for** | One-off deploys, full control over Worker config, advanced bindings. | Simple Git-based deploys, branch previews, “connect repo and go”. |

**Summary:** Use **Workers** when you want a single deployable unit and explicit control. Use **Pages** when you prefer Git integration, branch previews, and the “connect repo” workflow. Both run your Astro SSR and API routes on the same Cloudflare runtime.

---

## 1. Prerequisites

- Node 18+ (or Bun).
- A Cloudflare account.
- An Astro project with **server output** (`output: 'server'`) if you need SSR or API routes.

---

## 2. Install the adapter and Wrangler

From the **Astro project root** (e.g. `apps/web` in a monorepo):

```bash
npx astro add cloudflare
```

This adds `@astrojs/cloudflare` and can add `wrangler`. If it does not:

```bash
npm install -D wrangler
# or: pnpm add -D wrangler   or   bun add -d wrangler
```

Then in `astro.config.mjs`:

- Set `output: 'server'` (for SSR/API routes).
- Use the Cloudflare adapter:

```js
import { defineConfig } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'server',
  adapter: cloudflare(),
  // ... rest of config
})
```

Remove any Node/other server adapter (e.g. `@astrojs/node`).

---

## 3. Wrangler configuration

All paths below are relative to the **Astro project root** (where `astro build` runs and creates `dist/`).

### Option A: Cloudflare Workers

Create **`wrangler.jsonc`** in the Astro project root:

```jsonc
{
  "main": "dist/_worker.js/index.js",
  "name": "my-astro-app",
  "compatibility_date": "2025-02-16",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS"
  },
  "observability": { "enabled": true }
}
```

Create **`public/.assetsignore`** so the Worker bundle is not served as a static file:

```
_worker.js
_routes.json
```

Preview and deploy from the **same directory**:

```bash
astro build && npx wrangler dev
# Deploy:
astro build && npx wrangler deploy
```

### Option B: Cloudflare Pages

Create **`wrangler.jsonc`** (or use `wrangler.toml`) in the Astro project root:

```jsonc
{
  "name": "my-astro-app",
  "compatibility_date": "2025-02-16",
  "pages_build_output_dir": "./dist"
}
```

Do **not** add `main` or `assets.binding`. Do **not** create `public/.assetsignore` for Pages (or remove it if you had it for Workers).

Preview and deploy:

```bash
astro build && npx wrangler pages dev ./dist
# Deploy:
astro build && npx wrangler pages deploy ./dist
```

Or connect the repo in the Cloudflare dashboard (Workers & Pages → Create → Pages → Connect repository) and set build output directory to `dist` and framework to Astro.

---

## 4. Scripts and `wrangler types`

Run **`wrangler types`** after changing `wrangler.jsonc` or `.dev.vars` so generated types stay in sync. Example scripts:

```json
{
  "scripts": {
    "dev": "wrangler types && astro dev",
    "build": "wrangler types && astro check && astro build",
    "preview": "wrangler types && wrangler dev",
    "deploy": "astro build && wrangler deploy"
  }
}
```

- **Workers:** `preview` = `wrangler dev` (run `astro build` first).
- **Pages:** `preview` = `wrangler pages dev ./dist` (after build).

---

## 5. Environment variables and secrets

- **Non-secret env:** In `wrangler.jsonc`:

  ```jsonc
  "vars": {
    "MY_VAR": "value"
  }
  ```

- **Secrets:** Set via CLI (not in config):

  ```bash
  npx wrangler secret put MY_SECRET
  ```

- **Local dev:** Add **`.dev.vars`** in the Astro project root (e.g. `MY_SECRET=localvalue`) and **do not commit it**.

Access in Astro via the Cloudflare runtime: `Astro.locals.runtime.env` in pages and `context.locals.runtime.env` in API routes. This is compatible with Astro’s env API; you can keep using `envField` and still read Cloudflare bindings from `Astro.locals.runtime`.

---

## 6. Optional: Typing the runtime

To type `Astro.locals.runtime` with your Wrangler bindings:

1. Run `npx wrangler types` (generates types from your config).
2. In **`src/env.d.ts`** (or your global types file):

   ```ts
   type Runtime = import('@astrojs/cloudflare').Runtime<Env>

   declare namespace App {
     interface Locals extends Runtime {}
   }
   ```

---

## 7. References

- [Deploy Astro to Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)
- [@astrojs/cloudflare and Cloudflare runtime](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- [Cloudflare Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
