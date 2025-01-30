import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createPlugin } from "@docsmith/core";

export default defineConfig({
  plugins: [
    react(),
    ...createPlugin({
      folders: ["docs"],
    }),
  ],
});
