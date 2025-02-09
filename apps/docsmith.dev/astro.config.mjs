import { defineConfig } from "astro/config";
import { createPlugin } from "@docsmith/vite";

import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [
      tailwindcss(),
      ...createPlugin({
        folders: ["docs"],
      }),
    ],
  },
  integrations: [react()],
});
