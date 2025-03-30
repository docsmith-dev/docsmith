// packages/react/src/components/component-provider.tsx
import * as React from 'react';

// Context for components
const ComponentContext = React.createContext<Record<string, React.ComponentType<any>>>({});

export interface ComponentProviderProps {
  /**
   * Components to make available to content
   */
  components: Record<string, React.ComponentType<any>>;
  /**
   * React children
   */
  children: React.ReactNode;
}

/**
 * Provider for making components available to content renderers
 */
export function ComponentProvider({ components, children }: ComponentProviderProps) {
  return (
    <ComponentContext.Provider value={components}>
      {children}
    </ComponentContext.Provider>
  );
}

/**
 * Hook to access components from context
 */
export function useComponents() {
  return React.useContext(ComponentContext);
}