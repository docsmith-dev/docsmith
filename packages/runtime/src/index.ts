import type { Doc, TreeItem } from '@docsmith/core';

// Export core types that might be needed
export type { Doc, TreeItem };

// Declare the functions and variables that will be provided by the virtual module
export declare const docs: Doc[];
export declare const tree: TreeItem[];
export declare function getDoc(slug: string): Doc | null;
export declare function getTree(): TreeItem[];
export declare function getDocs(): Doc[];