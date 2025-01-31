import {
  useDoc,
  Search,
  TableOfContentsGroupContent,
  TableOfContentsGroupLabel,
  SearchInput,
  SearchResults,
  SearchResultItem,
} from "@docsmith/react";
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
  const currentSlug = window.location.pathname.replace("/", "");
  const currentDoc = useDoc(currentSlug);

  return (
    <div>
      <aside>
        <Search>
          {({ docs, query, setQuery }) => (
            <div className="search-container">
              <div className="search-header">
                <SearchInput
                  query={query}
                  setQuery={setQuery}
                  className="custom-input"
                />
                <span>{docs.length} results</span>
              </div>

              <SearchResults className="custom-results-list">
                {docs.map((doc) => (
                  <SearchResultItem key={doc.slug} doc={doc}>
                    <div>
                      <a href={doc.slug}>{doc.title}</a>
                    </div>
                  </SearchResultItem>
                ))}
              </SearchResults>
            </div>
          )}
        </Search>
        <TableOfContents currentPath={location.pathname}>
          {({ tree }) => (
            <>
              {tree.map((section) => {
                if (section.type === "group" && section.items) {
                  return (
                    <TableOfContentsGroup key={section.name}>
                      <TableOfContentsGroupLabel>
                        {section.label}
                      </TableOfContentsGroupLabel>
                      <TableOfContentsGroupContent>
                        <TableOfContentsList>
                          {section.items.map((item) => (
                            <TableOfContentsItem key={item.slug}>
                              <TableOfContentsLink item={item} asChild>
                                <a href={item.slug}>
                                  {item.icon && (
                                    <item.icon className="mr-2 h-4 w-4" />
                                  )}
                                  <span>{item.label}</span>
                                </a>
                              </TableOfContentsLink>
                            </TableOfContentsItem>
                          ))}
                        </TableOfContentsList>
                      </TableOfContentsGroupContent>
                    </TableOfContentsGroup>
                  );
                }

                return (
                  <TableOfContentsList key={section.name}>
                    <TableOfContentsItem>
                      <TableOfContentsLink item={section} asChild>
                        <a href={section.slug}>
                          {section.icon && (
                            <section.icon className="mr-2 h-4 w-4" />
                          )}
                          <span>{section.label}</span>
                        </a>
                      </TableOfContentsLink>
                    </TableOfContentsItem>
                  </TableOfContentsList>
                );
              })}
            </>
          )}
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
