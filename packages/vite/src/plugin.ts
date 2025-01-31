import type { Plugin } from "vite";
import { Docsmith } from "@docsmith/core";

interface DocsmithPluginOptions {
  folders?: string[];
  exclude?: string | RegExp | Array<string | RegExp>;
}

function createMainPlugin(docsmith: Docsmith): Plugin {
  return {
    name: "docsmith",

    configureServer(server) {
      server.httpServer?.once("listening", async () => {
        await docsmith.initialize(server.config.root);
      });

      server.watcher.on("change", async (filePath) => {
        if (filePath.endsWith(".md")) {
          await docsmith.processFile(server.config.root, filePath);
          const mod = server.moduleGraph.getModuleById("\0virtual:docsmith");
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
      });
    },

    // Add build-time processing
    async buildStart() {
      await docsmith.initialize(process.cwd());
    },
  };
}

function createVirtualModulePlugin(docsmith: Docsmith): Plugin {
  return {
    name: "docsmith:virtual",

    resolveId(id) {
      if (id === "virtual:docsmith") {
        return "\0virtual:docsmith";
      }
    },

    load(id) {
      if (id === "\0virtual:docsmith") {
        const data = docsmith.getDocsData();
        return `
          export const docs = ${JSON.stringify(data.docs)};
          export const tree = ${JSON.stringify(data.tree)};
          export function getDoc(slug) {
            return docs.find(doc => doc.slug === slug) ?? null;
          }
        `;
      }
    },

    // Add build-time code generation
    generateBundle() {
      const data = docsmith.getDocsData();
      this.emitFile({
        type: "asset",
        fileName: "docsmith-data.json",
        source: JSON.stringify(data),
      });
    },
  };
}

export function createPlugin(options: DocsmithPluginOptions = {}): Plugin[] {
  const docsmith = new Docsmith(options);
  return [createMainPlugin(docsmith), createVirtualModulePlugin(docsmith)];
}
