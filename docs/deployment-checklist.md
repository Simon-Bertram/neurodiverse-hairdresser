# Cloudflare Workers deployment checklist

Use this checklist to prepare and deploy the Lucy Hair Astro app to Cloudflare Workers with Wrangler.

---

## Pre-deployment checklist

### 1. Build and assets

- [ ] **`.assetsignore` in the right place**  
  For Workers, `public/.assetsignore` must exist in the **Astro app root** (`apps/web/public/`) so `_worker.js` and `_routes.json` are not served as static assets.  
  - There is a `.assetsignore` at the repo root `public/`; the **web app** needs its own at `apps/web/public/.assetsignore` (see [astro-cloudflare-deploy.md](./astro-cloudflare-deploy.md)).

- [ ] **Build succeeds**  
  From repo root:
  ```bash
  pnpm build
  # or: bun run build
  ```
  From `apps/web`:
  ```bash
  pnpm run build
  ```
  Script runs `wrangler types && astro build`. Fix any type or build errors.

- [ ] **Preview locally**  
  After a successful build, from `apps/web`:
  ```bash
  pnpm run preview
  ```
  This runs `wrangler dev` against `./dist`. Test key flows (e.g. booking form that uses Resend).

### 2. Wrangler configuration

- [ ] **Worker name**  
  In `apps/web/wrangler.jsonc`, `"name"` is `"lucy-hair"`. Change if you need a different Worker name (e.g. per environment).

- [ ] **Account / project**  
  Ensure you’re logged in and the correct account is selected:
  ```bash
  cd apps/web && npx wrangler whoami
  ```

- [ ] **Compatibility**  
  `compatibility_date` and `compatibility_flags` (`nodejs_compat`, `global_fetch_strictly_public`) are already set. Only change if you need different runtime behavior.

### 3. Environment variables and secrets

- [ ] **Public URL (`PUBLIC_SERVER_URL`)**  
  Used in the app for client context (e.g. canonical URL). Set the production URL via Wrangler so it’s not `http://localhost:3000` in production.  
  **Option A – non-secret in config**  
  In `apps/web/wrangler.jsonc`:
  ```jsonc
  "vars": {
    "PUBLIC_SERVER_URL": "https://your-production-domain.com"
  }
  ```
  **Option B – secret**  
  ```bash
  cd apps/web && npx wrangler secret put PUBLIC_SERVER_URL
  ```
  Ensure the Astro env schema / usage can read this (e.g. from `Astro.locals.runtime.env` or astro:env if supported for Cloudflare).

- [ ] **Server-side secrets (Resend and booking email)**  
  The booking action in `src/actions/index.ts` uses:
  - `RESEND_API_KEY`
  - `LUCY_BOOKING_EMAIL` (or `DEV_BOOKING_EMAIL`)
  - `EMAIL_FROM_ADDRESS` (optional; has a default)
  
  On Cloudflare, **do not** put these in `wrangler.jsonc`. Set them as **secrets**:
  ```bash
  cd apps/web
  npx wrangler secret put RESEND_API_KEY
  npx wrangler secret put LUCY_BOOKING_EMAIL
  npx wrangler secret put EMAIL_FROM_ADDRESS   # if you don’t use the default
  ```
  You’ll be prompted to enter each value (or pipe from env: `echo "$VAR" | npx wrangler secret put VAR`).

- [ ] **Server env in Workers**  
  The action currently uses `import.meta.env` for the variables above. On Cloudflare Workers, runtime env is provided via the request context (`Astro.locals.runtime.env`), not necessarily via `import.meta.env`.  
  - Either switch the action to read from the Cloudflare runtime (e.g. get `env` from the action/request context and use `env.RESEND_API_KEY`, etc.), **or**
  - Use the [astro:env](https://docs.astro.build/en/guides/environment-variables/) server schema and ensure the Cloudflare adapter exposes these from the runtime.  
  Verify in preview (`wrangler dev`) that the booking email actually sends.

### 4. Local development env (optional)

- [ ] **`.dev.vars`**  
  For local `wrangler dev` / `preview`, create `apps/web/.dev.vars` (already in `.gitignore`). Example:
  ```
  RESEND_API_KEY=re_...
  LUCY_BOOKING_EMAIL=your@email.com
  EMAIL_FROM_ADDRESS=Lucy Russell Hair <onboarding@resend.dev>
  PUBLIC_SERVER_URL=http://localhost:8787
  ```
  Do **not** commit `.dev.vars`.

### 5. Optional cleanup

- [ ] **Unused dependency**  
  `package.json` lists `@astrojs/node`; the app uses `@astrojs/cloudflare`. Remove `@astrojs/node` if you don’t use it elsewhere:
  ```bash
  cd apps/web && pnpm remove @astrojs/node
  ```

- [ ] **Runtime typing (optional)**  
  For typed `Astro.locals.runtime` (including env), run `npx wrangler types` and extend `App.Locals` with `Runtime<Env>` in `apps/web/src/env.d.ts` (see [astro-cloudflare-deploy.md](./astro-cloudflare-deploy.md) §6).

### 6. Observability

- [ ] **Logs and traces**  
  `wrangler.jsonc` already has `observability.enabled: true` and sampling for logs/traces. After deploy, use the Cloudflare dashboard (Workers → your Worker → Logs / Trace) to confirm.

---

## How to deploy

### One-off deploy (CLI)

1. **Build** (from repo root or from `apps/web`):
   ```bash
  # From repo root (builds all workspace packages)
  pnpm build

  # Or only the web app
  pnpm --filter web build
  ```

2. **Deploy** from the **Astro project root** (`apps/web`), where `wrangler.jsonc` and `dist/` live:
   ```bash
  cd apps/web
  npx wrangler deploy
  ```
   Wrangler will use `dist/_worker.js/index.js` and the `dist` directory for static assets (per `wrangler.jsonc`).

3. **Custom domain (optional)**  
   In Cloudflare dashboard: Workers & Pages → your Worker → Settings → Domains & Routes, or use:
   ```bash
  npx wrangler deploy
  ```
   and attach a route/domain in the dashboard.

### Add a deploy script (optional)

In the **root** `package.json` you can add:
```json
"scripts": {
  "deploy:web": "turbo build --filter=web && cd apps/web && wrangler deploy"
}
```
Then from repo root:
```bash
pnpm run deploy:web
```

### CI/CD (e.g. GitHub Actions)

1. Build: run `pnpm build` (or `pnpm --filter web build`) with Node 18+.
2. Deploy: from `apps/web`, run `npx wrangler deploy`.
3. Secrets: set `CF_API_TOKEN` (and optionally `CF_ACCOUNT_ID`) in the CI environment; configure secrets in the Cloudflare dashboard or via Wrangler so the Worker has `RESEND_API_KEY`, `LUCY_BOOKING_EMAIL`, etc., and is not reliant on repo env files.

---

## Quick reference

| Task              | Command / location |
|------------------|--------------------|
| Build            | `pnpm build` (root) or `pnpm run build` in `apps/web` |
| Preview locally  | From `apps/web`: `pnpm run preview` (`wrangler dev`) |
| Deploy           | From `apps/web`: `npx wrangler deploy` |
| Set a secret     | From `apps/web`: `npx wrangler secret put SECRET_NAME` |
| Generate types   | From `apps/web`: `npx wrangler types` |
| Who’s logged in  | `npx wrangler whoami` |

See also: [astro-cloudflare-deploy.md](./astro-cloudflare-deploy.md) for Workers vs Pages and full configuration details.
