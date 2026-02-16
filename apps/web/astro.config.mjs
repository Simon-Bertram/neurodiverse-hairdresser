import node from "@astrojs/node";
import preact from "@astrojs/preact";
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

/**
 * When global.css changes, trigger a full reload instead of module HMR.
 * Avoids "error loading dynamically imported module" for the CSS URL
 * (Vite’s HMR can try to reload CSS as a JS module and fail).
 */
function globalCssFullReload() {
  return {
    name: "global-css-full-reload",
    handleHotUpdate({ file, server }) {
      if (file.endsWith("global.css")) {
        server.ws.send({ type: "full-reload", path: "*" });
        return [];
      }
    },
  };
}

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [preact()],
  env: {
    schema: {
      PUBLIC_SERVER_URL: envField.string({
        access: "public",
        context: "client",
        default: "http://localhost:3000",
      }),
    },
  },
  vite: {
    plugins: [globalCssFullReload(), tailwindcss()],
    optimizeDeps: {
      include: ["theme-change"],
    },
  },
});
