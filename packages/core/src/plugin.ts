import type { Plugin, ViteDevServer } from 'vite';
import chokidar from "chokidar";
import path from "path";
import { docsmith } from './docsmith';

interface DocsmithPluginOptions {
  folders?: string[];
  exclude?: string | RegExp | Array<string | RegExp>;
}

export default function createPlugin(options: DocsmithPluginOptions = {}): Plugin {
  const { folders = ["docs"], exclude } = options;
  let viteServer: ViteDevServer;
  let watcher: chokidar.FSWatcher;

  return {
    name: "docsmith" as const,

    async configResolved(config) {
      // Initialize docsmith with the project root
      await docsmith.initialize(config.root);
    },

    configureServer(server: ViteDevServer) {
      viteServer = server;

      // Set up watcher for file changes
      const watchPatterns = folders.map((folder) =>
        path.resolve(server.config.root, folder, "**/*.md")
      );

      watcher = chokidar.watch(watchPatterns, {
        ignored: exclude,
        persistent: true,
      });

      watcher.on("change", async () => {
        // Reinitialize docsmith and trigger reload
        await docsmith.initialize(server.config.root);
        server.ws.send({ type: "full-reload" });
      });
    },

    async closeBundle() {
      if (watcher) {
        await watcher.close();
      }
    }
  };
}