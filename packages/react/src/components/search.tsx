import * as React from "react";
import type { Doc } from "@docsmith/core";

// Root Search component with render props
interface SearchBaseProps {
  docs: Doc[]; // Now passed as prop instead of using hook
  currentPath?: string;
  children: (props: SearchRenderProps) => React.ReactNode;
  filterResults?: (docs: Doc[], query: string) => Doc[];
  // New props to control state
  query: string;
  onQueryChange: (query: string) => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
  onSelect?: (doc: Doc) => void;
}

type SearchProps = SearchBaseProps &
  Omit<React.ComponentPropsWithoutRef<"div">, keyof SearchBaseProps>;

interface SearchRenderProps {
  docs: Doc[];
  query: string;
  setQuery: (query: string) => void;
  activeIndex: number;
  handleKeyDown: (event: React.KeyboardEvent) => void;
}

// Default filter method
const defaultFilterResults = (docs: Doc[], query: string) =>
  query.length > 0
    ? docs.filter(
        ({ content, title }) =>
          content.toLowerCase().includes(query.toLowerCase()) ||
          title.toLowerCase().includes(query.toLowerCase())
      )
    : [];

export function Search({
  docs,
  currentPath,
  children,
  className,
  filterResults = defaultFilterResults,
  query,
  onQueryChange,
  activeIndex = -1,
  onActiveIndexChange,
  onSelect,
  ...props
}: SearchProps) {
  const filteredDocs = filterResults(docs, query);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        onActiveIndexChange?.(
          activeIndex < filteredDocs.length - 1 ? activeIndex + 1 : activeIndex
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        onActiveIndexChange?.(activeIndex > 0 ? activeIndex - 1 : activeIndex);
        break;
      case "Enter":
        if (activeIndex !== -1 && filteredDocs[activeIndex]) {
          onSelect?.(filteredDocs[activeIndex]);
        }
        break;
    }
  };

  return (
    <div
      className={className}
      role="search"
      aria-label="Documentation search"
      {...props}
    >
      {children({
        docs: filteredDocs,
        query,
        setQuery: onQueryChange,
        activeIndex,
        handleKeyDown,
      })}
    </div>
  );
}

// Search Input Component
interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  query: string;
  onQueryChange: (query: string) => void;
}

export function SearchInput({
  query,
  onQueryChange,
  className,
  ...props
}: SearchInputProps) {
  return (
    <input
      type="search"
      role="searchbox"
      aria-label="Search documentation"
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder="Search docs..."
      className={className}
      {...props}
    />
  );
}

// Search Results Container - stays the same
interface SearchResultsProps extends React.ComponentPropsWithoutRef<"ul"> {
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

// Search Result Item - stays mostly the same
interface SearchResultItemBaseProps {
  doc: Doc;
  active?: boolean;
  children?: React.ReactNode;
}

type SearchResultItemProps = SearchResultItemBaseProps &
  Omit<React.ComponentPropsWithoutRef<"li">, keyof SearchResultItemBaseProps>;

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
