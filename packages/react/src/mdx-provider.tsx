// packages/react/src/mdx-provider.tsx
import * as React from 'react';

// Context to hold all available MDX components
interface MDXComponentsContextType {
  components: Record<string, React.ComponentType<any>>;
}

const MDXComponentsContext = React.createContext<MDXComponentsContextType>({
  components: {},
});

export interface MDXProviderProps {
  /**
   * Components to be made available to MDX content
   */
  components: Record<string, React.ComponentType<any>>;
  /**
   * MDX content to be rendered
   */
  children: React.ReactNode;
}

/**
 * Provider for making components available to MDX content
 */
export function MDXProvider({ components, children }: MDXProviderProps) {
  return (
    <MDXComponentsContext.Provider value={{ components }}>
      {children}
    </MDXComponentsContext.Provider>
  );
}

/**
 * Hook to access MDX components from context
 */
export function useMDXComponents() {
  return React.useContext(MDXComponentsContext).components;
}

/**
 * A component that renders MDX content with the provided components
 */
export interface MDXContentProps {
  /**
   * The compiled MDX content
   */
  content: React.ReactNode;
  /**
   * Additional components to provide to this specific MDX content
   * These will be merged with components from the MDXProvider
   */
  components?: Record<string, React.ComponentType<any>>;
}

export function MDXContent({ content, components: localComponents = {} }: MDXContentProps) {
  const contextComponents = useMDXComponents();
  const allComponents = { ...contextComponents, ...localComponents };

  // Need to wrap in a React.Fragment to properly handle context
  return (
    <MDXComponentsContext.Provider value={{ components: allComponents }}>
      {content}
    </MDXComponentsContext.Provider>
  );
}