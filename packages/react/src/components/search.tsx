import * as React from "react";
import type { Doc } from "@docsmith/core";
import { useDocsData } from "../hooks/useDocsData";

// Root Search component with render props
interface SearchProps {
  currentPath?: string;
  children: (props: SearchRenderProps) => React.ReactNode;
  filterResults?: (docs: Doc[], query: string) => Doc[];
  className?: string;
}

interface SearchRenderProps {
  docs: Doc[];
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function Search({
  currentPath,
  children,
  className,
  filterResults,
}: SearchProps) {
  const { docs } = useDocsData();
  const [query, setQuery] = React.useState("");

  // Default filter method
  const defaultFilterResults = (docs: Doc[], query: string) =>
    query.length > 0
      ? docs.filter(
          ({ content, title }) =>
            content.toLowerCase().includes(query.toLowerCase()) ||
            title.toLowerCase().includes(query.toLowerCase()),
        )
      : [];

  // Use custom filter if provided, otherwise use default
  const filteredDocs = (filterResults || defaultFilterResults)(docs, query);

  return (
    <div className={className} role="search" aria-label="Documentation search">
      {children({
        docs: filteredDocs,
        query,
        setQuery,
      })}
    </div>
  );
}
Search.displayName = "Search";

// Search Input Component
interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
}

export function SearchInput({
  query,
  setQuery,
  className,
  ...props
}: SearchInputProps) {
  return (
    <input
      type="search"
      role="searchbox"
      aria-label="Search documentation"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search docs..."
      className={className}
      {...props}
    />
  );
}
SearchInput.displayName = "SearchInput";

// Search Results Container
interface SearchResultsProps extends React.HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
}

export function SearchResults({
  children,
  className,
  ...props
}: SearchResultsProps) {
  return (
    <ul
      role="listbox"
      aria-label="Search results"
      className={className}
      {...props}
    >
      {children}
    </ul>
  );
}
SearchResults.displayName = "SearchResults";

// Search Result Item
interface SearchResultItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  doc: Doc;
  active?: boolean;
}

export function SearchResultItem({
  doc,
  active,
  className,
  children,
  ...props
}: SearchResultItemProps) {
  return (
    <li role="option" aria-selected={active} className={className} {...props}>
      {children || doc.title}
    </li>
  );
}
SearchResultItem.displayName = "SearchResultItem";

// Keyboard Navigation Hook
export function useSearchKeyboardNavigation(
  results: Doc[],
  onSelect?: (doc: Doc) => void,
) {
  const [activeIndex, setActiveIndex] = React.useState(-1);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (activeIndex !== -1 && results[activeIndex]) {
          onSelect?.(results[activeIndex]);
        }
        break;
    }
  };

  return {
    activeIndex,
    handleKeyDown,
    setActiveIndex,
  };
}
