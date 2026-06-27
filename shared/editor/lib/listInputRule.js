"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.checkboxListInputRule = checkboxListInputRule;
exports.listWrappingInputRule = listWrappingInputRule;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _toggleList = _interopRequireDefault(require("../commands/toggleList"));
var _findParentNode = require("../queries/findParentNode");
var _isInHeading = require("../queries/isInHeading");
var _isList = require("../queries/isList");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A wrapper for wrappingInputRule that prevents execution inside heading nodes.
 * This fixes the bug where typing list triggers ("* ", "- ", "1. ", etc.) inside
 * a heading would trigger list conversion.
 */
function listWrappingInputRule(regexp, nodeType, getAttrs, joinPredicate) {
  const rule = (0, _prosemirrorInputrules.wrappingInputRule)(regexp, nodeType, getAttrs, joinPredicate);

  // Wrap the original rule to check if we're inside a heading
  return new _prosemirrorInputrules.InputRule(regexp, (state, match, start, end) => {
    // Don't apply the rule if we're inside a heading
    if ((0, _isInHeading.isInHeading)(state)) {
      return null;
    }

    // Otherwise, execute the original wrappingInputRule handler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rule.handler(state, match, start, end);
  });
}

/**
 * An input rule that converts an existing plain list (bullet or ordered) to a
 * checklist when the checkbox marker is typed at the start of a list item,
 * preserving any nested list structure.
 *
 * @param regexp the pattern matching the checkbox marker, e.g. "[ ] ".
 * @param listType the checkbox list node type to convert to.
 * @param itemType the checkbox item node type to convert items to.
 * @returns the input rule.
 */
function checkboxListInputRule(regexp, listType, itemType) {
  return new _prosemirrorInputrules.InputRule(regexp, (state, _match, start, end) => {
    const {
      schema
    } = state;

    // Only act when the selection sits inside a plain (non-checkbox) list —
    // converting a paragraph is already handled by listWrappingInputRule.
    const list = (0, _findParentNode.findParentNodeClosestToPos)(state.selection.$from, node => (0, _isList.isList)(node, schema));
    if (!list || list.node.type === listType) {
      return null;
    }

    // Remove the typed marker, then convert the list in place.
    const tr = state.tr.delete(start, end);
    const after = state.apply(tr);
    (0, _toggleList.default)(listType, itemType)(after, toggleTr => {
      toggleTr.steps.forEach(step => tr.step(step));
    });

    // Place the cursor at the start of the converted item, where the marker
    // was, so the user can continue typing.
    tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(start)));
    return tr;
  });
}