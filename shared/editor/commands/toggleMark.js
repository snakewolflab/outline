"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleMark = toggleMark;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorState = require("prosemirror-state");
var _chainTransactions = require("../lib/chainTransactions");
var _getMarksBetween = require("../queries/getMarksBetween");
var _isMarkActive = require("../queries/isMarkActive");
const wordCharRegex = /[\p{L}\p{N}_]/u;
const ATOM_PLACEHOLDER = "￼";

/**
 * If the selection is an empty cursor sitting inside a word (with word
 * characters on both sides) in a textblock that allows the given mark type,
 * returns the document positions spanning that word. Returns null otherwise —
 * including when the cursor is at the leading or trailing edge of a word,
 * since intent is ambiguous in those cases.
 */
function findWordRangeAtCursor(state, type) {
  const {
    selection
  } = state;
  if (!(selection instanceof _prosemirrorState.TextSelection)) {
    return null;
  }
  const $cursor = selection.$cursor;
  if (!$cursor || !$cursor.parent.isTextblock) {
    return null;
  }
  if (!$cursor.parent.type.allowsMarkType(type)) {
    return null;
  }
  const parentStart = $cursor.start();
  const parentEnd = $cursor.end();
  const text = state.doc.textBetween(parentStart, parentEnd, undefined, ATOM_PLACEHOLDER);
  const offset = $cursor.pos - parentStart;
  const before = offset > 0 ? text[offset - 1] : "";
  const after = offset < text.length ? text[offset] : "";
  if (!wordCharRegex.test(before) || !wordCharRegex.test(after)) {
    return null;
  }
  let start = offset;
  let end = offset;
  while (start > 0 && wordCharRegex.test(text[start - 1])) {
    start--;
  }
  while (end < text.length && wordCharRegex.test(text[end])) {
    end++;
  }
  return {
    from: parentStart + start,
    to: parentStart + end
  };
}
function rangeHasMarkWithAttrs(state, type, attrs, from, to) {
  if (!state.doc.rangeHasMark(from, to, type)) {
    return false;
  }
  if (!attrs) {
    return true;
  }
  return (0, _getMarksBetween.getMarksBetween)(from, to, state).some(_ref => {
    let {
      mark
    } = _ref;
    return mark.type === type && Object.keys(attrs).every(key => mark.attrs[key] === attrs[key]);
  });
}

/**
 * Toggles a mark on the current selection, if the mark is already with
 * matching attributes it will remove the mark instead, if the mark is active
 * but with different attributes it will update the mark with the new attributes.
 *
 * When invoked with an empty cursor sitting inside a word (with word
 * characters on both sides), the mark is applied to that whole word without
 * altering the user's selection.
 *
 * @param type - The mark type to toggle.
 * @param attrs - The attributes to apply to the mark.
 * @returns A prosemirror command.
 */
function toggleMark(type, attrs) {
  return (state, dispatch) => {
    const wordRange = findWordRangeAtCursor(state, type);
    if (wordRange) {
      const {
        from,
        to
      } = wordRange;
      const hasMatching = rangeHasMarkWithAttrs(state, type, attrs, from, to);
      if (dispatch) {
        const tr = state.tr.removeMark(from, to, type);
        if (!hasMatching) {
          tr.addMark(from, to, type.create(attrs));
        }
        dispatch(tr);
      }
      return true;
    }
    if ((0, _isMarkActive.isMarkActive)(type, attrs)(state)) {
      return (0, _prosemirrorCommands.toggleMark)(type)(state, dispatch);
    }
    if ((0, _isMarkActive.isMarkActive)(type)(state)) {
      return (0, _chainTransactions.chainTransactions)((0, _prosemirrorCommands.toggleMark)(type), (0, _prosemirrorCommands.toggleMark)(type, attrs))(state, dispatch);
    }
    return (0, _prosemirrorCommands.toggleMark)(type, attrs)(state, dispatch);
  };
}