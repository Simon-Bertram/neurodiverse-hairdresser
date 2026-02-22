/**
 * Client-side type for astro:actions so Preact/TS can resolve the import.
 * Astro generates the real types at build time; this allows actions.send() to type-check.
 */
declare module "astro:actions" {
  export const actions: {
    send: (input: unknown) => Promise<{
      data?: unknown;
      error?: { message?: string; code?: string };
    }>;
  };
}
