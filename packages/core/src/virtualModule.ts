import type { Plugin } from 'vite';
import { docsmith } from './docsmith';

export function createVirtualModule(): Plugin {
  return {
    name: 'docsmith:virtual',
    resolveId(id: string) {
      if (id === 'virtual:docsmith') {
        return '\0virtual:docsmith';
      }
      return null;
    },
    load(id: string) {
      if (id === '\0virtual:docsmith') {
        const docsData = docsmith.getDocsData();
        return `
          export const docs = ${JSON.stringify(docsData.docs)};
          export const tree = ${JSON.stringify(docsData.tree)};
          export function getDoc(slug) {
            return docs.find(doc => doc.slug === slug) || null;
          }
        `;
      }
      return null;
    }
  };
}
