"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInHeading = isInHeading;
var _isNodeActive = require("./isNodeActive");
/**
 * Returns true if the selection is inside a heading node.
 *
 * @param state The editor state.
 * @returns True if the selection is inside a heading node.
 */
function isInHeading(state) {
  const {
    nodes
  } = state.schema;
  if (nodes.heading && (0, _isNodeActive.isNodeActive)(nodes.heading)(state)) {
    return true;
  }
  return false;
}