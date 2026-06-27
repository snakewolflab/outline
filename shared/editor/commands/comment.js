"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addComment = void 0;
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _isMarkActive = require("../queries/isMarkActive");
var _chainTransactions = require("../lib/chainTransactions");
var _addMark = require("./addMark");
var _collapseSelection = require("./collapseSelection");
var _prosemirrorCommands = require("prosemirror-commands");
const addComment = attrs => (0, _prosemirrorCommands.chainCommands)(addCommentTextSelection(attrs), addCommentNodeSelection(attrs));
exports.addComment = addComment;
const addCommentNodeSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const {
    selection
  } = state;
  const existingMarks = selection.node.attrs.marks ?? [];
  const newMark = {
    type: "comment",
    attrs: {
      id: (0, _uuid.v4)(),
      userId: attrs.userId,
      draft: true
    }
  };
  const newAttrs = {
    ...selection.node.attrs,
    marks: [...existingMarks, newMark]
  };
  dispatch?.(state.tr.setNodeMarkup(selection.from, undefined, newAttrs));
  return true;
};
const addCommentTextSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  if (state.selection.empty) {
    return false;
  }
  if ((0, _isMarkActive.isMarkActive)(state.schema.marks.comment, {
    resolved: false
  }, {
    exact: true
  })(state)) {
    return false;
  }
  (0, _chainTransactions.chainTransactions)((0, _addMark.addMark)(state.schema.marks.comment, {
    id: (0, _uuid.v4)(),
    userId: attrs.userId,
    draft: true
  }), (0, _collapseSelection.collapseSelection)())(state, dispatch);
  return true;
};