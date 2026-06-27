"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TableLayout = exports.MenuType = void 0;
let TableLayout = exports.TableLayout = /*#__PURE__*/function (TableLayout) {
  TableLayout["fullWidth"] = "full-width";
  return TableLayout;
}({});
/** How a selection toolbar menu is presented. */
let MenuType = exports.MenuType = /*#__PURE__*/function (MenuType) {
  /** A horizontal strip of buttons; nested options open behind a trigger. */
  MenuType["toolbar"] = "toolbar";
  /** A vertical menu rendered directly, anchored to the selection. */
  MenuType["inline"] = "inline";
  return MenuType;
}({});
/**
 * Cached selection state computed once per editor update and shared across
 * all menu functions. Avoids repeated queries against the same EditorState.
 */
/**
 * Describes a selection toolbar menu contributed by an extension. Extensions
 * return this from their `selectionToolbarMenu()` method so the toolbar can
 * pick the right menu for the current selection.
 */