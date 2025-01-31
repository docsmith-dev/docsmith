import React, { createContext, useContext, type ReactNode } from "react";
import type { TreeItem } from "@docsmith/core";

// Context to handle active state and selection
interface TableOfContentsContextValue {
  currentItem?: string;
  onItemSelect?: (item: TreeItem) => void;
}

const TableOfContentsContext = createContext<TableOfContentsContextValue>({});

export function useTableOfContents() {
  return useContext(TableOfContentsContext);
}

// Root Component
interface TableOfContentsProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  currentItem?: string;
  onItemSelect?: (item: TreeItem) => void;
}

export const TableOfContents = React.forwardRef<HTMLElement, TableOfContentsProps>(
  ({ children, currentItem, onItemSelect, ...props }, ref) => {
    return (
      <TableOfContentsContext.Provider value={{ currentItem, onItemSelect }}>
        <nav ref={ref} aria-label="Table of contents" {...props}>
          <ul>{children}</ul>
        </nav>
      </TableOfContentsContext.Provider>
    );
  }
);

TableOfContents.displayName = "TableOfContents";

// List Component
interface TableOfContentsListProps extends React.HTMLAttributes<HTMLUListElement> {
  children: ReactNode;
}

export const TableOfContentsList = React.forwardRef<HTMLUListElement, TableOfContentsListProps>(
  ({ children, ...props }, ref) => {
    return <ul ref={ref} {...props}>{children}</ul>;
  }
);

TableOfContentsList.displayName = "TableOfContentsList";

// Item Component
interface TableOfContentsItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children: ReactNode;
}

export const TableOfContentsItem = React.forwardRef<HTMLLIElement, TableOfContentsItemProps>(
  ({ children, ...props }, ref) => {
    return <li ref={ref} {...props}>{children}</li>;
  }
);

TableOfContentsItem.displayName = "TableOfContentsItem";

// Link Component
interface TableOfContentsLinkProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  item: TreeItem;
}

export const TableOfContentsLink = React.forwardRef<HTMLButtonElement, TableOfContentsLinkProps>(
  ({ item, children, ...props }, ref) => {
    const { currentItem, onItemSelect } = useTableOfContents();

    return (
      <button
        ref={ref}
        onClick={() => onItemSelect?.(item)}
        aria-current={currentItem === item.slug ? "page" : undefined}
        role="link"
        type="button"
        {...props}
      >
        {children || item.label || item.name}
      </button>
    );
  }
);

TableOfContentsLink.displayName = "TableOfContentsLink";

// Group Component
interface TableOfContentsGroupProps extends React.HTMLAttributes<HTMLDetailsElement> {
  children: ReactNode;
  label: string;
}

export const TableOfContentsGroup = React.forwardRef<HTMLDetailsElement, TableOfContentsGroupProps>(
  ({ children, label, ...props }, ref) => {
    return (
      <details ref={ref} {...props}>
        <summary>{label}</summary>
        {children}
      </details>
    );
  }
);

TableOfContentsGroup.displayName = "TableOfContentsGroup";