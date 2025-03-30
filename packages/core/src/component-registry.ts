// packages/core/src/component-registry.ts

/**
 * A simple registry to store component mappings
 * Can be used by any framework adapter
 */
export class ComponentRegistry {
  private components: Map<string, unknown> = new Map();

  /**
   * Register a component with a name
   */
  register(name: string, component: unknown): void {
    this.components.set(name, component);
  }

  /**
   * Register multiple components at once
   */
  registerMany(components: Record<string, unknown>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.register(name, component);
    });
  }

  /**
   * Get a component by name
   */
  get(name: string): unknown | undefined {
    return this.components.get(name);
  }

  /**
   * Check if a component exists
   */
  has(name: string): boolean {
    return this.components.has(name);
  }

  /**
   * Get all components as an object
   */
  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.components.entries());
  }

  /**
   * Clear all registered components
   */
  clear(): void {
    this.components.clear();
  }
}

export const createComponentRegistry = () => new ComponentRegistry();