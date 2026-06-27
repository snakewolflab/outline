"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNodeActive = void 0;
var _prosemirrorState = require("prosemirror-state");
var _findParentNode = require("./findParentNode");
var _toggleBlock = require("./toggleBlock");
/**
 * Checks if a node is active in the current selection or not.
 *
 * @param type The node type to check.
 * @param attrs The attributes to check.
 * @param options The options to use.
 * @returns A function that checks if a node is active in the current selection or not.
 */
const isNodeActive = (type, attrs, options) => state => {
  if (!type) {
    return false;
  }
  if (type === state.schema.nodes.container_toggle) {
    // `container_toggle` is a special case where it's considered active
    // only when the selection lies within its head
    return (0, _toggleBlock.isSelectionInToggleBlockHead)(state);
  }
  let nodeWithPos;
  const {
    from,
    to
  } = state.selection;
  if (state.selection instanceof _prosemirrorState.NodeSelection && state.selection.node.type === type && state.selection.node.hasMarkup(type, {
    ...state.selection.node.attrs,
    ...attrs
  })) {
    nodeWithPos = {
      pos: from,
      node: state.selection.node
    };
  }
  nodeWithPos ??= (0, _findParentNode.findParentNode)(node => node.type === type && (!attrs || node.hasMarkup(type, {
    ...node.attrs,
    ...attrs
  })))(state.selection);
  if (!nodeWithPos) {
    return false;
  }
  if (options?.inclusive) {
    // Check if the node's position contains the entire selection
    return nodeWithPos.pos <= from && nodeWithPos.pos + nodeWithPos.node.nodeSize >= to;
  }
  if (options?.exact) {
    // Check if node's range exactly matches selection
    return nodeWithPos.pos === from && nodeWithPos.pos + nodeWithPos.node.nodeSize === to;
  }
  return true;
};
exports.isNodeActive = isNodeActive;