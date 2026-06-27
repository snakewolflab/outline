"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMarksBetween = getMarksBetween;
/**
 * Get all marks that are applied to text between two positions.
 *
 * @param start The start position
 * @param end The end position
 * @param state The editor state
 * @returns A list of marks
 */
function getMarksBetween(start, end, state) {
  let marks = [];
  state.doc.nodesBetween(start, end, (node, pos) => {
    if (node.isText) {
      const nodeStart = Math.max(start, pos);
      const nodeEnd = Math.min(end, pos + node.nodeSize);
      marks = [...marks, ...node.marks.map(mark => ({
        start: nodeStart,
        end: nodeEnd,
        mark
      }))];
    }
  });
  return marks;
}