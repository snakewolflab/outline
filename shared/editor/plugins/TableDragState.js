"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rowDragPluginKey = exports.columnDragPluginKey = void 0;
var _prosemirrorState = require("prosemirror-state");
/** State for tracking row drag operations. */

/** State for tracking column drag operations. */

/** Plugin key for accessing row drag state. */
const rowDragPluginKey = exports.rowDragPluginKey = new _prosemirrorState.PluginKey("row-drag");

/** Plugin key for accessing column drag state. */
const columnDragPluginKey = exports.columnDragPluginKey = new _prosemirrorState.PluginKey("column-drag");