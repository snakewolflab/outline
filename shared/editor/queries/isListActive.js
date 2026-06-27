"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isListActive = void 0;
var _prosemirrorState = require("prosemirror-state");
var _findParentNode = require("./findParentNode");
var _isList = require("./isList");
/**
 * Checks whether the list closest to the current selection is of the given
 * type. Unlike isNodeActive, this only matches the innermost list so that a
 * nested list does not also mark an ancestor list of a different type as
 * active in the toolbar.
 *
 * @param type the list node type to check for.
 * @returns a function that returns true when the closest list is of the type.
 */
const isListActive = type => state => {
  const {
    selection
  } = state;

  // When the list node itself is selected via a NodeSelection, consider that
  // node directly — findParentNode would otherwise report its parent list.
  if (selection instanceof _prosemirrorState.NodeSelection && (0, _isList.isList)(selection.node, state.schema)) {
    return selection.node.type === type;
  }
  const closestList = (0, _findParentNode.findParentNode)(node => (0, _isList.isList)(node, state.schema))(selection);
  return closestList?.node.type === type;
};
exports.isListActive = isListActive;