declare module "virtual:docsmith" {
  import type { Doc, TreeItem } from "@docsmith/core";

  export const docs: Doc[];
  export const tree: TreeItem[];
  export function getDoc(slug: string): Doc | null;
}

// Add production module type
declare module "@docsmith/virtual" {
  export * from "virtual:docsmith";
}
