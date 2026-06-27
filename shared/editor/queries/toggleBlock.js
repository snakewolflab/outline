"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachToggleBlockBody = attachToggleBlockBody;
exports.detachToggleBlockBody = detachToggleBlockBody;
exports.findParentToggleBlock = findParentToggleBlock;
exports.getToggleBlockDepth = getToggleBlockDepth;
exports.isSelectionAtEndOfToggleBlockHead = isSelectionAtEndOfToggleBlockHead;
exports.isSelectionAtStartOfToggleBlockHead = isSelectionAtStartOfToggleBlockHead;
exports.isSelectionInMiddleOfToggleBlockHead = isSelectionInMiddleOfToggleBlockHead;
exports.isSelectionInToggleBlock = isSelectionInToggleBlock;
exports.isSelectionInToggleBlockBody = isSelectionInToggleBlockBody;
exports.isSelectionInToggleBlockHead = isSelectionInToggleBlockHead;
exports.isToggleBlock = void 0;
exports.isToggleBlockFolded = isToggleBlockFolded;
var _prosemirrorModel = require("prosemirror-model");
var _ToggleBlock = require("../nodes/ToggleBlock");
var _utils = require("../utils");
var _findParentNode = require("./findParentNode");
/**
 * Check if a node is a toggle block.
 *
 * @param state - the editor state.
 * @returns a predicate function.
 */
const isToggleBlock = state => node => node.type === state.schema.nodes.container_toggle;

/**
 * Check if a toggle block is currently folded.
 *
 * @param state - the editor state.
 * @param toggleBlock - the toggle block node to check.
 * @returns true if the toggle block is folded.
 */
exports.isToggleBlock = isToggleBlock;
function isToggleBlockFolded(state, toggleBlock) {
  const pluginState = _ToggleBlock.toggleFoldPluginKey.getState(state);
  return pluginState?.foldedIds.has(toggleBlock.attrs.id) ?? false;
}

/**
 * Find the depth of a toggle block relative to the selection.
 *
 * @param $pos - the resolved position to search from.
 * @param toggleBlock - the toggle block node to find.
 * @returns the depth of the toggle block, or -1 if not found.
 */
function getToggleBlockDepth($pos, toggleBlock) {
  return (0, _utils.ancestors)($pos).findIndex(node => node.eq(toggleBlock));
}

/**
 * Find the nearest parent toggle block from a position.
 *
 * @param state - the editor state.
 * @param $pos - the resolved position to search from.
 * @returns the toggle block node and position info, or undefined.
 */
function findParentToggleBlock(state, $pos) {
  return (0, _findParentNode.findParentNodeClosestToPos)($pos, isToggleBlock(state));
}

/**
 * Check if the selection is within a toggle block.
 *
 * @param state - the editor state.
 * @returns true if the selection is within a toggle block.
 */
function isSelectionInToggleBlock(state) {
  return (0, _utils.ancestors)(state.selection.$from).some(isToggleBlock(state));
}

/**
 * Check if the selection is within the head (first child) of a toggle block.
 *
 * @param state - the editor state.
 * @returns true if the selection is within a toggle block head.
 */
function isSelectionInToggleBlockHead(state) {
  const parent = findParentToggleBlock(state, state.selection.$from);
  if (!parent) {
    return false;
  }
  return state.selection.$from.index(parent.depth) === 0;
}

/**
 * Check if the selection is within the body of a toggle block.
 *
 * @param state - the editor state.
 * @returns true if the selection is within a toggle block body.
 */
function isSelectionInToggleBlockBody(state) {
  return isSelectionInToggleBlock(state) && !isSelectionInToggleBlockHead(state);
}

/**
 * Check if the cursor is at the start of a toggle block head.
 *
 * @param state - the editor state.
 * @returns true if the cursor is at the start of a toggle block head.
 */
function isSelectionAtStartOfToggleBlockHead(state) {
  return isSelectionInToggleBlockHead(state) && state.selection.$from.parentOffset === 0;
}

/**
 * Check if the cursor is in the middle of a toggle block head.
 *
 * @param state - the editor state.
 * @returns true if the cursor is in the middle of a toggle block head.
 */
function isSelectionInMiddleOfToggleBlockHead(state) {
  if (!isSelectionInToggleBlockHead(state)) {
    return false;
  }
  const {
    $from
  } = state.selection;
  return $from.parentOffset > 0 && $from.parentOffset < $from.node().content.size;
}

/**
 * Check if the cursor is at the end of a toggle block head.
 *
 * @param state - the editor state.
 * @returns true if the cursor is at the end of a toggle block head.
 */
function isSelectionAtEndOfToggleBlockHead(state) {
  if (!isSelectionInToggleBlockHead(state)) {
    return false;
  }
  const {
    $from
  } = state.selection;
  return $from.parentOffset === $from.node().content.size;
}

/**
 * Result of detaching the body from a toggle block.
 */

/**
 * Detach the body content from a toggle block, returning both the modified
 * transaction and the detached content.
 *
 * @param pos - the position of the toggle block.
 * @param tr - the transaction to modify.
 * @returns the modified transaction and detached body content.
 */
function detachToggleBlockBody(pos, tr) {
  const $start = tr.doc.resolve(pos + 1);
  const toggleBlock = tr.doc.nodeAt(pos);
  const posBeforeBody = $start.pos + toggleBlock.firstChild.nodeSize;
  const posAfterBody = $start.end();

  // Extract body content before deleting
  const bodySlice = tr.doc.slice(posBeforeBody, posAfterBody);
  const body = [];
  bodySlice.content.forEach(node => body.push(node));

  // Delete the body from the document
  const newTr = tr.replace(posBeforeBody, posAfterBody, _prosemirrorModel.Slice.empty);
  return {
    tr: newTr,
    body
  };
}

/**
 * Attach body content back to a toggle block.
 *
 * @param pos - the position of the toggle block.
 * @param body - the body content to attach.
 * @param tr - the transaction to modify.
 * @returns the modified transaction.
 */
function attachToggleBlockBody(pos, body, tr) {
  const $start = tr.doc.resolve(pos + 1);
  const toggleBlock = tr.doc.nodeAt(pos);
  const posAfterHead = $start.pos + toggleBlock.firstChild.nodeSize;
  return tr.insert(posAfterHead, body);
}