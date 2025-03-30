// packages/react/src/components/doc-renderer.tsx
import * as React from 'react';
import type { Doc } from '@docsmith/core';

interface DocRendererProps {
  /**
   * The document to render
   */
  doc: Doc;
  /**
   * Function that renders Markdown content
   */
  markdownRenderer?: (content: string, doc: Doc) => React.ReactNode;
  /**
   * Function that renders MDX content
   */
  mdxRenderer?: (content: string, doc: Doc) => React.ReactNode;
  /**
   * Components available to MDX content
   */
  components?: Record<string, React.ComponentType<any>>;
  /**
   * Class name for the wrapper element
   */
  className?: string;
  /**
   * Custom element type for the wrapper
   */
  as?: React.ElementType;
  /**
   * Additional props to pass to the wrapper element
   */
  [key: string]: any;
}

/**
 * A flexible document renderer that supports both markdown and MDX
 * Delegates the actual rendering to user-provided renderers
 */
export function DocRenderer({
                              doc,
                              markdownRenderer,
                              mdxRenderer,
                              components = {},
                              className,
                              as: Component = 'div',
                              ...props
                            }: DocRendererProps) {
  const content = React.useMemo(() => {
    if (doc.isMDX && mdxRenderer) {
      return mdxRenderer(doc.content, doc);
    }
    if (doc.isMarkdown && markdownRenderer) {
      return markdownRenderer(doc.content, doc);
    }
    // Fallback - just render the content as plain text
    return <pre>{doc.content}</pre>;
  }, [doc, markdownRenderer, mdxRenderer]);

  return (
    <Component className={className} {...props}>
      {content}
    </Component>
  );
}