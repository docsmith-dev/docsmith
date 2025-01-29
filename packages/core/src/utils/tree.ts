import path from 'path';
import type { Doc, TreeItem } from '../types';

export function buildTree(files: Doc[], getConfigForPath: (path: string) => any): TreeItem[] {
  const root: TreeItem = { name: "root", items: [], type: "group" };

  files.forEach((file) => {
    const parts = file.path.split(path.sep);
    let currentNode = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = path.join(currentPath, part);
      const currentConfig = getConfigForPath(currentPath);

      if (index === parts.length - 1) {
        // This is a file
        currentNode.items?.push({
          type: "doc",
          name: part.replace(".md", ""),
          slug: file.slug,
          frontmatter: file.frontmatter,
          label:
            file.frontmatter.title ||
            currentConfig.directoryLabels[part.replace(".md", "")] ||
            part.replace(".md", ""),
          breadcrumbs: file.breadcrumbs,
        });
      } else {
        // This is a directory
        let child = currentNode.items?.find(
          (item) => item.type === "group" && item.name === part
        );
        if (!child) {
          child = {
            type: "group",
            name: part,
            items: [],
            label: currentConfig.directoryLabels[part] || part,
          };
          currentNode.items?.push(child);
        }
        currentNode = child;
      }
    });
  });

  // Sort items at each level
  function sortRecursively(node: TreeItem, parentPath = "") {
    const currentPath = path.join(parentPath, node.name);
    const config = getConfigForPath(currentPath);
    const orderArray = config.order || [];

    node.items?.sort((a, b) => {
      const indexA = orderArray.indexOf(a.name);
      const indexB = orderArray.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    node.items?.forEach((item) => {
      if (item.type === "group") {
        sortRecursively(item, currentPath);
      }
    });
  }

  sortRecursively(root);

  return root.items || [];
}