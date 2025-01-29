import type {DocsData} from "@docsmith/core";
import type {Doc} from "@docsmith/core/src";

declare module 'virtual:docsmith' {
  export const docs: DocsData['docs'];
  export const tree: DocsData['tree'];
  export function getDoc(slug: string): Doc | null;
}

export function useDocsData() {
  return {
    docs: docs,
    tree: tree,
  };
}

