// packages/source-github/src/index.ts
import type { DocsmithPlugin } from '@docsmith/core';
import path from 'path';

export interface GithubSourceOptions {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
  token?: string;
}

interface GithubContent {
  name: string;
  path: string;
  download_url: string | null;
  type: "file" | "dir";
}

export function createGithubSourcePlugin(options: GithubSourceOptions): DocsmithPlugin {
  const plugin: DocsmithPlugin = {
    name: "docsmith-source-github",
    hooks: {
      beforeInitialize: async (docsmith) => {
        console.log('[GitHub Source] Starting file fetch from GitHub...');
        const files = await fetchGithubFiles(options);
        console.log(`[GitHub Source] Fetched ${files.size} files from GitHub`);

        for (const [filePath, content] of files.entries()) {
          console.log(`[GitHub Source] Processing ${filePath}`);
          await docsmith.addDocument({
            content,
            slug: filePath.replace(/\.mdx?$/, ''),
            path: filePath,
            title: path.basename(filePath, path.extname(filePath)),
            frontmatter: {}, // You might want to parse frontmatter here
            breadcrumbs: generateBreadcrumbs(filePath),
            headings: [] // You might want to extract headings here
          });
        }
        console.log('[GitHub Source] Completed adding documents');
      }
    }
  };

  return plugin;
}

async function fetchGithubFiles(options: GithubSourceOptions): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
  };

  if (options.token) {
    headers["Authorization"] = `token ${options.token}`;
  }


  async function processContent(currentPath: string) {
    const encodedPath = currentPath ? encodeURIComponent(currentPath) : '';
    const url = `https://api.github.com/repos/${options.owner}/${options.repo}/contents/${encodedPath}?ref=${options.branch || "main"}`;


    try {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        return;
      }

      const contents: GithubContent[] = await response.json();

      for (const item of contents) {
        if (item.type === "dir") {
          await processContent(item.path);
        } else if (item.type === "file" && (item.name.endsWith(".md") || item.name.endsWith(".mdx"))) {
          if (!item.download_url) {
            continue;
          }

          try {
            const fileResponse = await fetch(item.download_url, { headers });
            if (!fileResponse.ok) {
              continue;
            }

            const content = await fileResponse.text();
            files.set(item.path, content);
          } catch (error) {
            console.error(`[GitHub Source] Error fetching ${item.download_url}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`[GitHub Source] Error processing ${url}:`, error);
      if (error instanceof Error) {
        console.error(error.stack);
      }
    }
  }

  await processContent(options.path || '');
  return files;
}

function generateBreadcrumbs(filePath: string) {
  return filePath.split('/').map((part, index, parts) => ({
    name: part.replace(/\.mdx?$/, ''),
    slug: parts.slice(0, index + 1).join('/').replace(/\.mdx?$/, '')
  }));
}