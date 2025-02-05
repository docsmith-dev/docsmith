import { Docsmith } from "./docsmith.ts";

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
  lastUpdated: string;
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

export interface DocsmithSourcePluginHooks {
  beforeInitialize?: (docsmith: Docsmith) => Promise<void>;
}

export interface DocsmithContentPluginHooks {
  // Pre-parsing: Raw markdown string manipulation
  beforeParse?: (content: string) => Promise<string> | string;

  // Post-parsing: After frontmatter and markdown are separated
  afterParse?: (content: string) => Promise<string> | string;

  // Allows modifying the doc object after it's fully built
  transformDoc?: (doc: Doc) => Promise<Doc>;

  // Allows restructuring the navigation tree
  transformTree?: (tree: TreeItem[]) => TreeItem[];
}

export interface DocsmithPlugin {
  name: string;
  hooks?: DocsmithContentPluginHooks & DocsmithSourcePluginHooks;
}

export interface DocsmithOptions {
  folders?: string[];
  plugins?: DocsmithPlugin[];
}

export interface Breadcrumb {
  name: string;
  slug: string;
}
