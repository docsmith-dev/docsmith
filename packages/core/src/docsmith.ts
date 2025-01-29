import matter from "gray-matter";
import fs from "fs";
import path from "path";
import type { Doc, DocsData, DocsmithConfig } from './types';
import { createMarkdownProcessor } from './utils/processor';
import { generateBreadcrumbs } from './utils/breadcrumbs';
import { buildTree } from './utils/tree';

export class Docsmith {
  private docsMap = new Map<string, Doc>();
  private globalConfig: DocsmithConfig = {};
  private directoryConfigs = new Map<string, DocsmithConfig>();
  private markdownProcessor = createMarkdownProcessor();

  constructor(private readonly options: { folders?: string[] } = {}) {
    this.options.folders = options.folders ?? ["docs"];
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
      path.join(rootDir, "docs", "docs.config.json")
    );

    // Recursively load directory configs
    const loadDirectoryConfigs = async (dir: string, parentConfig: DocsmithConfig = {}) => {
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
          await loadDirectoryConfigs(path.join(dir, subdir.name), currentConfig);
        }
      }
    };

    for (const folder of this.options.folders) {
      await loadDirectoryConfigs(path.resolve(rootDir, folder), this.globalConfig);
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

  private async processFile(rootDir: string, filePath: string) {
    const content = await fs.promises.readFile(filePath, "utf-8");
    const { content: markdownContent, data } = matter(content);
    const processedContent = await this.markdownProcessor.process(markdownContent);
    const relativePath = path.relative(path.join(rootDir, "docs"), filePath);

    const breadcrumbs = generateBreadcrumbs(relativePath);

    this.docsMap.set(relativePath, {
      content: processedContent.toString(),
      frontmatter: data,
      slug: relativePath.replace(/\.md$/, ""),
      path: relativePath,
      name: path.basename(relativePath, ".md"),
      breadcrumbs,
    });
  }

  private async processAllFiles(rootDir: string) {
    for (const folder of this.options.folders) {
      const folderPath = path.resolve(rootDir, folder);
      const files = await fs.promises.readdir(folderPath, {
        recursive: true,
      });
      for (const file of files) {
        if (file.endsWith(".md")) {
          await this.processFile(rootDir, path.join(folderPath, file));
        }
      }
    }
  }

  getDocsData(): DocsData {
    return {
      docs: Array.from(this.docsMap.values()),
      tree: buildTree(Array.from(this.docsMap.values()), this.getConfigForPath.bind(this)),
    };
  }

  getDoc(slug: string): Doc | null {
    return this.docsMap.get(slug) || null;
  }
}

export const docsmith = new Docsmith();
