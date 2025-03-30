import type {Plugin, ResolvedConfig, ViteDevServer} from "vite";
import {Doc, Docsmith, DocsmithOptions, TreeItem} from "@docsmith/core";

interface DocsmithData {
  docs: Doc[];
  tree: TreeItem[];
}

async function invalidateModule(server: ViteDevServer, moduleId: string) {
  const mod = server.moduleGraph.getModuleById(moduleId);
  if (mod) {
    server.moduleGraph.invalidateModule(mod);
    server.ws.send({
      type: "custom",
      event: "docsmith:update",
      data: null,
    });
  }
}


function createMainPlugin(docsmith: Docsmith): Plugin[] {
  let root: string;
  let data: DocsmithData | null = null;

  return [
    // Virtual module handling - needs to run early
    {
      name: "docsmith:virtual",
      enforce: "pre",

      resolveId(id: string) {
        if (id === "virtual:docsmith" || id === "@docsmith/runtime") {
          return "\0docsmith-runtime";
        }
        return null;
      },

      async load(id: string) {
        if (id === "\0docsmith-runtime") {
          if (!data) {
            await docsmith.initialize(root);
            data = docsmith.getDocsData();
          }

          return `
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

            export default { docs, tree, getDoc, getTree, getDocs };
          `;
        }
        return null;
      },
    },

    // Doc processing - can run after MDX
    {
      name: "docsmith:core",
      enforce: "post",

      configResolved(config: ResolvedConfig) {
        root = config.root;
      },

      async buildStart() {
        try {
          await docsmith.initialize(root);
          data = docsmith.getDocsData();
        } catch (error) {
          console.error("Docsmith Initialization Error:", error);
          throw error;
        }
      },

      configureServer(server: ViteDevServer) {
        // Initialize on server start
        server.httpServer?.once("listening", async () => {
          try {
            await docsmith.initialize(root);
            data = docsmith.getDocsData();
          } catch (error) {
            console.error("Error initializing Docsmith:", error);
          }
        });

        // Handle file changes
        server.watcher.on("change", async (filePath) => {
          if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            try {
              await docsmith.initialize(root);
              data = docsmith.getDocsData();
              await invalidateModule(server, "\0docsmith-runtime");
            } catch (error) {
              console.error(
                `Error processing changed file ${filePath}:`,
                error
              );
            }
          }
        });

        // Handle new files
        server.watcher.on("add", async (filePath) => {
          if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            try {
              await docsmith.initialize(root);
              data = docsmith.getDocsData();
              await invalidateModule(server, "\0docsmith-runtime");
            } catch (error) {
              console.error(`Error processing new file ${filePath}:`, error);
            }
          }
        });

        // Handle deleted files
        server.watcher.on("unlink", async (filePath) => {
          if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            try {
              await docsmith.initialize(root);
              data = docsmith.getDocsData();
              await invalidateModule(server, "\0docsmith-runtime");
            } catch (error) {
              console.error(`Error handling deleted file ${filePath}:`, error);
            }
          }
        });

        // Listen for manual update events
        server.ws.on("docsmith:update", async () => {
          try {
            await docsmith.initialize(root);
            data = docsmith.getDocsData();
          } catch (error) {
            console.error("Error rebuilding docs:", error);
          }
        });
      },
    },
  ];
}

export function createPlugin(options: DocsmithOptions = {}): Plugin[] {
  const docsmith = new Docsmith(options);
  return createMainPlugin(docsmith);
}
