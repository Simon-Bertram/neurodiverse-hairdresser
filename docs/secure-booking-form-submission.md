---
title: Secure booking form submission
overview: Add Cloudflare Turnstile for bot protection, edge rate limiting when deployed on Cloudflare, and reinforce CSRF/data integrity so the booking form is resistant to abuse and malicious use.
---

# Secure booking form submission

## Current state

- **Adapter**: [apps/web/astro.config.mjs](apps/web/astro.config.mjs) uses `@astrojs/node`. Rate limiting **bindings** and KV are only available when running on Cloudflare (Workers/Pages). Your [docs/astro-cloudflare-deploy.md](docs/astro-cloudflare-deploy.md) already describe switching to `@astrojs/cloudflare` and wrangler.
- **Submission**: Booking wizard calls `actions.send(formData)` from [apps/web/src/components/booking/useBookingWizardState.ts](apps/web/src/components/booking/useBookingWizardState.ts); the action in [apps/web/src/actions/index.ts](apps/web/src/actions/index.ts) validates with Zod and sends email via Resend. No Turnstile, no rate limiting, no middleware.
- **CSRF**: Using `astro:actions` from the client (no custom `fetch`) is correct; Astro checks `Origin` for POST. When you move to Cloudflare, set `compatibility_flags: ["nodejs_compat"]` in wrangler so Node-compat APIs used by Astro keep working.

## 1. Bot protection: Cloudflare Turnstile

**Goal:** Ensure only real users can submit; block automated or headless submissions.

Implementation has two parts: [embed the widget](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) on the client and [validate the token](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) on the server via the Siteverify API.

- **Client (Preact)**  
  - Add a Turnstile widget on the **review step** (step 5), so the challenge is shown only when the user is about to submit.  
  - Use the Turnstile script (or a small wrapper that loads `https://challenges.cloudflare.com/turnstile/v0/api.js`) and render the widget in a container (e.g. in [StepReview.tsx](apps/web/src/components/booking/StepReview.tsx) or a dedicated component next to the submit button).  
  - Store the token in component state (or a signal) when the widget callback runs (`onSuccess` with `token`).  
  - On submit, include this token in the payload passed to the action (e.g. add `turnstileToken: string` to the object sent to `actions.send(...)`).
