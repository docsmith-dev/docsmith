declare module "virtual:docsmith" {
  import type { Doc, TreeItem } from "@docsmith/core";

  export const docs: Doc[];
  export const tree: TreeItem[];
}

declare module "@docsmith/virtual" {
  export * from "virtual:docsmith";
}