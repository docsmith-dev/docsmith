export interface DocHeading {
  id: string;
  text: string;
  level: number;
  slug: string;
}

export interface Doc {
  content: string;
  frontmatter: Record<string, any>;
  slug: string;
  path: string;
  title: string;
  breadcrumbs: Array<{ name: string; slug: string }>;
  headings: DocHeading[];
}

export interface TreeItem {
  type: "group" | "doc";
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

export interface DocsmithConfig {
  order?: string[];
  directoryLabels?: Record<string, string>;
  [key: string]: any;
}

export interface Breadcrumb {
  name: string;
  slug: string;
}