- **Server (Astro Action)**  
  - Extend the action input schema in [apps/web/src/actions/index.ts](apps/web/src/actions/index.ts) with a required `turnstileToken: z.string().min(1)`.  
  - At the start of the handler (before Resend or any side effects):  
    - `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with body `secret=<TURNSTILE_SECRET_KEY>&response=<turnstileToken>`.  
    - Use `fetch()`; read `TURNSTILE_SECRET_KEY` from `import.meta.env` (or your env layer).  
    - If the JSON response has `success !== true`, throw `ActionError({ code: "BAD_REQUEST", message: "Verification failed" })` (or a dedicated code like `"TURNSTILE_FAILED"`) and do not send the email.
  - Keep using Zod for the rest of the payload (name, contactDetail, etc.); strip or ignore `turnstileToken` when building the email.
- **Env:** Add `TURNSTILE_SITE_KEY` (public, for the widget) and `TURNSTILE_SECRET_KEY` (server-only) in `apps/web/.env.local` and document in README or env example. Use the same keys for dev/staging; optionally use a separate Turnstile widget type for dev.

**Flow:** User completes steps 1–5 → Turnstile widget runs on step 5 → user submits → action receives payload with `turnstileToken` → action verifies token with siteverify → if success, then validate booking data and send email; otherwise return error.

### 1.1 Turnstile implementation examples (improved)

**Server-side action** ([apps/web/src/actions/index.ts](apps/web/src/actions/index.ts))

- Use `accept: 'json'` to match the existing wizard (which calls `actions.send({ ...formValues, turnstileToken })`). Add `turnstileToken: z.string().min(1)` to the existing booking input schema; do not use `cf-turnstile-response` in the schema unless you switch to form submission.
- Resolve the secret key in a way that works on both Node and Cloudflare: prefer `context.locals?.runtime?.env?.TURNSTILE_SECRET_KEY` when available (Cloudflare), otherwise `import.meta.env.TURNSTILE_SECRET_KEY` (Node / fallback). If missing, throw `ActionError` before calling siteverify.
- Call siteverify with `POST`, body as `FormData`: `secret`, `response` (token), and optionally `remoteip` (client IP when available). Get client IP from `context.request?.headers?.get('cf-connecting-ip')` (Cloudflare) or `context.clientAddress` (Astro) so Cloudflare can use it for analytics; omit if not available.
- Fail closed: if `fetch` throws (network error) or the response is not ok, throw `ActionError({ code: 'INTERNAL_SERVER_ERROR', message: 'Security check failed. Please try again.' })`. If the JSON body has `success !== true`, throw `ActionError({ code: 'BAD_REQUEST', message: 'Security check failed. Please try again.' })`. Do not log the visitor's name or token; avoid `console.log` for verified users in production.
- After verification, pass only the booking fields (excluding `turnstileToken`) into `buildBookingEmailHtml` and the rest of your logic (e.g. use a schema that omits `turnstileToken` for the email payload).

Example handler shape (conceptual):

```ts
handler: async (input, context) => {
  const secret =
    context.locals?.runtime?.env?.TURNSTILE_SECRET_KEY ??
    import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret || typeof secret !== "string")
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Email is not configured" });

  const formData = new FormData();
  formData.append("secret", secret);
  formData.append("response", input.turnstileToken);
  const ip = context.request?.headers?.get("cf-connecting-ip") ?? context.clientAddress;
  if (ip) formData.append("remoteip", ip);

  let result: Response;
  try {
    result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Security check failed. Please try again." });
  }
  if (!result.ok)
    throw new ActionError({ code: "INTERNAL_SERVER_ERROR", message: "Security check failed. Please try again." });

  const outcome = await result.json();
  if (!outcome.success)
    throw new ActionError({ code: "BAD_REQUEST", message: "Security check failed. Please try again." });

  // Then: rate limit (if Cloudflare), then build email from booking fields only (omit turnstileToken), send via Resend.
}
```

**Client (Preact wizard)** ([apps/web/src/components/booking](apps/web/src/components/booking))

- The wizard currently submits **JSON** via `actions.send(formData.value)`. Add a `turnstileToken` signal (or state) that is set when the Turnstile widget's success callback runs. On the review step (step 5), render the Turnstile widget (vanilla script or a small Preact wrapper around the Turnstile API). Use the **public** site key from env (e.g. `import.meta.env.PUBLIC_TURNSTILE_SITE_KEY` or inject from server); do not hardcode it.
- **Submit:** When the user clicks submit, send `{ ...formValues, turnstileToken: token }`. If you don't have a token yet (widget not completed), do not call the action; keep the submit button disabled until `token` is non-empty.
- **One-time tokens:** Turnstile tokens are single-use. If the action returns an error (e.g. `BAD_REQUEST` or network failure), the same token cannot be reused. Reset or re-render the widget so the user gets a new token before they can submit again; show the existing `submitError` message so they know to try again.
- You can load the Turnstile script once (e.g. in the layout or when step 5 mounts) from `https://challenges.cloudflare.com/turnstile/v0/api.js`, then use `window.turnstile.render(elem, { sitekey, callback: (t) => setToken(t) })` and store the token in a signal. Alternatively use a library like `react-turnstile` with Preact (with `@preact/compat` if needed); ensure the token is passed into the action payload, not only as a form field (since you're not using `accept: 'form'`).

Example client flow (conceptual):

```tsx
// On step 5: render Turnstile widget; store token in a signal.
// Submit handler:
const payload = { ...formData.value, turnstileToken: turnstileToken.value };
const { data, error } = await actions.send(payload);
if (error) {
  setSubmitError(error.message);
  resetTurnstile(); // So user gets a new token for retry.
  return;
}
if (data) window.location.href = "/book/thank-you";
```

