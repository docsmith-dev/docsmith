import { useDoc, Search } from "@docsmith/react";
import { useState } from "react";
import { useDocsData } from "@docsmith/react";
import {
  TableOfContents,
  TableOfContentsList,
  TableOfContentsItem,
  TableOfContentsLink,
  TableOfContentsGroup,
} from "@docsmith/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export function App() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const currentDoc = useDoc(currentSlug);
  const { tree } = useDocsData();

  return (
    <div>
      <aside>
        <Search />
        <TableOfContents activeItem={currentSlug ?? undefined} onItemSelect={(item) => setCurrentSlug(item.slug)}>
          {tree.map(item => (
            item.type === 'group' ? (
              <TableOfContentsItem key={item.name}>
                <TableOfContentsGroup label={item.label || item.name}>
                  <TableOfContentsList>
                    {item.items?.map(subItem => (
                      <TableOfContentsItem key={subItem.slug}>
                        <TableOfContentsLink item={subItem} />
                      </TableOfContentsItem>
                    ))}
                  </TableOfContentsList>
                </TableOfContentsGroup>
              </TableOfContentsItem>
            ) : (
              <TableOfContentsItem key={item.slug}>
                <TableOfContentsLink item={item} />
              </TableOfContentsItem>
            )
          ))}
        </TableOfContents>
      </aside>

      <main>
        {currentDoc ? (
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
        ) : (
          <div>
            <h1>Welcome to Documentation</h1>
            <p>Search or select a document from the sidebar to get started.</p>
          </div>
        )}
      </main>
    </div>
  );
}