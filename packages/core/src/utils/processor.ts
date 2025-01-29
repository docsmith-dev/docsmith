import { rehype } from "rehype";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";

export const createMarkdownProcessor = () =>
  rehype().use(remarkParse).use(remarkRehype).use(rehypeStringify);
