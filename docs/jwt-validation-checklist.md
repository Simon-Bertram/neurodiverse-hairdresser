# JWT validation checklist

Complete these to finish Cloudflare Access JWT validation for this app.

- [ ] **Set env vars for the Worker**  
  - `POLICY_AUD` = your Cloudflare Access app AUD tag  
  - `TEAM_DOMAIN` = `https://<team-name>.cloudflareaccess.com`  
  - Local: keep in `apps/web/.env` and/or `.dev.vars`  
  - Production: set in Wrangler (`wrangler.jsonc` `vars`) or Cloudflare dashboard → Workers & Pages → your Worker → Settings → Variables

- [ ] **Put Cloudflare Access in front of this Worker**  
  In Cloudflare One → Access → Applications, add an HTTP app for your Worker hostname and require login so requests get `Cf-Access-Jwt-Assertion`.

- [ ] **Test locally**  
  From `apps/web`: `bun run build` then `wrangler dev`. Hit the dev URL through Access; with valid login it should load; without it you should get 403.

- [ ] **Deploy**  
  From `apps/web`: `bun run build` then `wrangler deploy`. Confirm authenticated requests work and unauthenticated get 403.
