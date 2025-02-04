import * as React from "react";
import type { Breadcrumb } from "@docsmith/core";

// Base props for the Breadcrumb component
interface BreadcrumbsBaseProps {
  /**
   * Array of breadcrumb items to display
   */
  items: Breadcrumb[];
  /**
   * Custom separator between breadcrumb items
   * @default "/"
   */
  separator?: React.ReactNode;
  /**
   * Called when a breadcrumb item is clicked
   */
  onNavigate?: (breadcrumb: Breadcrumb) => void;
}

// Props specifically for render props pattern
interface BreadcrumbsRenderProps {
  items: Breadcrumb[];
  separator: React.ReactNode;
  onNavigate?: (breadcrumb: Breadcrumb) => void;
}

// Combined props type
type BreadcrumbsProps = BreadcrumbsBaseProps &
  Omit<React.ComponentPropsWithoutRef<"nav">, keyof BreadcrumbsBaseProps> & {
    children: (props: BreadcrumbsRenderProps) => React.ReactNode;
  };

/**
 * Breadcrumbs component for displaying hierarchical navigation
 */
export function Breadcrumbs({
  items,
  separator = "/",
  onNavigate,
  children,
  className,
  ...props
}: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={className} {...props}>
      {children({ items, separator, onNavigate })}
    </nav>
  );
}

// List container component
interface BreadcrumbsListProps extends React.ComponentPropsWithoutRef<"ol"> {
  children: React.ReactNode;
}

export function BreadcrumbsList({
  children,
  className,
  ...props
}: BreadcrumbsListProps) {
  return (
    <ol className={className} {...props}>
      {children}
    </ol>
  );
}

// Individual breadcrumb item component
interface BreadcrumbsItemBaseProps {
  /**
   * Breadcrumb item data
   */
  item: Breadcrumb;
  /**
   * Optional click handler
   */
  onNavigate?: (breadcrumb: Breadcrumb) => void;
  /**
   * Optional component to render instead of button
   */
  as?: React.ElementType;
}

type BreadcrumbsItemProps = BreadcrumbsItemBaseProps &
  Omit<React.ComponentPropsWithoutRef<"li">, keyof BreadcrumbsItemBaseProps>;

export function BreadcrumbsItem({
  item,
  onNavigate,
  as: Component = "button",
  className,
  ...props
}: BreadcrumbsItemProps) {
  const handleClick = React.useCallback(() => {
    onNavigate?.(item);
  }, [item, onNavigate]);

  return (
    <li className={className} {...props}>
      <Component
        onClick={handleClick}
        role={Component === "button" ? undefined : "button"}
      >
        {item.name}
      </Component>
    </li>
  );
}

// Separator component
interface BreadcrumbsSeparatorProps
  extends React.ComponentPropsWithoutRef<"li"> {
  children: React.ReactNode;
}

export function BreadcrumbsSeparator({
  children,
  className,
  ...props
}: BreadcrumbsSeparatorProps) {
  return (
    <li className={className} aria-hidden="true" role="presentation" {...props}>
      {children}
    </li>
  );
}
