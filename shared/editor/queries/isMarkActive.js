"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isMarkActive = void 0;
var _prosemirrorState = require("prosemirror-state");
var _getMarksBetween = require("./getMarksBetween");
var _getMarkRange = require("./getMarkRange");
const isNodeMarkActive = type => state => {
  if (!type) {
    return false;
  }
  const {
    selection
  } = state;
  if (!(selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const mark = (0, _getMarkRange.getMarkRangeNodeSelection)(selection, type);
  if (!mark) {
    return false;
  }
  return true;
};
const isInlineMarkActive = (type, attrs, options) => state => {
  if (!type) {
    return false;
  }
  const {
    from,
    $from,
    to,
    empty
  } = state.selection;
  const hasMark = !!(empty ? type.isInSet(state.storedMarks || $from.marks()) : state.doc.rangeHasMark(from, to, type));
  if (!hasMark) {
    return false;
  }
  if (attrs || options) {
    const results = (0, _getMarksBetween.getMarksBetween)(from, to, state);
    return results.some(_ref => {
      let {
        mark,
        start,
        end
      } = _ref;
      return mark.type === type && (!attrs || Object.keys(attrs).every(key => mark.attrs[key] === attrs[key])) && (!options?.exact || start === from && end === to) && (!options?.inclusive || start <= from && end >= to);
    });
  }
  return true;
};

/**
 * Checks if a mark is active in the current selection or not.
 *
 * @param type The mark type to check.
 * @param attrs The attributes to check.
 * @param options The options to use.
 * @returns A function that checks if a mark is active in the current selection or not.
 */
const isMarkActive = (type, attrs, options) => state => isInlineMarkActive(type, attrs, options)(state) || isNodeMarkActive(type)(state);
exports.isMarkActive = isMarkActive;