"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flattenTree = exports.descendants = exports.ancestors = void 0;
const flattenTree = root => {
  const flattened = [];
  if (!root) {
    return flattened;
  }
  flattened.push(root);
  root.children.forEach(child => {
    flattened.push(...flattenTree(child));
  });
  return flattened;
};
exports.flattenTree = flattenTree;
const ancestors = node => {
  const nodes = [];
  if (node) {
    while (node.parent !== null) {
      nodes.unshift(node.parent);
      node = node.parent;
    }
  }
  return nodes;
};
exports.ancestors = ancestors;
const descendants = function (node) {
  let depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  const allDescendants = flattenTree(node).slice(1);
  return depth === 0 ? allDescendants : allDescendants.filter(d => d.depth <= node.depth + depth);
};
exports.descendants = descendants;