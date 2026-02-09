import node from "@astrojs/node";
import preact from "@astrojs/preact";
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";

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
  experimental: {
    fontProviders: {
      google: {
        fonts: [
          { family: "Fraunces", weights: [400, 600] },
          { family: "Source Sans 3", weights: [400, 600] },
        ],
      },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
