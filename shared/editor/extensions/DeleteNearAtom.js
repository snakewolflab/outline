"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * GitHub Issue: https://github.com/outline/outline/issues/10681
 */
class DeleteNearAtom extends _Extension.default {
  get name() {
    return "deleteNearAtom";
  }
  keys() {
    return {
      Delete: deleteForwardNearAtom(),
      Backspace: deleteBackwardNearAtom()
    };
  }
}
exports.default = DeleteNearAtom;
function deleteForwardNearAtom() {
  return (state, dispatch) => {
    const {
      selection
    } = state;
    if (!(selection instanceof _prosemirrorState.TextSelection)) {
      return false;
    }
    const {
      $cursor
    } = selection;
    if (!$cursor) {
      return false;
    }
    if ($cursor.textOffset !== 0) {
      return false;
    }
    const nodeAfter = $cursor.nodeAfter;
    if (!nodeAfter?.isText || nodeAfter.nodeSize !== 1) {
      return false;
    }
    const textEndPos = $cursor.pos + nodeAfter.nodeSize;
    if (textEndPos >= $cursor.end()) {
      return false;
    }
    const $afterText = state.doc.resolve(textEndPos);
    const nodeAfterText = $afterText.nodeAfter;
    if (nodeAfterText?.isAtom && nodeAfterText.isInline) {
      if (dispatch) {
        dispatch(state.tr.delete($cursor.pos, $cursor.pos + 1).scrollIntoView());
      }
      return true;
    }
    return false;
  };
}
function deleteBackwardNearAtom() {
  return (state, dispatch) => {
    const {
      selection
    } = state;
    if (!(selection instanceof _prosemirrorState.TextSelection)) {
      return false;
    }
    const {
      $cursor
    } = selection;
    if (!$cursor) {
      return false;
    }
    const nodeBefore = $cursor.nodeBefore;
    const nodeAfter = $cursor.nodeAfter;
    if (!nodeBefore?.isText || nodeBefore.nodeSize !== 1) {
      return false;
    }
    if (nodeAfter?.isAtom && nodeAfter.isInline) {
      if (dispatch) {
        dispatch(state.tr.delete($cursor.pos - 1, $cursor.pos).scrollIntoView());
      }
      return true;
    }
    return false;
  };
}