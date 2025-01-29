import { docsmith } from '@docsmith/core';
import { useState, useEffect } from 'react';
import type { DocsData } from '@docsmith/core';

export function useDocsData(): DocsData {
  const [data, setData] = useState<DocsData>({ docs: [], tree: [] });

  useEffect(() => {
    docsmith.initialize(process.cwd()).then(() => {
      setData(docsmith.getDocsData());
    });
  }, []);

  return data;
}

