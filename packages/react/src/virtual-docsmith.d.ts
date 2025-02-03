declare module "virtual:docsmith" {
  import type { Doc, TreeItem } from "@docsmith/core";

  export const docs: Doc[];
  export const tree: TreeItem[];
  export function getDoc(slug: string): Doc | null;
  export function getTree(): TreeItem[];
}

declare module "@docsmith/virtual" {
  export * from "virtual:docsmith";
}
