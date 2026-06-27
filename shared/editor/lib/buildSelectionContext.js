"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildSelectionContext = buildSelectionContext;
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTables = require("prosemirror-tables");
var _isInCode = require("../queries/isInCode");
var _isInList = require("../queries/isInList");
var _isInNotice = require("../queries/isInNotice");
var _table = require("../queries/table");
var _browser = require("../../utils/browser");
/**
 * Build a SelectionContext from the current editor state and options. This
 * object is computed once per toolbar render and shared across all menu
 * functions, eliminating repeated queries against the same state.
 *
 * @param state - the current prosemirror editor state.
 * @param options - additional context not derivable from editor state.
 * @returns a frozen selection context.
 */
function buildSelectionContext(state, options) {
  const {
    selection,
    schema
  } = state;
  return {
    state,
    schema,
    selection,
    isEmpty: selection.empty,
    isMobile: (0, _browser.isMobile)(),
    isTouch: (0, _browser.isTouchDevice)(),
    readOnly: options.readOnly,
    isTemplate: options.isTemplate,
    rtl: options.rtl,
    isInCode: (0, _isInCode.isInCode)(state),
    isInCodeBlock: (0, _isInCode.isInCode)(state, {
      onlyBlock: true
    }),
    isInList: (0, _isInList.isInList)(state),
    isInNotice: (0, _isInNotice.isInNotice)(state),
    isTableCell: selection instanceof _prosemirrorTables.CellSelection,
    isTableSelected: (0, _table.isTableSelected)(state),
    selectedNodeType: selection instanceof _prosemirrorState.NodeSelection ? selection.node.type.name : undefined,
    colIndex: (0, _table.getColumnIndex)(state),
    rowIndex: (0, _table.getRowIndex)(state)
  };
}