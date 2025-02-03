import type { Plugin } from "vite";
import type { ViteDevServer } from 'vite'
import { Docsmith } from "@docsmith/core";
import path from "path";
import fs from "fs";

interface DocsmithPluginOptions {
  folders?: string[];
  exclude?: string | RegExp | Array<string | RegExp>;
}

function createRuntimeCode(data: ReturnType<typeof Docsmith.prototype.getDocsData>) {
  // ESM Version (for client)
  const esmCode = `
    export const docs = ${JSON.stringify(data.docs)};
    export const tree = ${JSON.stringify(data.tree)};

    export function getDoc(slug) {
      return docs.find(doc => doc.slug === slug) ?? null;
    }

    export function getTree() {
      return tree;
    }

    export function getDocs() {
      return docs;
    }
  `;

  // CJS Version (for server)
  const cjsCode = `
    const docs = ${JSON.stringify(data.docs)};
    const tree = ${JSON.stringify(data.tree)};

    function getDoc(slug) {
      return docs.find(doc => doc.slug === slug) ?? null;
    }

    function getTree() {
      return tree;
    }

    function getDocs() {
      return docs;
    }

    module.exports = {
      docs,
      tree,
      getDoc,
      getTree,
      getDocs,
    };
  `;

  return { esmCode, cjsCode };
}

async function writeRuntime(runtimePath: string, data: ReturnType<typeof Docsmith.prototype.getDocsData>) {
  const { esmCode, cjsCode } = createRuntimeCode(data);

  // Write ESM version
  await fs.promises.writeFile(
    path.join(runtimePath, "index.js"),
    esmCode
  );

  // Write CJS version
  await fs.promises.writeFile(
    path.join(runtimePath, "index.cjs"),
    cjsCode
  );
}

async function invalidateModule(server: ViteDevServer, modulePath: string) {
  const module = server.moduleGraph.getModuleById(modulePath);
  if (module) {
    server.moduleGraph.invalidateModule(module);
    server.ws.send({
      type: 'update',
      updates: [{
        type: 'js-update',
        path: module.url,
        acceptedPath: module.url,
        timestamp: new Date().getTime() // Add timestamp for HMR
      }]
    });
  }
}

function createMainPlugin(docsmith: Docsmith): Plugin {
  let runtimePath: string;
  let root: string;

  return {
    name: "docsmith",

    configResolved(config) {
      root = config.root;
      runtimePath = path.join(config.root, "node_modules/@docsmith/runtime");
      if (!fs.existsSync(runtimePath)) {
        fs.mkdirSync(runtimePath, { recursive: true });
      }
    },

    configureServer(server) {
      server.httpServer?.once("listening", async () => {
        await docsmith.initialize(root);
        const data = docsmith.getDocsData();
        await writeRuntime(runtimePath, data);
      });

      server.watcher.on("change", async (filePath) => {
        if (filePath.endsWith(".md")) {
          await docsmith.processFile(root, filePath);
          const data = docsmith.getDocsData();
          await writeRuntime(runtimePath, data);
          await invalidateModule(server, path.join(runtimePath, "index.js"));
        }
      });

      server.watcher.on("add", async (filePath) => {
        if (filePath.endsWith(".md")) {
          await docsmith.processFile(root, filePath);
          const data = docsmith.getDocsData();
          await writeRuntime(runtimePath, data);
        }
      });

      server.watcher.on("unlink", async (filePath) => {
        if (filePath.endsWith(".md")) {
          // Instead of removeFile, we'll reinitialize
          await docsmith.initialize(root);
          const data = docsmith.getDocsData();
          await writeRuntime(runtimePath, data);
        }
      });
    },

    async buildStart() {
      await docsmith.initialize(root);
      const data = docsmith.getDocsData();
      await writeRuntime(runtimePath, data);
    },

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
  return [createMainPlugin(docsmith)];
}