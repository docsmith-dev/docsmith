import React from "react";
import {
  Search,
  SearchInput,
  SearchResultItem,
  SearchResults,
} from "@docsmith/react";
import { getDocs } from "@docsmith/vite";

export const DocsSearch = () => {
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(-1);

  return (
    <Search
      docs={getDocs()}
      query={query}
      onQueryChange={setQuery}
      activeIndex={activeIndex}
      onActiveIndexChange={setActiveIndex}
      onSelect={(doc) => {
        // navigate(`/docs/${doc.slug}`);
        setQuery("");
        setActiveIndex(-1);
      }}
    >
      {({ docs: results, query, setQuery, activeIndex, handleKeyDown }) => (
        <div className="search-container" onKeyDown={handleKeyDown}>
          <div className="search-header">
            <SearchInput
              query={query}
              onQueryChange={setQuery}
              className="custom-input"
            />
            <span>{results.length} results</span>
          </div>

          <SearchResults className="custom-results-list">
            {results.map((doc, index) => (
              <SearchResultItem
                key={doc.slug}
                doc={doc}
                active={index === activeIndex}
              >
                <div>
                  <a
                    href={`/docs/${doc.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/docs/${doc.slug}`);
                      setQuery("");
                      setActiveIndex(-1);
                    }}
                  >
                    {doc.title}
                  </a>
                </div>
              </SearchResultItem>
            ))}
          </SearchResults>
        </div>
      )}
    </Search>
  );
};