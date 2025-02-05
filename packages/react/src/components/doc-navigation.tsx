import * as React from 'react';
import type { Doc } from '@docsmith/core';

interface DocNavigationRenderProps {
  previous: Doc['navigation']['previous'];
  next: Doc['navigation']['next'];
}

interface DocNavigationProps {
  /**
   * The current document containing navigation info
   */
  doc: Doc;
  /**
   * Custom labels for navigation
   */
  labels?: {
    previous?: string;
    next?: string;
  };
  /**
   * Render function or React nodes
   */
  children: React.ReactNode | ((props: DocNavigationRenderProps) => React.ReactNode);
}

/**
 * Navigation component for moving between documents
 */
export function DocNavigation({
                                doc,
                                labels = {
                                  previous: 'Previous',
                                  next: 'Next'
                                },
                                children,
                                ...props
                              }: DocNavigationProps) {
  const { previous, next } = doc.navigation;

  return (
    <nav aria-label="Document navigation" {...props}>
      {typeof children === 'function'
        ? children({ previous, next })
        : children}
    </nav>
  );
}

interface DocNavigationListProps extends React.ComponentPropsWithoutRef<'ul'> {
  children: React.ReactNode;
}

export function DocNavigationList({ children, ...props }: DocNavigationListProps) {
  return (
    <ul role="list" {...props}>
      {children}
    </ul>
  );
}

interface DocNavigationLinkProps {
  /**
   * Navigation item data
   */
  item: NonNullable<Doc['navigation']['previous' | 'next']>;
  /**
   * Direction of navigation
   */
  direction: 'previous' | 'next';
  /**
   * Component to use for the link
   */
  as?: React.ElementType;
  /**
   * Label for the direction (e.g. "Previous", "Next")
   */
  label?: string;
  children?: React.ReactNode;
}

export function DocNavigationLink({
                                    item,
                                    direction,
                                    as: Component = 'a',
                                    label,
                                    children,
                                    ...props
                                  }: DocNavigationLinkProps) {
  return (
    <Component
      href={item.slug}
      rel={direction}
      aria-label={`${label}: ${item.title}`}
      {...props}
    >
      {children || (
        <>
          <span>{label}</span>
          <span>{item.title}</span>
        </>
      )}
    </Component>
  );
}