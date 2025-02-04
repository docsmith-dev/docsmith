// packages/source-github/src/index.ts

import type { DocsmithPlugin } from '@docsmith/core';

interface GithubContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  content?: string;
  encoding?: string;
}

export interface GithubSourceOptions {
  /** Repository owner/org */
  owner: string;
  /** Repository name */
  repo: string;
  /** Branch name (default: main) */
  branch?: string;
  /** Path within the repository to load docs from */
  path?: string;
  /** GitHub personal access token (optional) */
  token?: string;
}

async function fetchGithubContents(
  options: GithubSourceOptions,
  path: string = ""
): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  const headers: Record<string, string> = {
    "Accept": "application/vnd.github.v3+json",
  };

  if (options.token) {
    headers["Authorization"] = `token ${options.token}`;
  }

  const url = `https://api.github.com/repos/${options.owner}/${options.repo}/contents/${path}?ref=${options.branch || "main"}`;

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.statusText}`);
  }

  const contents: GithubContent[] = await response.json() as GithubContent[];

  for (const item of contents) {
    if (item.type === "dir") {
      const subFiles = await fetchGithubContents(
        options,
        item.path
      );
      subFiles.forEach((content, filePath) => {
        files.set(filePath, content);
      });
    } else if (item.type === "file" && item.name.endsWith(".md")) {
      const fileResponse = await fetch(item.download_url!, { headers });
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file ${item.path}`);
      }
      const content = await fileResponse.text();
      files.set(item.path, content);
    }
  }

  return files;
}

export function createGithubSourcePlugin(options: GithubSourceOptions): DocsmithPlugin {
  let sourceFiles = new Map<string, string>();

  return {
    name: "docsmith-source-github",
    hooks: {
      transformDoc: async (doc) => {
        // Passthrough transform
        return doc;
      },
      beforeParse: async (content: string) => {
        // Initialize if not already done
        if (sourceFiles.size === 0) {
          sourceFiles = await fetchGithubContents(options, options.path);
        }
        return content;
      },
      afterParse: async (content: string) => {
        return content;
      },
    }
  };
}