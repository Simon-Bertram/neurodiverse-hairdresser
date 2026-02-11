import node from "@astrojs/node";
import preact from "@astrojs/preact";
// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField, fontProviders } from "astro/config";

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
    fonts: [
      {
        provider: fontProviders.google(),
        name: "Fraunces",
        cssVariable: "--font-fraunces",
        weights: [400, 600],
      },
      {
        provider: fontProviders.google(),
        name: "Source Sans 3",
        cssVariable: "--font-source-sans-3",
        weights: [400, 600],
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
