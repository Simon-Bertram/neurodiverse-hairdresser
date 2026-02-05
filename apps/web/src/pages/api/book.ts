import type { APIRoute } from "astro";

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

  let body: unknown;
  try {
    body = await request.json();
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
