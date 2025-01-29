import { useState, useEffect } from "react";
import type { Doc } from "@docsmith/core";

export function useDoc(slug?: string): Doc | null {
  const [doc, setDoc] = useState<Doc | null>(null);

  useEffect(() => {
    // Import is inside useEffect where we can use async
    import("virtual:docsmith").then((module) => {
      // Find the doc by slug if provided, otherwise return null
      const foundDoc = slug
        ? module.docs.find((d: Doc) => d.slug === slug) || null
        : null;
      setDoc(foundDoc);
    });
  }, [slug]);

  return doc;
}
