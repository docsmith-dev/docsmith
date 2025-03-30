// packages/react/src/adapters/markdown.tsx
import * as React from 'react';
import type { Doc } from '@docsmith/core';

// ReactMarkdown adapter
export interface ReactMarkdownAdapterOptions {
  remarkPlugins?: any[];
  rehypePlugins?: any[];
  components?: Record<string, React.ComponentType<any>>;
}

export function createReactMarkdownRenderer(
  options: ReactMarkdownAdapterOptions = {}
) {
  // We're not importing ReactMarkdown here - the user needs to pass it
  return (ReactMarkdown: any) => {
    return (content: string, doc: Doc) => (
      <ReactMarkdown
        remarkPlugins={options.remarkPlugins || []}
        rehypePlugins={options.rehypePlugins || []}
        components={options.components || {}}
      >
        {content}
      </ReactMarkdown>
    );
  };
}

// MDX adapter
export interface MDXAdapterOptions {
  components?: Record<string, React.ComponentType<any>>;
  scope?: Record<string, any>;
  remarkPlugins?: any[];
  rehypePlugins?: any[];
}

export function createMDXRenderer(options: MDXAdapterOptions = {}) {
  // Return a function that the user can call with their MDX runtime
  return (mdxRuntime: any) => {
    return async (content: string, doc: Doc) => {
      // This is just an example - the actual MDX compilation
      // would depend on the specific MDX library the user is using
      try {
        // Most MDX libraries would have a way to compile MDX to a component
        const MDXContent = await mdxRuntime.compileMDX(content, {
          components: options.components,
          scope: options.scope,
          remarkPlugins: options.remarkPlugins,
          rehypePlugins: options.rehypePlugins,
        });

        return <MDXContent />;
      } catch (error) {
        console.error('Error rendering MDX:', error);
        return <pre>Error rendering MDX: {String(error)}</pre>;
      }
    };
  };
}