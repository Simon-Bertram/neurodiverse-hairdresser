# Guide: Securing form submissions (repeatable)

Use this guide whenever you add or harden a form that submits to an Astro action (e.g. contact, booking, sign-up). It keeps the same order and checklists so you can run through it every time.

---

## Prerequisites

- [ ] Form submits via **Astro actions** (`actions.send(...)` or similar) — do not switch to a manual `fetch` unless necessary; Astro’s `actions` handle Origin checks for CSRF.
- [ ] Action validates input with **Zod** (or similar) and does not echo raw input into HTML (use something like `escapeHtml()` for user content in emails/HTML).

---

## 1. Bot protection (Cloudflare Turnstile)

**When:** Every form that should block bots (contact, booking, etc.).  
**Works on:** Any host (Node or Cloudflare). No need to be on Workers to use Turnstile.

### 1.1 Turnstile setup (one-time per widget)

- [ ] Create a Turnstile widget in the [Cloudflare dashboard](https://dash.cloudflare.com/?to=/:account/turnstile) (or API/Terraform). Note the **site key** (public) and **secret key** (private).
- [ ] For local/dev use [testing keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) so the widget doesn’t trigger a real challenge.
- [ ] Add env vars (e.g. in `apps/web/.env.local` and Cloudflare secrets):
  - `PUBLIC_TURNSTILE_SITE_KEY` (or `TURNSTILE_SITE_KEY`) — client
  - `TURNSTILE_SECRET_KEY` — server only, never in client code

### 1.2 Client (widget + token in payload)

- [ ] Show the Turnstile widget only on the **final step** (e.g. review/confirm), not on every step.
- [ ] Load the script once (e.g. `https://challenges.cloudflare.com/turnstile/v0/api.js`) in layout or when the final step mounts.
- [ ] Render the widget in a container (e.g. next to the submit button); in the success callback, store the **token** in state/signal.
- [ ] **Submit:** Send `{ ...formValues, turnstileToken: token }`. If there is no token yet, keep the submit button disabled.
- [ ] **Retry:** Turnstile tokens are single-use. On action error (e.g. validation or network), reset/re-render the widget so the user gets a new token before submitting again; show the existing error message.

### 1.3 Server (action)

- [ ] Add `turnstileToken: z.string().min(1)` to the action input schema.
- [ ] At the **start** of the handler (before any side effects like sending email):
  - Resolve secret: `context.locals?.runtime?.env?.TURNSTILE_SECRET_KEY ?? import.meta.env.TURNSTILE_SECRET_KEY`. If missing, throw `ActionError` (e.g. “Email is not configured” or “Security check failed”).
  - `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `FormData`: `secret`, `response` (token), and optionally `remoteip` (from `cf-connecting-ip` or `context.clientAddress`).
  - **Fail closed:** On network error, non-ok response, or `success !== true` in JSON, throw `ActionError` and do **not** run the rest of the handler (no email, no DB write).
- [ ] After verification, pass only the **form fields** (omit `turnstileToken`) into the rest of your logic (e.g. `buildBookingEmailHtml`). Do not log the token or user data in production.

**References:** [Turnstile client-side](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/), [server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

---

## 2. Edge rate limiting (Cloudflare only)

**When:** After the app is deployed with the **Cloudflare adapter** (e.g. `@astrojs/cloudflare` + wrangler). Bindings are not available on Node.

- [ ] In `wrangler.jsonc`, add a `ratelimits` entry (Wrangler 4.36+), e.g.:
  - `name`: binding name (e.g. `BOOKING_RATE_LIMITER`)
  - `namespace_id`: unique per usage
  - `simple`: e.g. `{ "limit": 5, "period": 60 }` (5 requests per 60 seconds per key)
- [ ] Run `wrangler types` so the generated `Env` includes the rate limiter binding.
- [ ] In the action handler, accept `context` (Astro’s `ActionAPIContext`). Order of checks: **(1) rate limit, (2) Turnstile, (3) Zod, (4) side effects.**
- [ ] Rate limit: `const { success } = await env.BOOKING_RATE_LIMITER.limit({ key: clientKey });`  
  Use a **per-client key** (e.g. `request.headers.get("cf-connecting-ip")` or a hash of it). If `!success`, throw `ActionError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." })`.
- [ ] If running on Node (no Cloudflare), `context.locals.runtime` may be undefined; skip the rate limit step or use another mechanism (e.g. in-memory/Redis) and keep the same error contract.

---

## 3. CSRF and request origin

- [ ] Keep using **`astro:actions`** from the client (no custom `fetch` to the action URL unless you have a good reason).
- [ ] On Cloudflare, set `compatibility_flags: ["nodejs_compat"]` (and any others your stack needs) in wrangler so Astro and the runtime behave correctly.

No extra CSRF code is required beyond using the `actions` object.

---

## 4. Data integrity

- [ ] Validate the full payload with a **strict Zod schema** in the action.
- [ ] Use **escapeHtml()** (or equivalent) for any user-supplied strings that go into HTML (e.g. in emails). Do not echo raw input into HTML.

---

## 5. Optional: draft / partial state (e.g. KV)

- [ ] If you persist partial form data (e.g. wizard steps 1–4): use a KV namespace, short TTL, and a server-generated session/anonymous ID. **Do not** store Turnstile tokens in KV; they are single-use.

---

## Implementation order (summary)

| Step | What | Works on |
|------|------|----------|
| 1 | Turnstile (widget + siteverify in action) | Node or Cloudflare |
| 2 | Rate limiting (binding + `limit()` in action) | Cloudflare only |
| 3 | CSRF / compatibility (`nodejs_compat`, keep `actions`) | When on Cloudflare |
| 4 | Data integrity (Zod + escapeHtml) | Always |
| 5 | KV drafts | Optional, Cloudflare |

---

## Project-specific reference

For the **booking form** on this site, the detailed plan and code references are in:

- [docs/secure-booking-form-submission.md](secure-booking-form-submission.md)

Use that doc for file paths, example handler shape, and Turnstile client flow for this project; use this guide as the repeatable checklist for any form.
