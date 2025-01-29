export interface Doc {
  content: string;
  frontmatter: Record<string, any>;
  slug: string;
  path: string;
  name: string;
  breadcrumbs: Array<{ name: string; slug: string }>;
}

export interface TreeItem {
  type: 'group' | 'doc';
  name: string;
  items?: TreeItem[];
  slug?: string;
  frontmatter?: Record<string, any>;
  label?: string;
  breadcrumbs?: Array<{ name: string; slug: string }>;
}

export interface DocsData {
  docs: Doc[];
  tree: TreeItem[];
}

export interface DirectoryConfig {
  order?: string[];
  directoryLabels?: Record<string, string>;
  [key: string]: any;
}