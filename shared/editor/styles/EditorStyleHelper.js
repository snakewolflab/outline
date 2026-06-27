"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EditorStyleHelper = void 0;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Class names and values used by the editor.
 */
class EditorStyleHelper {}
exports.EditorStyleHelper = EditorStyleHelper;
// Blocks
_defineProperty(EditorStyleHelper, "blockRadius", "6px");
// Images
_defineProperty(EditorStyleHelper, "imageHandle", "image-handle");
_defineProperty(EditorStyleHelper, "imageCaption", "caption");
_defineProperty(EditorStyleHelper, "imagePositionAnchor", "image-position-anchor");
/** Class added to body when resizing images/media */
_defineProperty(EditorStyleHelper, "resizeDragging", "resize-dragging");
// Headings
_defineProperty(EditorStyleHelper, "headingPositionAnchor", "heading-position-anchor");
// Comments
_defineProperty(EditorStyleHelper, "comment", "comment-marker");
// Multiplayer
/** Remote collaborator's cursor */
_defineProperty(EditorStyleHelper, "multiplayerCursor", "ProseMirror-yjs-cursor");
/** Remote collaborator's selection */
_defineProperty(EditorStyleHelper, "multiplayerSelection", "ProseMirror-yjs-selection");
// Code
_defineProperty(EditorStyleHelper, "codeBlock", "code-block");
_defineProperty(EditorStyleHelper, "codeWord", "code-word");
_defineProperty(EditorStyleHelper, "hexColorSwatch", "hex-color-swatch");
_defineProperty(EditorStyleHelper, "hexColorSwatchLight", "hex-color-swatch-light");
_defineProperty(EditorStyleHelper, "hexColorSwatchDark", "hex-color-swatch-dark");
/** Toggle button for collapsible code blocks */
_defineProperty(EditorStyleHelper, "codeBlockToggle", "code-block-toggle");
// Diffs
_defineProperty(EditorStyleHelper, "diffInsertion", "diff-insertion");
_defineProperty(EditorStyleHelper, "diffDeletion", "diff-deletion");
_defineProperty(EditorStyleHelper, "diffNodeInsertion", "diff-node-insertion");
_defineProperty(EditorStyleHelper, "diffNodeDeletion", "diff-node-deletion");
_defineProperty(EditorStyleHelper, "diffModification", "diff-modification");
_defineProperty(EditorStyleHelper, "diffNodeModification", "diff-node-modification");
_defineProperty(EditorStyleHelper, "diffCurrentChange", "current-diff");
// Toggle blocks
/** Toggle block wrapper */
_defineProperty(EditorStyleHelper, "toggleBlock", "toggle-block");
/** Toggle block button */
_defineProperty(EditorStyleHelper, "toggleBlockButton", "toggle-block-button");
/** Toggle block content area */
_defineProperty(EditorStyleHelper, "toggleBlockContent", "toggle-block-content");
/** Toggle block head (first child) */
_defineProperty(EditorStyleHelper, "toggleBlockHead", "toggle-block-head");
/** Toggle block folded state */
_defineProperty(EditorStyleHelper, "toggleBlockFolded", "folded");
// Checkbox Lists
/** Checkbox list wrapper */
_defineProperty(EditorStyleHelper, "checklistWrapper", "checklist-wrapper");
/** Toggle button for showing/hiding completed items */
_defineProperty(EditorStyleHelper, "checklistCompletedToggle", "checklist-completed-toggle");
/** State when completed items are hidden */
_defineProperty(EditorStyleHelper, "checklistCompletedHidden", "completed-hidden");
// Tables
/** Table wrapper */
_defineProperty(EditorStyleHelper, "table", "table-wrapper");
/** Table grip (circle in top left) */
_defineProperty(EditorStyleHelper, "tableGrip", "table-grip");
/** Table row grip */
_defineProperty(EditorStyleHelper, "tableGripRow", "table-grip-row");
/** Table column grip */
_defineProperty(EditorStyleHelper, "tableGripColumn", "table-grip-column");
/** "Plus" to add column on tables */
_defineProperty(EditorStyleHelper, "tableAddColumn", "table-add-column");
/** "Plus" to add row on tables */
_defineProperty(EditorStyleHelper, "tableAddRow", "table-add-row");
/** Scrollable area of table */
_defineProperty(EditorStyleHelper, "tableScrollable", "table-scrollable");
/** Full-width table layout */
_defineProperty(EditorStyleHelper, "tableFullWidth", "table-full-width");
/** Shadow on the right side of the table */
_defineProperty(EditorStyleHelper, "tableShadowRight", "table-shadow-right");
/** Shadow on the left side of the table */
_defineProperty(EditorStyleHelper, "tableShadowLeft", "table-shadow-left");
/** Sticky header state */
_defineProperty(EditorStyleHelper, "tableStickyHeader", "table-sticky-header");
/** Drop indicator for table drag and drop */
_defineProperty(EditorStyleHelper, "tableDragDropIndicator", "table-drag-drop-indicator");
/** Class added to body when dragging table rows/columns */
_defineProperty(EditorStyleHelper, "tableDragging", "table-dragging");
/** Drag indicator on left side of cell */
_defineProperty(EditorStyleHelper, "tableDragIndicatorLeft", "table-drag-indicator-left");
/** Drag indicator on right side of cell */
_defineProperty(EditorStyleHelper, "tableDragIndicatorRight", "table-drag-indicator-right");
/** Drag indicator on top side of cell */
_defineProperty(EditorStyleHelper, "tableDragIndicatorTop", "table-drag-indicator-top");
/** Drag indicator on bottom side of cell */
_defineProperty(EditorStyleHelper, "tableDragIndicatorBottom", "table-drag-indicator-bottom");
// Global
/** Minimum padding around editor */
_defineProperty(EditorStyleHelper, "padding", 32);
/** Table of contents width */
_defineProperty(EditorStyleHelper, "tocWidth", 256);
/** Width of the document content area */
_defineProperty(EditorStyleHelper, "documentWidth", "52em");
/** Gutter width for the document (for decorations, etc) */
_defineProperty(EditorStyleHelper, "documentGutter", "88px");