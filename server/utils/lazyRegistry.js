"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLazyRegistry = createLazyRegistry;
/**
 * Create a lazily-loaded object registry. The loader runs only when the
 * registry is first accessed.
 *
 * @param load A function that returns the registry contents.
 * @returns A proxy that exposes the lazily-loaded registry.
 */
function createLazyRegistry(load) {
  let cache;
  const getRegistry = () => {
    if (cache) {
      return cache;
    }
    cache = load();
    return cache;
  };
  return new Proxy({}, {
    get(_target, prop) {
      if (typeof prop === "symbol") {
        return undefined;
      }
      return getRegistry()[prop];
    },
    has(_target, prop) {
      return typeof prop === "string" && prop in getRegistry();
    },
    ownKeys() {
      return Reflect.ownKeys(getRegistry());
    },
    getOwnPropertyDescriptor(_target, prop) {
      return Reflect.getOwnPropertyDescriptor(getRegistry(), prop);
    }
  });
}