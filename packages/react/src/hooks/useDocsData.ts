import type { DocsData } from "@docsmith/core";
import { useEffect, useState } from "react";

export function useDocsData(): DocsData {
  const [data, setData] = useState<DocsData>({ docs: [], tree: [] });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try development mode first
        const module = await import("virtual:docsmith");
        setData({
          docs: module.docs,
          tree: module.tree,
        });
      } catch {
        // Fall back to production mode
        const response = await fetch("/docsmith-data.json");
        const jsonData = await response.json();
        setData(jsonData);
      }
    };

    loadData();
  }, []);

  return data;
}