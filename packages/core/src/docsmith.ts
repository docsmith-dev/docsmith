import matter from "gray-matter";
import fs from "fs";
import path from "path";
import type {
  Doc,
  DocsData,
  DocsmithConfig,
  DocsmithOptions,
  DocsmithPlugin,
  TreeItem,
} from "./types";
import { generateBreadcrumbs } from "./utils/breadcrumbs";
import { buildTree } from "./utils/tree";
import { extractHeadings } from "./utils/headings.ts";

export class Docsmith {
  private docsMap = new Map<string, Doc>();
  private globalConfig: DocsmithConfig = {};
  private directoryConfigs = new Map<string, DocsmithConfig>();
  private readonly plugins: DocsmithPlugin[] = [];

  constructor(private readonly options: DocsmithOptions = {}) {
    this.options = {
      folders: options.folders ?? ["docs"],
    };
    this.plugins = this.options.plugins ?? [];
  }

  private async runBeforeParse(content: string): Promise<string> {
    let result = content;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.beforeParse) {
        // Convert both sync and async results to Promises
        result = await Promise.resolve(plugin.hooks.beforeParse(result));
      }
    }
    return result;
  }

  private async runAfterParse(content: string): Promise<string> {
    let result = content;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.afterParse) {
        result = await Promise.resolve(plugin.hooks.afterParse(result));
      }
    }
    return result;
  }

  private async runTransformDoc(doc: Doc): Promise<Doc> {
    let result = doc;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.transformDoc) {
        result = await plugin.hooks.transformDoc(result);
      }
    }
    return result;
  }

  private runTransformTree(tree: TreeItem[]): TreeItem[] {
    let result = tree;
    for (const plugin of this.plugins) {
      if (plugin.hooks?.transformTree) {
        // transformTree is sync-only so no Promise handling needed
        result = plugin.hooks.transformTree(result);
      }
    }
    return result;
  }

  async initialize(rootDir: string) {
    // First run beforeInitialize hooks
    for (const plugin of this.plugins) {
      if (plugin.hooks?.beforeInitialize) {
        await plugin.hooks.beforeInitialize(this);
      }
    }

    await this.loadConfigs(rootDir);
    await this.processAllFiles(rootDir);
    return this;
  }

  private async loadConfigs(rootDir: string) {
    const loadConfig = async (configPath: string): Promise<DocsmithConfig> => {
      try {
        const content = await fs.promises.readFile(configPath, "utf-8");
        return JSON.parse(content);
      } catch {
        return {};
      }
    };

    this.globalConfig = await loadConfig(
      path.join(rootDir, "docs", "docs.config.json")
    );

    // Recursively load directory configs
    const loadDirectoryConfigs = async (
      dir: string,
      parentConfig: DocsmithConfig = {}
    ) => {
      const configPath = path.join(dir, "_directory.config.json");
      const relativeDir = path.relative(path.join(rootDir, "docs"), dir);
      let currentConfig = await loadConfig(configPath);

      currentConfig = {
        ...parentConfig,
        ...currentConfig,
        order: [...(parentConfig.order || []), ...(currentConfig.order || [])],
        directoryLabels: {
          ...(parentConfig.directoryLabels || {}),
          ...(currentConfig.directoryLabels || {}),
        },
      };

      this.directoryConfigs.set(relativeDir || ".", currentConfig);

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

    // Ensure folders is defined before iteration
    const folders = this.options.folders ?? ["docs"];
    for (const folder of folders) {
      await loadDirectoryConfigs(
        path.resolve(rootDir, folder),
        this.globalConfig
      );
    }
  }

  private getConfigForPath(itemPath: string): DocsmithConfig {
    const pathParts = itemPath.split(path.sep);
    let currentPath = "";
    let currentConfig = { ...this.globalConfig };

    for (const part of pathParts) {
      currentPath = path.join(currentPath, part);
      const dirConfig = this.directoryConfigs.get(currentPath);
      if (dirConfig) {
        currentConfig = {
          ...currentConfig,
          ...dirConfig,
          order: [...(currentConfig.order || []), ...(dirConfig.order || [])],
          directoryLabels: {
            ...(currentConfig.directoryLabels || {}),
            ...(dirConfig.directoryLabels || {}),
          },
        };
      }
    }

    return currentConfig;
  }

  async processFile(
    rootDir: string,
    filePath: string,
  ) {
    let content = await fs.promises.readFile(filePath, "utf-8");

    content = await this.runBeforeParse(content);
    const { content: markdownContent, data } = matter(content);
    const processedContent = await this.runAfterParse(markdownContent);

    const relativePath = path.relative(path.join(rootDir, "docs"), filePath);
    const headings = await extractHeadings(processedContent);
    const stats = await fs.promises.stat(filePath);

    // @ts-ignore
    let doc: Doc = {
      content: processedContent,
      rawContent: content, // Store the original content with frontmatter
      frontmatter: data,
      slug: relativePath.replace(/\.(md|mdx)$/, ""),
      path: relativePath,
      title: data.title || path.basename(relativePath).replace(/\.(md|mdx)$/, ""),
      breadcrumbs: generateBreadcrumbs(relativePath),
      headings,
      lastUpdated: stats.mtime.toISOString(),
      isMarkdown: filePath.endsWith('.md'),
      isMDX: filePath.endsWith('.mdx'),
      navigation: { previous: null, next: null },
    };

    doc = await this.runTransformDoc(doc);
    this.docsMap.set(relativePath, doc);
  }
  private async processAllFiles(rootDir: string) {
    const folders = this.options.folders ?? ["docs"];

    for (const folder of folders) {
      const folderPath = path.resolve(rootDir, folder);
      try {
        const files = await fs.promises.readdir(folderPath, {
          recursive: true,
        });

        // Ensure files is defined before proceeding
        if (!files) continue;

        for (const file of files) {
          if (file.endsWith(".md") || file.endsWith(".mdx")) {
            await this.processFile(rootDir, path.join(folderPath, file));
          }
        }
      } catch (error) {
        console.error(`Error processing files in ${folderPath}:`, error);
      }
    }
  }

  getDocsData(): DocsData {
    const docs = Array.from(this.docsMap.values());
    let tree = buildTree(docs, this.getConfigForPath.bind(this));
    tree = this.runTransformTree(tree);

    const flattenTree = (items: TreeItem[]): TreeItem[] => {
      const flattened: TreeItem[] = [];
      for (const item of items) {
        if (item.type === "doc") {
          flattened.push(item);
        } else if (item.type === "group" && item.items) {
          flattened.push(...flattenTree(item.items));
        }
      }
      return flattened;
    };

    const docItems = flattenTree(tree).filter(
      (item) => item.type === "doc" && item.slug
    );

    docItems.forEach((item, index) => {
      const doc = docs.find((d) => d.slug === item.slug);
      if (!doc) return;

      doc.navigation = {
        previous:
          index > 0
            ? {
                title: docItems[index - 1].label || docItems[index - 1].name,
                slug: docItems[index - 1].slug!,
                label: docItems[index - 1].label,
              }
            : null,
        next:
          index < docItems.length - 1
            ? {
                title: docItems[index + 1].label || docItems[index + 1].name,
                slug: docItems[index + 1].slug!,
                label: docItems[index + 1].label,
              }
            : null,
      };
    });

    return {
      docs,
      tree,
    };
  }

  getDoc(slug: string): Doc | null {
    return this.docsMap.get(slug) || null;
  }
}
