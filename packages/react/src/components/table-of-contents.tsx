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

// New Recursive Content Renderer
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
              <TableOfContentsGroup>
                <TableOfContentsGroupLabel>
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