**Security notes**

- **Secrets:** Store `TURNSTILE_SECRET_KEY` in Cloudflare (e.g. `wrangler secret put TURNSTILE_SECRET_KEY`) or in `apps/web/.env.local`; never commit it. Use `PUBLIC_TURNSTILE_SITE_KEY` (or equivalent) for the client so the widget can load.
- **Fail closed:** Any failure to verify (network error, non-ok response, or `success: false` from siteverify) must result in rejecting the submission and not sending the email.
- **Final step only:** Run Turnstile only on the final submit step to minimise verification calls and keep UX smooth; no need to verify on earlier steps.

### 1.2 Cloudflare Turnstile docs (get-started)

Reference: [Cloudflare Turnstile – Get started](https://developers.cloudflare.com/turnstile/get-started/).

- **Widget creation (prerequisite):** Before embedding or validating, create a Turnstile widget to get a **sitekey** (public, for the client) and **secret key** (private, for server-side validation). Do this in the [Cloudflare dashboard](https://developers.cloudflare.com/turnstile/get-started/widget-management/dashboard/), via [API](https://developers.cloudflare.com/turnstile/get-started/widget-management/api/), or [Terraform](https://developers.cloudflare.com/turnstile/get-started/widget-management/terraform/). Each widget has its own sitekey/secret pair and options (mode, hostnames, appearance).
- **Works on any host:** Turnstile is an independent service. You can use it on any website whether or not it is proxied through Cloudflare (multi-cloud, on-prem, other CDNs). The widget and Siteverify API are self-contained, so the current Node adapter is fine; no need to be on Workers to use Turnstile.
- **Security requirements (from Cloudflare):**
  - **Server-side validation is mandatory.** Skipping Siteverify leaves major vulnerabilities; tokens can be invalid, expired, or already redeemed. Incomplete validation also results in zeroes for token validation in [Turnstile Analytics](https://developers.cloudflare.com/turnstile/turnstile-analytics/).
  - **Tokens expire after 300 seconds (5 minutes).** Expired or already-used tokens must be replaced with a fresh challenge (reset/re-render the widget on error or retry).
  - **Each token can only be validated once.** Reusing a token will fail; the client must obtain a new token after a failed or retried submission.
- **Testing:** Use Cloudflare's [testing sitekey and secret](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) for local/dev so the widget does not trigger a real challenge. Production secret keys will reject dummy tokens, so use the testing keys only in non-production.
- **Best practices (from Cloudflare):**
  - **Security:** Protect secret keys; never expose them in client-side code. Rotate secret keys periodically (dashboard or API). Restrict hostnames in the widget so only your domains can use the widget. Monitor usage and analytics for unusual patterns.
  - **Operational:** Use descriptive widget names (e.g. "Booking form"). Use different widgets for development, staging, and production. Keep track of which widgets are used where; store widget configuration in version control when using Terraform.

## 2. Edge-level rate limiting (Cloudflare only)

**Goal:** Limit how many booking submissions a client can trigger per minute to prevent brute-force or "denial of wallet" abuse.

- **Prerequisite:** Deploy the app with the **Cloudflare adapter** and wrangler (as in your [docs/astro-cloudflare-deploy.md](docs/astro-cloudflare-deploy.md)). Rate limit bindings are not available on the Node adapter.
- **Wrangler config**  
  - In `apps/web/wrangler.jsonc` (or equivalent), add a `ratelimits` entry (Wrangler 4.36+). Cloudflare docs use `name` for the binding name, e.g.:

```jsonc
    "ratelimits": [
      {
        "name": "BOOKING_RATE_LIMITER",
        "namespace_id": "1001",
        "simple": { "limit": 5, "period": 60 }
      }
    ]
    

```

- Use a unique `namespace_id` per account/usage. This gives 5 requests per 60 seconds per key.
- **Action handler**  
  - Change the `send` action handler to accept the second parameter `context` (Astro's `ActionAPIContext`).  
  - When running on Cloudflare, `context.locals.runtime.env` exposes bindings. Check for `context.locals?.runtime?.env?.BOOKING_RATE_LIMITER`.  
  - Before validating Turnstile or sending email, call:
  `const { success } = await env.BOOKING_RATE_LIMITER.limit({ key: clientKey });`
  - **Key:** Use a stable client identifier. On Cloudflare you can use `request.headers.get("cf-connecting-ip")` (from `context.request`) or a hash of it; avoid global/per-route keys so limits are per client. If `!success`, throw `ActionError({ code: "TOO_MANY_REQUESTS", message: "Too many attempts. Try again later." })`.  
  - Order in the handler: (1) rate limit check, (2) Turnstile verification, (3) Zod validation, (4) send email. This avoids consuming Turnstile or doing heavy work when over limit.
- **Typing:** After adding the binding, run `wrangler types` and ensure the generated `Env` type includes `BOOKING_RATE_LIMITER`. Use that type (e.g. via `@astrojs/cloudflare`'s `Runtime<Env>`) so `context.locals.runtime.env` is typed.
- **Non-Cloudflare (Node):** If the app runs on Node, `context.locals.runtime` may be undefined. In that case skip the rate limit step or implement a separate mechanism (e.g. in-memory or Redis) and keep the same `ActionError` contract for consistency.

## 3. CSRF and request origin

- **Current:** Submitting via `actions.send(...)` from `astro:actions` uses Astro's built-in CSRF handling (Origin header checks). Do not replace this with a manual `fetch` to the action URL unless you have a good reason; manual fetches can miss headers Astro sets.
- **Cloudflare:** In wrangler, set `compatibility_flags: ["nodejs_compat"]` (and any others your stack needs) so that Astro and the runtime behave correctly. No extra CSRF code is required beyond using the `actions` object.

## 4. Data integrity (already in place)

- **Zod:** The action already validates the booking payload with a strict schema in [apps/web/src/actions/index.ts](apps/web/src/actions/index.ts). This limits injection (e.g. XSS in generated HTML) and malformed data. Keep the schema and continue to build the email from the validated object only; do not echo raw input into HTML.
- **HTML:** Your `buildBookingEmailHtml` uses `escapeHtml()` for user-supplied strings; keep that pattern for any new fields.

## 5. Optional: Cloudflare KV for draft storage

- You mentioned storing "partial multi-part form data" securely. If you want to persist wizard state (e.g. steps 1–4) so users can resume later:
  - Add a KV namespace binding in wrangler.
  - In the action (or a separate "save draft" action), accept a draft payload, associate it with a server-generated session or anonymous ID (e.g. stored in a cookie or passed from the client), and write to KV with a short TTL. Do not store Turnstile tokens in KV; they are one-time use.
  - This is independent of Turnstile/rate limiting and can be a follow-up task.

## Implementation order

1. **Turnstile** — Works with the current Node setup: add widget on step 5, add token to action input, verify in handler, env vars.
2. **Rate limiting** — After switching to Cloudflare adapter and wrangler: add `ratelimits` config, then in the action read `context.locals.runtime.env`, get client key from request, call `limit()`, throw on `!success`.
3. **CSRF / compatibility** — When moving to Cloudflare, add `nodejs_compat` (and any other flags) and keep using `astro:actions` from the client.
4. **KV drafts** — Optional later step.

## Summary


| Feature              | Where                                            | Notes                                                    |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| **Bot mitigation**   | Turnstile widget (step 5) + siteverify in action | Token in payload; verify before sending email.           |
| **Abuse prevention** | Rate limit binding in action (Cloudflare only)   | After adapter + wrangler; key by client IP (or similar). |
| **CSRF**             | Use `actions` from `astro:actions`               | Already correct; add `nodejs_compat` on Cloudflare.      |
| **Data integrity**   | Zod + escapeHtml                                 | Already in place; keep for new fields.                   |
| **Draft storage**    | KV (optional)                                    | Separate; not required for "secure submission".          |
