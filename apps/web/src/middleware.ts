import { defineMiddleware } from "astro:middleware";
import { createRemoteJWKSet, jwtVerify } from "jose";

const policyAud = import.meta.env.POLICY_AUD;
const teamDomain = import.meta.env.TEAM_DOMAIN;
const trailingSlashRegex = /\/$/;

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  if (!teamDomain) {
    throw new Error("TEAM_DOMAIN is not configured");
  }

  if (!jwks) {
    const normalizedTeamDomain = teamDomain.replace(trailingSlashRegex, "");
    const url = new URL(`${normalizedTeamDomain}/cdn-cgi/access/certs`);
    jwks = createRemoteJWKSet(url);
  }

  return jwks;
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!policyAud) {
    return new Response("Missing required audience", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  if (!teamDomain) {
    return new Response("Missing required team domain", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  const token = context.request.headers.get("cf-access-jwt-assertion");

  if (!token) {
    return new Response("Missing required CF Access JWT", {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }

  try {
    const jwks = getJwks();

    const { payload } = await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience: policyAud,
    });

    // Optional: expose claims to routes/components
    (
      context.locals as typeof context.locals & {
        user: { email: string | null; claims: unknown };
      }
    ).user = {
      email: (payload.email as string | undefined) ?? null,
      claims: payload,
    };

    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return new Response(`Invalid token: ${message}`, {
      status: 403,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
