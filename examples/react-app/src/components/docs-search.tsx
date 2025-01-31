import {
  Search,
  SearchInput,
  SearchResultItem,
  SearchResults,
} from "@docsmith/react";

export const DocsSearch = () => {
  return (
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
  );
};
