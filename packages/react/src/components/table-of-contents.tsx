import * as React from "react";
import type { TreeItem } from "@docsmith/core";

interface RenderProps {
  tree: TreeItem[];
  currentPath?: string;
}

interface TableOfContentsProps {
  tree: TreeItem[];
  className?: string;
  currentPath?: string;
  children: (props: RenderProps) => React.ReactNode;
}

export function TableOfContents({
  tree,
  currentPath,
  children,
  className,
  ...props
}: TableOfContentsProps) {
  return (
    <nav className={className} aria-label="Table of contents" {...props}>
      {children({ tree, currentPath })}
    </nav>
  );
}
TableOfContents.displayName = "TableOfContents";

// Group container
// Group container using details/summary
interface TableOfContentsGroupProps
  extends React.ComponentPropsWithoutRef<"details"> {
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function TableOfContentsGroup({
  children,
  className,
  defaultOpen = true,
  ...props
}: TableOfContentsGroupProps) {
  return (
    <details className={className} open={defaultOpen} {...props}>
      {children}
    </details>
  );
}
TableOfContentsGroup.displayName = "TableOfContentsGroup";

// Group label as summary
interface TableOfContentsGroupLabelProps
  extends React.ComponentPropsWithoutRef<"summary"> {
  children: React.ReactNode;
}

export function TableOfContentsGroupLabel({
  children,
  className,
  ...props
}: TableOfContentsGroupLabelProps) {
  return (
    <summary className={className} role="button" {...props}>
      {children}
    </summary>
  );
}
TableOfContentsGroupLabel.displayName = "TableOfContentsGroupLabel";

// Group content container
interface TableOfContentsGroupContentProps
  extends React.ComponentPropsWithoutRef<"div"> {
  children: React.ReactNode;
}

export function TableOfContentsGroupContent({
  children,
  className,
  ...props
}: TableOfContentsGroupContentProps) {
  return (
    <div className={className} role="region" {...props}>
      {children}
    </div>
  );
}
TableOfContentsGroupContent.displayName = "TableOfContentsGroupContent";
// List container
interface TableOfContentsListProps
  extends React.ComponentPropsWithoutRef<"ul"> {
  children: React.ReactNode;
}

export function TableOfContentsList({
  children,
  className,
  ...props
}: TableOfContentsListProps) {
  return (
    <ul className={className} role="list" {...props}>
      {children}
    </ul>
  );
}
TableOfContentsList.displayName = "TableOfContentsList";

// List item
interface TableOfContentsItemProps
  extends React.ComponentPropsWithoutRef<"li"> {
  children: React.ReactNode;
}

export function TableOfContentsItem({
  children,
  className,
  ...props
}: TableOfContentsItemProps) {
  return (
    <li className={className} role="listitem" {...props}>
      {children}
    </li>
  );
}
TableOfContentsItem.displayName = "TableOfContentsItem";

// Link
interface TableOfContentsLinkProps
  extends React.ComponentPropsWithoutRef<"div"> {
  item: TreeItem;
  // Instead of asChild, we can just make it accept any element type
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function TableOfContentsLink({
  item,
  as: Component = "div", // Default to div if no element type specified
  children,
  className,
  ...props
}: TableOfContentsLinkProps) {
  return (
    <Component
      className={className}
      aria-current={location.pathname === item.slug ? "page" : undefined}
      {...props}
    >
      {children || item.label || item.name}
    </Component>
  );
}
