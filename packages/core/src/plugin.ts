// packages/core/src/plugin.ts
import { Plugin } from 'vite';
import { createFilter } from "@rollup/pluginutils";
import matter from "gray-matter";
import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import type { Doc, DocsData } from './types';
import { createMarkdownProcessor } from './utils/processor';
import { generateBreadcrumbs } from './utils/breadcrumbs';
import { buildTree } from './utils/tree';

interface HeadlessDocsOptions {
  folders?: string[];
  include?: string | RegExp | Array<string | RegExp>;
  exclude?: string | RegExp | Array<string | RegExp>;
}

export default function headlessDocs(options: HeadlessDocsOptions = {}): Plugin {
  const { folders = ["docs"], include, exclude } = options;

  const includePatterns = folders.map((folder) => `${folder}/**/*.md`);
  const filterInclude = include || includePatterns;
  const filter = createFilter(filterInclude, exclude);
  const docsMap = new Map<string, Doc>();
  let config: any;
  let watcher: chokidar.FSWatcher;
  let viteServer: any;
  let globalConfig = {};
  let directoryConfigs = new Map<string, any>();

  const markdownProcessor = createMarkdownProcessor();

  async function loadConfigs() {
    const loadConfig = async (configPath: string) => {
      try {
        const content = await fs.promises.readFile(configPath, "utf-8");
        return JSON.parse(content);
      } catch (error) {
        console.warn(
          `Failed to load config at ${configPath}: ${error.message}`
        );
        return {};
      }
    };

    globalConfig = await loadConfig(
      path.join(config.root, "docs", "docs.config.json")
    );

    // Recursively load directory configs
    const loadDirectoryConfigs = async (dir: string, parentConfig = {}) => {
      const configPath = path.join(dir, "_directory.config.json");
      const relativeDir = path.relative(path.join(config.root, "docs"), dir);
      let currentConfig = await loadConfig(configPath);

      // Merge with parent config
      currentConfig = {
        ...parentConfig,
        ...currentConfig,
        order: [...(parentConfig.order || []), ...(currentConfig.order || [])],
        directoryLabels: {
          ...parentConfig.directoryLabels,
          ...currentConfig.directoryLabels,
        },
      };

      directoryConfigs.set(relativeDir || ".", currentConfig);

      const subdirs = await fs.promises.readdir(dir, { withFileTypes: true });
      for (const subdir of subdirs) {
        if (subdir.isDirectory()) {
          await loadDirectoryConfigs(
            path.join(dir, subdir.name),
            currentConfig
          );
        }
      }
    };

    for (const folder of folders) {
      await loadDirectoryConfigs(
        path.resolve(config.root, folder),
        globalConfig
      );
    }
  }

  function getConfigForPath(itemPath: string) {
    const pathParts = itemPath.split(path.sep);
    let currentPath = "";
    let currentConfig = { ...globalConfig };

    for (const part of pathParts) {
      currentPath = path.join(currentPath, part);
      const dirConfig = directoryConfigs.get(currentPath);
      if (dirConfig) {
        currentConfig = { ...currentConfig, ...dirConfig };
      }
    }

    return currentConfig;
  }

  async function processFile(filePath: string) {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const { content: markdownContent, data } = matter(content);
    const processedContent = await markdownProcessor.process(markdownContent);
    const relativePath = path.relative(
      path.join(config.root, "docs"),
      filePath
    );

    const breadcrumbs = generateBreadcrumbs(relativePath);

    docsMap.set(relativePath, {
      content: processedContent.toString(),
      frontmatter: data,
      slug: relativePath.replace(/\.md$/, ""),
      path: relativePath,
      name: path.basename(relativePath, ".md"),
      breadcrumbs,
    });

    if (viteServer) {
      viteServer.ws.send({
        type: "full-reload",
        path: "*",
      });
      viteServer.moduleGraph.invalidateAll();
    }
  }

  return {
    name: "docsmith",

    async configResolved(resolvedConfig) {
      config = resolvedConfig;
      await loadConfigs();
    },

    async buildStart() {
      // Initial processing of all markdown files
      for (const folder of folders) {
        const folderPath = path.resolve(config.root, folder);
        const files = await fs.promises.readdir(folderPath, {
          recursive: true,
        });
        for (const file of files) {
          if (file.endsWith(".md")) {
            await processFile(path.join(folderPath, file));
          }
        }
      }

      // Set up watcher for file changes
      const watchPatterns = folders.map((folder) =>
        path.resolve(config.root, folder, "**/*.md")
      );
      watcher = chokidar.watch(watchPatterns, {
        ignored: exclude,
        persistent: true,
      });

      watcher.on("add", processFile);
      watcher.on("change", processFile);
      watcher.on("unlink", (filePath) => {
        const relativePath = path.relative(
          path.join(config.root, "docs"),
          filePath
        );
        docsMap.delete(relativePath);
        if (viteServer) {
          viteServer.ws.send({
            type: "full-reload",
            path: "*",
          });
          viteServer.moduleGraph.invalidateAll();
        }
      });
    },

    configureServer(server) {
      viteServer = server;
    },

    async closeBundle() {
      if (watcher) {
        await watcher.close();
      }
    },

    resolveId(source) {
      if (source === "virtual:headless-docs") {
        return source;
      }
      return null;
    },

    load(id) {
      if (id === "virtual:headless-docs") {
        const docsData: DocsData = {
          docs: Array.from(docsMap.values()),
          tree: buildTree(Array.from(docsMap.values()), getConfigForPath),
        };

        return `
          const docsData = ${JSON.stringify(docsData)};
          export const docs = docsData.docs;
          export const tree = docsData.tree;
          
          export function getDoc(slug) {
            return docsData.docs.find(doc => doc.slug === slug) || null;
          }
        `;
      }
      return null;
    },
  };
}