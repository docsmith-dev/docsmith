import type { DocsData, Doc, TreeItem } from "@docsmith/core";

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  renderItem?: (props: {
    item: { name: string; slug: string };
    isLast: boolean;
  }) => React.ReactNode;
  renderSeparator?: () => React.ReactNode;
  renderList?: (props: { children: React.ReactNode }) => React.ReactNode;
}

export interface SearchProps extends React.HTMLAttributes<HTMLDivElement> {
  renderInput?: (props: {
    inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  }) => React.ReactNode;
  renderResults?: (props: {
    results: Doc[];
    resultProps: any;
    query: string;
  }) => React.ReactNode;
  renderResult?: (props: { result: Doc; index: number }) => React.ReactNode;
  onQueryChange?: (query: string) => void;
}

export interface TableOfContentsProps
  extends React.HTMLAttributes<HTMLElement> {
  renderGroup?: (props: {
    item: TreeItem;
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: (name: string) => void;
  }) => React.ReactNode;
  renderDoc?: (props: { item: TreeItem }) => React.ReactNode;
  defaultExpanded?: boolean;
}

export interface OnThisPageProps extends React.HTMLAttributes<HTMLElement> {
  renderItem?: (props: {
    heading: { id: string; text: string; level: number };
    isActive: boolean;
  }) => React.ReactNode;
  renderList?: (props: { children: React.ReactNode }) => React.ReactNode;
  renderContainer?: (props: { children: React.ReactNode }) => React.ReactNode;
}
