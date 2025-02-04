import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { createPlugin } from "@docsmith/vite";
// import { createGithubSourcePlugin } from '@docsmith/source-github';

export default defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
    createPlugin({
      folders: ["docs"],
      // plugins: [
      //   createGithubSourcePlugin({
      //     owner: 'remix-run',
      //     repo: 'react-router',
      //     path: 'docs',
      //     branch: 'main',
      //   })
      // ],
    })
  ],
});