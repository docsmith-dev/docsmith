import { useState, useEffect } from "react";
import type { Doc } from "@docsmith/core";

export function useDoc(slug?: string): Doc | null {
  const [doc, setDoc] = useState<Doc | null>(null);

  useEffect(() => {
    import("virtual:docsmith").then((module) => {
      const foundDoc = slug
        ? module.docs.find((d: Doc) => d.slug === slug) || null
        : null;
      setDoc(foundDoc);
    });
  }, [slug]);

  return doc;
}
