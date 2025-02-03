import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Doc } from "@docsmith/core";

export const DocsDoc = ({ currentDoc }: { currentDoc: Doc }) => {
  return (
    <article>
      <header>
        <h1>{currentDoc.frontmatter?.title || currentDoc.title}</h1>
        {currentDoc.frontmatter?.description && (
          <p>{currentDoc.frontmatter.description}</p>
        )}
      </header>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {currentDoc.content}
      </ReactMarkdown>
    </article>
  );
};
