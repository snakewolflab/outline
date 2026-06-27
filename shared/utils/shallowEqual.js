"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = shallowEqual;
/**
 * Check if two arrays have the same elements in the same order by reference.
 * Uses strict equality (===) rather than deep comparison, so object identity
 * is preserved — important for React.memo optimizations.
 *
 * @param a first array.
 * @param b second array.
 * @returns true if the arrays are shallowly equal.
 */
function shallowEqual(a, b) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}