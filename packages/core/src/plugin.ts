// packages/core/src/plugin.ts
import type { Plugin } from "vite";
import chokidar from "chokidar";
import path from "path";
import { docsmith } from "./docsmith";
import { createVirtualModule } from "./virtualModule";

interface DocsmithPluginOptions {
  folders?: string[];
  exclude?: string | RegExp | Array<string | RegExp>;
}

export function createPlugin(options: DocsmithPluginOptions = {}): Plugin[] {
  const { folders = ["docs"], exclude } = options;
  let watcher: chokidar.FSWatcher;

  const mainPlugin: Plugin = {
    name: "docsmith",

    async configResolved(config) {
      // Initialize docsmith with the project root
      await docsmith.initialize(config.root);
    },

    configureServer(server) {
      // Set up watcher for file changes
      const watchPatterns = folders.map((folder) =>
        path.resolve(server.config.root, folder, "**/*.md"),
      );

      watcher = chokidar.watch(watchPatterns, {
        ignored: exclude,
        persistent: true,
      });

      watcher.on("change", async (filePath) => {
        // Re-process the changed file
        await docsmith.processFile(server.config.root, filePath);
        server.ws.send({ type: "full-reload" });
      });
    },

    async closeBundle() {
      if (watcher) {
        await watcher.close();
      }
    },
  };

  // Return both plugins
  return [mainPlugin, createVirtualModule()];
}
