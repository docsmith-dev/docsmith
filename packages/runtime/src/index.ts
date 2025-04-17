// packages/runtime/src/index.ts
import type { Doc, TreeItem } from "@docsmith/core";
import fs from 'fs';
import path from 'path';

// Export types
export type { Doc, TreeItem };

// Function to load data from file
function loadDataFromFile(): { docs: Doc[], tree: TreeItem[] } {
  // Skip in browser environment
  if (typeof window !== 'undefined') {
    console.log('Running in browser environment, using empty data');
    return { docs: [], tree: [] };
  }

  try {
    // Try to load from JSON file
    const dataPath = path.join(process.cwd(), 'docsmith-data', 'data.json');
    console.log('Attempting to load Docsmith data from:', dataPath);

    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(fileContent);

      if (data && Array.isArray(data.docs)) {
        console.log(`Successfully loaded ${data.docs.length} docs from file`);
        return {
          docs: data.docs,
          tree: data.tree || []
        };
      }
    }

    // Try the hidden file in node_modules as fallback
    const hiddenDataPath = path.join(process.cwd(), 'node_modules', '.docsmith-data');
    if (fs.existsSync(hiddenDataPath)) {
      console.log('Loading from fallback path:', hiddenDataPath);
      const fileContent = fs.readFileSync(hiddenDataPath, 'utf8');
      const data = JSON.parse(fileContent);

      if (data && Array.isArray(data.docs)) {
        console.log(`Successfully loaded ${data.docs.length} docs from fallback file`);
        return {
          docs: data.docs,
          tree: data.tree || []
        };
      }
    }
  } catch (error) {
    console.warn('Error loading Docsmith data:', error instanceof Error ? error.message : String(error));
  }

  // If we've reached here and the __DOCSMITH_VIRTUAL_DATA__ exists,
  // it was injected during build by the virtual module system
  if (typeof __DOCSMITH_VIRTUAL_DATA__ !== 'undefined') {
    try {
      console.log('Using injected virtual data');
      // @ts-ignore - This will be replaced during build
      return __DOCSMITH_VIRTUAL_DATA__;
    } catch (e) {
      // Ignore any errors
    }
  }

  console.warn('Falling back to empty data');
  return { docs: [], tree: [] };
}

// Load the data
const { docs, tree } = loadDataFromFile();

// Export loaded data
export { docs, tree };

/**
 * Get a document by its slug
 */
export function getDoc(slug: string): Doc | null {
  if (!slug) {
    console.warn('getDoc called with empty slug');
    return null;
  }

  if (!Array.isArray(docs) || docs.length === 0) {
    console.warn('getDoc called but docs array is empty');
    return null;
  }

  const doc = docs.find(doc => doc.slug === slug);
  if (!doc) {
    console.warn(`No document found with slug: ${slug}`);
    // Log available slugs for debugging
    if (docs.length > 0) {
      console.log('Available slugs:', docs.map(d => d.slug).join(', '));
    }
  }

  return doc || null;
}

/**
 * Get the full navigation tree
 */
export function getTree(): TreeItem[] {
  return tree;
}

/**
 * Get all documents
 */
export function getDocs(): Doc[] {
  return docs;
}

// Default export
export default {
  docs,
  tree,
  getDoc,
  getTree,
  getDocs
};

// For TypeScript - this will be replaced during build
declare const __DOCSMITH_VIRTUAL_DATA__: { docs: Doc[], tree: TreeItem[] } | undefined;