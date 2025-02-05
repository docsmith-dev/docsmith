import type { Doc, TreeItem } from '@docsmith/core';

// This is for Vite to understand our virtual module
declare module 'virtual:docsmith' {
  export const docs: Doc[];
  export const tree: TreeItem[];
  export function getDoc(slug: string): Doc | null;
  export function getTree(): TreeItem[];
  export function getDocs(): Doc[];
  export default {
    docs: Doc[];
    tree: TreeItem[];
    getDoc: (slug: string) => Doc | null;
    getTree: () => TreeItem[];
    getDocs: () => Doc[];
  }
}

// This tells TypeScript about our runtime package
declare module '@docsmith/runtime' {
  export const docs: Doc[];
  export const tree: TreeItem[];
  export function getDoc(slug: string): Doc | null;
  export function getTree(): TreeItem[];
  export function getDocs(): Doc[];
  export default {
    docs: Doc[];
    tree: TreeItem[];
    getDoc: (slug: string) => Doc | null;
    getTree: () => TreeItem[];
    getDocs: () => Doc[];
  }
}