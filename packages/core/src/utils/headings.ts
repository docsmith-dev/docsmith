import * as remark from "remark";
import * as mdast from "mdast";
import slugify from "slugify";
import { DocHeading } from "../types.ts";

export async function extractHeadings(content: string): Promise<DocHeading[]> {
  const headings: DocHeading[] = [];

  const tree = await remark.remark().parse(content);

  (function walk(node: mdast.Content) {
    if (node.type === "heading") {
      const headingNode = node as mdast.Heading;
      const text = headingNode.children
        .map((child) => (child as mdast.Text).value)
        .join("");

      const id = slugify(text, { lower: true, strict: true });

      headings.push({
        id,
        text,
        level: headingNode.depth,
        slug: `#${id}`,
      });
    }

    if ("children" in node) {
      (node.children as mdast.Content[]).forEach(walk);
    }
  })(tree);

  return headings;
}
