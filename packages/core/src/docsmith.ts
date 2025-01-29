import matter from "gray-matter";
import fs from "fs";
import path from "path";
import type { Doc, DocsData, DocsmithConfig } from "./types";
import { generateBreadcrumbs } from "./utils/breadcrumbs";
import { buildTree } from "./utils/tree";

export class Docsmith {
  private docsMap = new Map<string, Doc>();
  private globalConfig: DocsmithConfig = {};
  private directoryConfigs = new Map<string, DocsmithConfig>();

  constructor(private readonly options: { folders?: string[] } = {}) {
    this.options = {
      folders: options.folders ?? ["docs"],
    };
  }
  async initialize(rootDir: string) {
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
      path.join(rootDir, "docs", "docs.config.json"),
    );

    // Recursively load directory configs
    const loadDirectoryConfigs = async (
      dir: string,
      parentConfig: DocsmithConfig = {},
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
            currentConfig,
          );
        }
      }
    };

    // Ensure folders is defined before iteration
    const folders = this.options.folders ?? ["docs"];
    for (const folder of folders) {
      await loadDirectoryConfigs(
        path.resolve(rootDir, folder),
        this.globalConfig,
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

  async processFile(rootDir: string, filePath: string) {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const { content: markdownContent, data } = matter(content);
    const relativePath = path.relative(path.join(rootDir, "docs"), filePath);

    this.docsMap.set(relativePath, {
      content: markdownContent,  // Just store raw markdown
      frontmatter: data,
      slug: relativePath.replace(/\.md$/, ""),
      path: relativePath,
      name: path.basename(relativePath, ".md"),
      breadcrumbs: generateBreadcrumbs(relativePath),
    });
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
          if (file.endsWith(".md")) {
            await this.processFile(rootDir, path.join(folderPath, file));
          }
        }
      } catch (error) {
        console.error(`Error processing files in ${folderPath}:`, error);
      }
    }
  }

  getDocsData(): DocsData {
    return {
      docs: Array.from(this.docsMap.values()),
      tree: buildTree(
        Array.from(this.docsMap.values()),
        this.getConfigForPath.bind(this),
      ),
    };
  }

  getDoc(slug: string): Doc | null {
    return this.docsMap.get(slug) || null;
  }
}

export const docsmith = new Docsmith();
