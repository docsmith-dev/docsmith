import type {Plugin, ResolvedConfig, ViteDevServer} from "vite";
import {Doc, Docsmith, DocsmithOptions, TreeItem} from "@docsmith/core";
import * as path from "path";
import * as fs from "fs";

interface DocsmithData {
  docs: Doc[];
  tree: TreeItem[];
}

// Shared data store
let data: DocsmithData = { docs: [], tree: [] };
let initialized = false;
let initPromise: Promise<DocsmithData> | null = null;

/**
 * Invalidate a module in the module graph to trigger HMR
 */
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

export function createPlugin(options: DocsmithOptions = {}): Plugin[] {
  const docsmith = new Docsmith(options);
  let root: string;

  /**
   * Initialize Docsmith and store results in shared data
   */
  const initialize = async (rootDir: string): Promise<DocsmithData> => {
    // Skip if already initialized
    if (initialized) return data;

    // Return existing initialization promise if one is in progress
    if (initPromise) return initPromise;

    // Start new initialization
    initPromise = docsmith.initialize(rootDir).then(() => {
      const result = docsmith.getDocsData();
      data = result;
      initialized = true;
      console.log(`Docsmith initialized with ${data.docs.length} docs`);

      // Write data file for runtime package
      writeDataFile(data);

      return result;
    }).catch(error => {
      console.error("Docsmith initialization error:", error);
      return { docs: [], tree: [] };
    }).finally(() => {
      initPromise = null;
    });

    return initPromise;
  };

  /**
   * Reset initialization state and trigger reinitialization
   */
  const reinitialize = async (rootDir: string): Promise<DocsmithData> => {
    initialized = false;
    initPromise = null;
    return initialize(rootDir);
  };

  /**
   * Write data file for runtime package
   */
  const writeDataFile = (data: DocsmithData) => {
    try {
      // Create data directory
      const dataDir = path.resolve(process.cwd(), "docsmith-data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Write data as JSON file (no module syntax)
      const dataFilePath = path.join(dataDir, "data.json");
      const content = JSON.stringify({
        docs: data.docs,
        tree: data.tree
      }, null, 2);

      fs.writeFileSync(dataFilePath, content);
      console.log(`Generated Docsmith data file: ${dataFilePath}`);

      // Also write the data as a virtual file for runtime
      try {
        const nodeModulesPath = path.join(process.cwd(), "node_modules");
        if (fs.existsSync(nodeModulesPath)) {
          fs.writeFileSync(
            path.join(nodeModulesPath, ".docsmith-data"),
            JSON.stringify(data)
          );
        }
      } catch (err) {
        // Silently ignore errors writing to node_modules
      }
    } catch (error) {
      console.error("Error writing data file:", error);
    }
  };

  return [
    // Early initialization plugin
    {
      name: "docsmith:pre-init",
      enforce: "pre",
      apply: "build",

      configResolved(config: ResolvedConfig) {
        root = config.root;
        console.log("Pre-initializing Docsmith...");
        initialize(root).catch(err => {
          console.error("Failed to pre-initialize Docsmith:", err);
        });
      },
    },

    // Virtual module plugin
    {
      name: "docsmith:virtual",

      configResolved(config: ResolvedConfig) {
        root = config.root;
      },

      resolveId(id: string) {
        if (id === "virtual:docsmith" || id === "@docsmith/runtime") {
          return "\0docsmith-runtime";
        }
        return null;
      },

      load(id: string) {
        if (id === "\0docsmith-runtime") {
          // Start initialization if not already started
          if (!initialized && !initPromise) {
            initialize(root).catch(err => {
              console.error("Failed to initialize Docsmith:", err);
            });
          }

          // Generate module code with current data - inject as global variable
          const moduleCode = `
            // Replace the placeholder in the runtime module
            const __DOCSMITH_VIRTUAL_DATA__ = {
              docs: ${JSON.stringify(data.docs)},
              tree: ${JSON.stringify(data.tree)}
            };
            
            export const docs = __DOCSMITH_VIRTUAL_DATA__.docs;
            export const tree = __DOCSMITH_VIRTUAL_DATA__.tree;
            
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

          return moduleCode;
        }
        return null;
      },
    },

    // Core plugin
    {
      name: "docsmith:core",

      async buildStart() {
        await initialize(root);
      },

      // Combined transform method for both runtime module injection and markdown processing
      async transform(code, id) {
        // Process markdown files
        if (id.endsWith(".md") || id.endsWith(".mdx")) {
          try {
            await docsmith.processFile(root, id);
            return null;
          } catch (error) {
            console.error(`Error processing file ${id}:`, error);
            return null;
          }
        }

        // Detect if this is the runtime module
        if (id.includes('@docsmith/runtime') &&
          (id.endsWith('/index.js') || id.endsWith('/index.ts') ||
            id.endsWith('/index.mjs') || id.endsWith('/index.cjs'))) {

          // Inject the data directly into the module
          console.log('Transforming runtime module to inject data:', id);

          // Replace the __DOCSMITH_VIRTUAL_DATA__ reference with actual data
          const dataString = `{
            docs: ${JSON.stringify(data.docs)},
            tree: ${JSON.stringify(data.tree)}
          }`;

          return code.replace(
            'typeof __DOCSMITH_VIRTUAL_DATA__ !== \'undefined\'',
            'true'
          ).replace(
            '// @ts-ignore - This will be replaced during build\n      return __DOCSMITH_VIRTUAL_DATA__;',
            `return ${dataString};`
          );
        }

        return null;
      },

      configureServer(server: ViteDevServer) {
        server.httpServer?.once("listening", async () => {
          await initialize(root);
        });

        const handleFileChange = async (filePath: string) => {
          if (filePath.endsWith(".md") || filePath.endsWith(".mdx")) {
            try {
              await reinitialize(root);
              await invalidateModule(server, "\0docsmith-runtime");
            } catch (error) {
              console.error(`Error handling file change ${filePath}:`, error);
            }
          }
        };

        server.watcher.on("change", handleFileChange);
        server.watcher.on("add", handleFileChange);
        server.watcher.on("unlink", handleFileChange);

        server.ws.on("docsmith:update", async () => {
          try {
            await reinitialize(root);
          } catch (error) {
            console.error("Error rebuilding docs:", error);
          }
        });
      },
    },
  ];
}