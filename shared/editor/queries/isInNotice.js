"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInNotice = isInNotice;
var _isNodeActive = require("./isNodeActive");
/**
 * Returns true if the selection is inside a notice block.
 *
 * @param state The editor state.
 * @returns True if the selection is inside a notice block.
 */
function isInNotice(state) {
  const {
    nodes
  } = state.schema;
  return nodes.container_notice && (0, _isNodeActive.isNodeActive)(nodes.container_notice)(state);
}