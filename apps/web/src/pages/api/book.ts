import type { APIRoute } from "astro";

/** Max request body size (64 KB) to avoid abuse and memory spikes. */
const MAX_BODY_SIZE = 64 * 1024;

/**
 * POST /api/book — accepts booking form JSON and redirects to thank-you.
 * In production you would validate, store or email the request here.
 */
export const POST: APIRoute = async ({ request }) => {
  if (
    request.headers.get("Content-Type")?.includes("application/json") !== true
  ) {
    return new Response(
      JSON.stringify({ error: "Content-Type must be application/json" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const contentLength = request.headers.get("Content-Length");
  if (contentLength !== null) {
    const n = Number.parseInt(contentLength, 10);
    if (Number.isNaN(n) || n > MAX_BODY_SIZE) {
      return new Response(JSON.stringify({ error: "Request body too large" }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const raw = await readBodyWithLimit(request, MAX_BODY_SIZE);
  if (raw === null) {
    return new Response(JSON.stringify({ error: "Request body too large" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw) as unknown;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Basic shape check; extend as needed for storage/email
  const data = body as Record<string, unknown>;
  if (
    typeof data?.name !== "string" ||
    typeof data?.contactDetail !== "string"
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // TODO: persist to DB or send email, then redirect
  // For now, redirect to thank-you page
  return new Response(null, {
    status: 303,
    headers: { Location: "/book/thank-you" },
  });
};

/**
 * Reads request body up to maxBytes. Returns UTF-8 string or null if over limit.
 */
async function readBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) {
    return "";
  }
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (total + value.length > maxBytes) {
        return null;
      }
      chunks.push(value);
      total += value.length;
    }
  } finally {
    reader.releaseLock();
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return new TextDecoder().decode(out);
}
