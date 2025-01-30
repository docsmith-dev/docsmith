import { useDocsData, useDoc, TableOfContents, Search } from "@docsmith/react";
import { useState } from "react";
import { TreeItem, Doc } from "@docsmith/core";

export function App() {
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const currentDoc = useDoc(currentSlug);

  const handleDocSelect = (doc: Doc | TreeItem) => {
    setCurrentSlug(doc.slug);
  };

  return (
    <div>
      <aside>
        <Search/>

        <TableOfContents
          onDocClick={handleDocSelect}
          isActiveDoc={(item) => item.slug === currentSlug}
          defaultExpanded={true}
        />
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
            <div dangerouslySetInnerHTML={{ __html: currentDoc.content }} />
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