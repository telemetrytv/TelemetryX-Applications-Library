// Mock implementation of @telemetryx/sdk for development
// This can be replaced with the real SDK when available

// Types
export interface StoreScope {
  get(key: string): Promise<any>;
  set(key: string, value: any): Promise<void>;
  subscribe(key: string, handler: (value: any) => void): Promise<() => void>;
  unsubscribe(key: string, handler: (value: any) => void): Promise<void>;
}

export interface Store {
  local: StoreScope;
  global: StoreScope;
  deviceLocal: StoreScope;
  shared: StoreScope;
}

class MockStoreScope implements StoreScope {
  private data: Map<string, any> = new Map();
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  async get(key: string): Promise<any> {
    console.log(`[Mock SDK] Getting ${key}:`, this.data.get(key));
    return this.data.get(key);
  }

  async set(key: string, value: any): Promise<void> {
    console.log(`[Mock SDK] Setting ${key}:`, value);
    this.data.set(key, value);

    // Notify listeners
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(handler => {
        try {
          handler(value);
        } catch (error) {
          console.error('[Mock SDK] Error in listener:', error);
        }
      });
    }
  }

  async subscribe(key: string, handler: (value: any) => void): Promise<() => void> {
    console.log(`[Mock SDK] Subscribing to ${key}`);

    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(handler);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(key);
      if (listeners) {
        listeners.delete(handler);
        if (listeners.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  async unsubscribe(key: string, handler: (value: any) => void): Promise<void> {
    console.log(`[Mock SDK] Unsubscribing from ${key}`);

    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        this.listeners.delete(key);
      }
    }
  }
}

class MockStore implements Store {
  local = new MockStoreScope();
  global = new MockStoreScope();
  deviceLocal = new MockStoreScope();
  shared = new MockStoreScope();
}

// Mock store instance
const mockStore = new MockStore();

// Mock configure function
export function configure(appName: string): void {
  console.log(`[Mock SDK] Configuring app: ${appName}`);
}

// Mock store function
export function store(): Store {
  return mockStore;
}

// Export other functions that might be needed
export function destroy(): void {
  console.log('[Mock SDK] Destroying SDK');
}
