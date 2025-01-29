import {forwardRef, useState} from "react";
import {useDocsData} from "../hooks/useDocsData";

export const Search = forwardRef(
  (
    {renderInput, renderResults, renderResult, onQueryChange, ...props},
    ref
  ) => {
    const {docs} = useDocsData();
    const [query, setQuery] = useState("");

    const results =
      query.length > 0
        ? docs.filter(({content}) =>
          content.toLowerCase().includes(query.toLowerCase())
        )
        : [];

    const handleQueryChange = (newQuery) => {
      setQuery(newQuery);
      onQueryChange?.(newQuery);
    };

    const defaultRenderInput = ({inputProps}) => (
      <input
        {...inputProps}
        type="search"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
      />
    );

    const defaultRenderResult = ({result, index}) => (
      <li
        key={result.slug}
        role="option"
        aria-selected="false"
        id={`search-result-${index}`}
      >
        {result.name}
      </li>
    );

    const defaultRenderResults = ({results, resultProps}) => (
      <ul {...resultProps}>
        {results.map(
          (result, index) =>
            renderResult?.({result, index}) ??
            defaultRenderResult({result, index})
        )}
      </ul>
    );

    const inputProps = {
      role: "searchbox",
      "aria-label": "Search documentation",
      "aria-controls": "search-results",
      "aria-expanded": results.length > 0,
      "aria-activedescendant": undefined, // Set this when implementing keyboard navigation
    };

    const resultProps = {
      id: "search-results",
      role: "listbox",
      "aria-label": "Search results",
    };

    return (
      <div ref={ref} role="search" aria-label="Documentation search" {...props}>
        {renderInput?.({inputProps}) ?? defaultRenderInput({inputProps})}
        {results.length > 0 &&
          (renderResults?.({
              results,
              resultProps,
              query,
            }) ??
            defaultRenderResults({
              results,
              resultProps,
            }))}
      </div>
    );
  }
);

Search.displayName = "Search";
