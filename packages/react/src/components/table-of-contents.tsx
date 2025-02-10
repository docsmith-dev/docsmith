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
        ? (children as (props: RenderProps) => React.ReactNode)({
            tree,
            currentPath,
          })
        : children}
    </nav>
  );
}
TableOfContents.displayName = "TableOfContents";

interface BaseTableOfContentsGroupProps {
  children: React.ReactNode;
  className?: string;
}

type TableOfContentsGroupProps<T extends "ul" | "details"> =
  BaseTableOfContentsGroupProps & {
    as: T;
  } & (T extends "ul"
      ? React.ComponentPropsWithoutRef<"ul">
      : React.ComponentPropsWithoutRef<"details"> & { defaultOpen?: boolean });

export function TableOfContentsGroup<T extends "ul" | "details">({
  children,
  className,
  as,
  ...props
}: TableOfContentsGroupProps<T>) {
  const Component = as === "ul" ? "ul" : "details";
  return (
    <Component className={className} {...(props as any)}>
      {children}
    </Component>
  );
}
TableOfContentsGroup.displayName = "TableOfContentsGroup";

interface BaseLabelProps {
  children: React.ReactNode;
  className?: string;
}

type TableOfContentsGroupLabelProps<T extends "li" | "summary"> =
  BaseLabelProps & {
    as: T;
  } & (T extends "li"
      ? React.ComponentPropsWithoutRef<"li">
      : React.ComponentPropsWithoutRef<"summary">);

export function TableOfContentsGroupLabel<T extends "li" | "summary">({
  children,
  className,
  as,
  ...props
}: TableOfContentsGroupLabelProps<T>) {
  const Component = as === "li" ? "li" : "summary";
  return (
    <Component className={className} {...(props as any)}>
      {children}
    </Component>
  );
}
TableOfContentsGroupLabel.displayName = "TableOfContentsGroupLabel";

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

interface TableOfContentsLinkProps
  extends React.ComponentPropsWithoutRef<"div"> {
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
TableOfContentsLink.displayName = "TableOfContentsLink";

interface TableOfContentsTreeProps {
  items: TreeItem[];
  currentPath?: string;
  as?: React.ElementType;
}

export function TableOfContentsTree({
  items,
  currentPath,
  as: Component = "a",
}: TableOfContentsTreeProps) {
  return (
    <TableOfContentsList>
      {items.map((item) => {
        if (item.type === "group") {
          return (
            <TableOfContentsItem key={item.name}>
              <TableOfContentsGroup as="ul">
                <TableOfContentsGroupLabel as="li">
                  {item.label || item.name}
                </TableOfContentsGroupLabel>
                <TableOfContentsGroupContent>
                  <TableOfContentsTree
                    items={item.items || []}
                    currentPath={currentPath}
                    as={Component}
                  />
                </TableOfContentsGroupContent>
              </TableOfContentsGroup>
            </TableOfContentsItem>
          );
        }
        return (
          <TableOfContentsItem key={item.slug}>
            <TableOfContentsLink
              item={item}
              as={Component}
              isCurrent={item.slug === currentPath}
            />
          </TableOfContentsItem>
        );
      })}
    </TableOfContentsList>
  );
}
