"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentBlock = getCurrentBlock;
/**
 * Gets the current block node that contains the selection
 * @param state The editor state
 * @returns The current block node and its position, or undefined if not found
 */
function getCurrentBlock(state) {
  const {
    $head
  } = state.selection;

  // Walk up the tree to find the first block node
  for (let d = $head.depth; d > 0; d--) {
    const node = $head.node(d);
    if (node.isBlock) {
      return [node, $head.before(d)];
    }
  }
  return undefined;
}