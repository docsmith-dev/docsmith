import React, {
  forwardRef,
  useState,
  ChangeEvent,
  HTMLAttributes,
  type ReactElement,
} from "react";
import { useDocsData } from "../hooks/useDocsData";
import { Doc } from "@docsmith/core";

interface SearchProps extends HTMLAttributes<HTMLDivElement> {
  renderInput?: (props: { inputProps: InputProps }) => ReactElement;
  renderResults?: (props: {
    results: Doc[];
    resultProps: ResultProps;
    query: string;
  }) => ReactElement;
  renderResult?: (props: { result: Doc; index: number }) => ReactElement;
  onQueryChange?: (query: string) => void;
}

interface InputProps {
  role: string;
  "aria-label": string;
  "aria-controls": string;
  "aria-expanded": boolean;
  "aria-activedescendant": string | undefined;
}

interface ResultProps {
  id: string;
  role: string;
  "aria-label": string;
}

export const Search = forwardRef<HTMLDivElement, SearchProps>(
  (
    { renderInput, renderResults, renderResult, onQueryChange, ...props },
    ref,
  ) => {
    const { docs } = useDocsData();
    const [query, setQuery] = useState("");

    const results =
      query.length > 0
        ? docs.filter(({ content }) =>
            content.toLowerCase().includes(query.toLowerCase()),
          )
        : [];

    const handleQueryChange = (newQuery: string) => {
      setQuery(newQuery);
      onQueryChange?.(newQuery);
    };

    const defaultRenderInput = ({
      inputProps,
    }: {
      inputProps: InputProps;
    }): ReactElement => (
      <input
        {...inputProps}
        type="search"
        value={query}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          handleQueryChange(e.target.value)
        }
      />
    );

    const defaultRenderResult = ({
      result,
      index,
    }: {
      result: Doc;
      index: number;
    }): ReactElement => (
      <li
        key={result.slug}
        role="option"
        aria-selected="false"
        id={`search-result-${index}`}
      >
        {result.name}
      </li>
    );

    const defaultRenderResults = ({
      results,
      resultProps,
    }: {
      results: Doc[];
      resultProps: ResultProps;
    }): ReactElement => (
      <ul {...resultProps}>
        {results.map(
          (result, index) =>
            renderResult?.({ result, index }) ??
            defaultRenderResult({ result, index }),
        )}
      </ul>
    );

    const inputProps: InputProps = {
      role: "searchbox",
      "aria-label": "Search documentation",
      "aria-controls": "search-results",
      "aria-expanded": results.length > 0,
      "aria-activedescendant": undefined,
    };

    const resultProps: ResultProps = {
      id: "search-results",
      role: "listbox",
      "aria-label": "Search results",
    };

    return (
      <div ref={ref} role="search" aria-label="Documentation search" {...props}>
        {renderInput?.({ inputProps }) ?? defaultRenderInput({ inputProps })}
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
  },
);

Search.displayName = "Search";
