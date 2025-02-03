import "highlight.js/styles/github.css";
import { DocsDoc } from "./components/docs-doc";
import { DocsTableOfContents } from "./components/docs-table-of-contents";
import { DocsSearch } from "./components/docs-search";
import { DocsOnThisPage } from "./components/docs-on-this-page";

export function App() {
  const currentSlug = window.location.pathname.replace("/", "");
  // const currentDoc = useDoc(currentSlug);

  return (
    <div>
      <header>
        <h1>Welcome to Documentation</h1>
      </header>
      <aside>
        <DocsSearch />
        <DocsTableOfContents />
      </aside>
      <main>
        {currentDoc ? (
          <DocsDoc currentDoc={currentDoc} />
        ) : (
          <div>
            {" "}
            <h1>Welcome to Documentation</h1>{" "}
            <p>Search or select a document from the sidebar to get started.</p>{" "}
          </div>
        )}
      </main>
      <aside>
        <DocsOnThisPage currentDoc={currentDoc} />
      </aside>
    </div>
  );
}
