"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.closeHistory = closeHistory;
var _prosemirrorHistory = require("prosemirror-history");
var _yProsemirror = require("y-prosemirror");
/**
 * Closes the current history item so that subsequent changes start a new undo
 * group. Dispatches a closeHistory transaction when prosemirror-history is
 * mounted and, when multiplayer is enabled, stops capturing on the Yjs undo
 * manager.
 *
 * @param view The editor view.
 */
function closeHistory(view) {
  if ((0, _prosemirrorHistory.undoDepth)(view.state) > 0 || (0, _prosemirrorHistory.redoDepth)(view.state) > 0) {
    view.dispatch((0, _prosemirrorHistory.closeHistory)(view.state.tr));
  }
  const yUndoState = _yProsemirror.yUndoPluginKey.getState(view.state);
  yUndoState?.undoManager?.stopCapturing();
}