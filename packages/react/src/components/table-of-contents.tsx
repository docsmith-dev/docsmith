import * as React from "react";
import type { TreeItem } from "@docsmith/core";

// Root container with render props
interface RenderProps {
  tree: TreeItem[];
  currentPath?: string;
}

interface TableOfContentsProps {
  tree: TreeItem[];
  className?: string;
  currentPath?: string;
  children: React.ReactNode | ((props: RenderProps) => React.ReactNode);
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
      {typeof children === "function"
        ? children({ tree, currentPath })
        : children}
    </nav>
  );
}

// Group container (can be rendered as ul or details)
interface BaseTableOfContentsGroupProps {
  children: React.ReactNode;
  className?: string;
}

type TableOfContentsGroupProps<T extends "ul" | "details"> =
  BaseTableOfContentsGroupProps & {
    as: T;
  } & (T extends "ul"
      ? Omit<
          React.ComponentPropsWithoutRef<"ul">,
          keyof BaseTableOfContentsGroupProps
        >
      : Omit<
          React.ComponentPropsWithoutRef<"details">,
          keyof BaseTableOfContentsGroupProps
        > & { defaultOpen?: boolean });

export function TableOfContentsGroup<T extends "ul" | "details">({
  children,
  className,
  as,
  ...props
}: TableOfContentsGroupProps<T>) {
  const Component = as;
  if (as === "ul") {
    return (
      <ul
        className={className}
        {...(props as React.ComponentPropsWithoutRef<"ul">)}
      >
        {children}
      </ul>
    );
  }
  return (
    <details
      className={className}
      {...(props as React.ComponentPropsWithoutRef<"details">)}
    >
      {children}
    </details>
  );
}

// Group label (can be rendered as li or summary)
interface BaseLabelProps {
  children: React.ReactNode;
  className?: string;
}

type TableOfContentsGroupLabelProps<T extends "li" | "summary"> =
  BaseLabelProps & {
    as: T;
  } & (T extends "li"
      ? Omit<React.ComponentPropsWithoutRef<"li">, keyof BaseLabelProps>
      : Omit<React.ComponentPropsWithoutRef<"summary">, keyof BaseLabelProps>);

export function TableOfContentsGroupLabel<T extends "li" | "summary">({
  children,
  className,
  as,
  ...props
}: TableOfContentsGroupLabelProps<T>) {
  if (as === "li") {
    return (
      <li
        className={className}
        {...(props as React.ComponentPropsWithoutRef<"li">)}
      >
        {children}
      </li>
    );
  }
  return (
    <summary
      className={className}
      {...(props as React.ComponentPropsWithoutRef<"summary">)}
    >
      {children}
    </summary>
  );
}

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
    <li className={className} {...props}>
      {children}
    </li>
  );
}

// Link item
interface TableOfContentsLinkProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "as"> {
  item: TreeItem;
  isCurrent?: boolean;
  as?: React.ElementType;
  children?: React.ReactNode;
}

export function TableOfContentsLink({
  item,
  as: Component = "div",
  children,
  className,
  isCurrent,
  ...props
}: TableOfContentsLinkProps) {
  return (
    <Component
      className={className}
      aria-current={isCurrent ? "page" : undefined}
      {...props}
    >
      {children || item.label || item.name}
    </Component>
  );
}
