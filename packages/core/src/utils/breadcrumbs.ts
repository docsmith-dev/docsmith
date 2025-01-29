import path from "path";
import { Breadcrumb } from "../types.ts";

export function generateBreadcrumbs(relativePath: string) {
  const parts = relativePath.split(path.sep);
  const breadcrumbs: Breadcrumb[] = [];
  let currentSlug = "";

  parts.forEach((part) => {
    currentSlug = currentSlug
      ? path.join(currentSlug, part.replace(".md", ""))
      : part.replace(".md", "");
    breadcrumbs.push({
      name: part.replace(".md", ""),
      slug: currentSlug,
    });
  });

  return breadcrumbs;
}
