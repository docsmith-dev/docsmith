import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { createPlugin } from "@docsmith/vite";
// import { createGithubSourcePlugin } from '@docsmith/source-github';
import mdx from "@mdx-js/rollup";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx({
      providerImportSource: "@mdx-js/react",
    }),
    tsconfigPaths(),
    ...createPlugin({
      folders: ["docs"],
    }),
    reactRouter(),
  ],
});
