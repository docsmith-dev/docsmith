import type { DocsData } from "@docsmith/core";
import { useEffect, useState } from "react";

export function useDocsData(): DocsData {
  const [data, setData] = useState<DocsData>({ docs: [], tree: [] });

  useEffect(() => {
    // Import is inside useEffect where we can use async
    import("virtual:docsmith").then((module) => {
      setData({
        docs: module.docs,
        tree: module.tree,
      });
    });
  }, []);

  return data;
}
