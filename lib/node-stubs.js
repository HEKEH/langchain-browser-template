// Browser-compatible stubs for Node.js built-in modules
// These provide minimal implementations that work in browser environments

// For async_hooks - minimal stub that provides basic API surface
// Note: There's no true browser alternative for async_hooks, but we provide
// a stub that matches the API interface so code can run without errors
// This is a functional stub that provides the necessary API surface

let currentAsyncId = 0;

const asyncHooksStub = {
  createHook: (callbacks) => {
    const hook = {
      enabled: false,
      enable: function() {
        this.enabled = true;
      },
      disable: function() {
        this.enabled = false;
      },
    };
    return hook;
  },
  executionAsyncId: () => currentAsyncId || 0,
  triggerAsyncId: () => 0,
  AsyncResource: class AsyncResource {
    constructor(type, opts) {
      this.type = type;
      this.asyncId = ++currentAsyncId;
      this.triggerAsyncId = 0;
    }
    emitBefore() {
      // No-op in browser
    }
    emitAfter() {
      // No-op in browser
    }
    emitDestroy() {
      // No-op in browser
    }
    asyncId() {
      return this.asyncId;
    }
    triggerAsyncId() {
      return this.triggerAsyncId;
    }
    runInAsyncScope(fn, thisArg, ...args) {
      // Execute function in this async context
      return fn.apply(thisArg, args);
    }
  },
  // AsyncLocalStorage - browser-compatible implementation using Map
  AsyncLocalStorage: class AsyncLocalStorage {
    constructor() {
      this.store = new Map();
    }

    getStore() {
      // In browser, we use a simple Map-based storage
      // This is a simplified implementation that doesn't track async context
      // but provides the API surface needed for code to work
      return this.store.get('current') || undefined;
    }

    run(store, callback, ...args) {
      const previous = this.store.get('current');
      try {
        this.store.set('current', store);
        return callback(...args);
      } finally {
        if (previous !== undefined) {
          this.store.set('current', previous);
        } else {
          this.store.delete('current');
        }
      }
    }

    getSnapshot() {
      return this.store.get('current') || undefined;
    }

    disable() {
      this.store.clear();
    }

    enterWith(store) {
      this.store.set('current', store);
    }

    exit(callback, ...args) {
      const previous = this.store.get('current');
      try {
        this.store.delete('current');
        return callback(...args);
      } finally {
        if (previous !== undefined) {
          this.store.set('current', previous);
        }
      }
    }
  },
};

// Export the appropriate stub based on the module name
// This file will be aliased for different node: modules

// Named exports for compatibility with ES6 imports
export const AsyncLocalStorage = asyncHooksStub.AsyncLocalStorage;
export const AsyncResource = asyncHooksStub.AsyncResource;
export const createHook = asyncHooksStub.createHook;
export const executionAsyncId = asyncHooksStub.executionAsyncId;
export const triggerAsyncId = asyncHooksStub.triggerAsyncId;

// Default export for default imports
export default asyncHooksStub;

