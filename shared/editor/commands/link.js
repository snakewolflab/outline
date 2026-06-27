"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateLink = exports.toggleLink = exports.removeLink = exports.openLink = exports.addLink = void 0;
var _i18next = require("i18next");
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorState = require("prosemirror-state");
var _getMarkRange = require("../queries/getMarkRange");
var _sonner = require("sonner");
var _urls = require("../../utils/urls");
const addLinkTextSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, state.tr.selection.to)).addMark(state.selection.from, state.selection.to, state.schema.marks.link.create(attrs)));
  return true;
};
const addLinkNodeSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const {
    selection
  } = state;
  const existingMarks = selection.node.attrs.marks ?? [];
  const newMark = {
    type: "link",
    attrs
  };
  const updatedMarks = [...existingMarks, newMark];
  dispatch?.(state.tr.setNodeAttribute(selection.from, "marks", updatedMarks));
  return true;
};
const openLinkTextSelection = onClickLink => state => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  const range = (0, _getMarkRange.getMarkRange)(state.selection.$from, state.schema.marks.link);
  if (range && range.mark && onClickLink) {
    try {
      const event = new KeyboardEvent("keydown", {
        metaKey: false
      });
      onClickLink((0, _urls.sanitizeUrl)(range.mark.attrs.href) ?? "", event);
    } catch (_err) {
      _sonner.toast.error((0, _i18next.t)("Sorry, that type of link is not supported"));
    }
    return true;
  }
  return false;
};
const openLinkNodeSelection = onClickLink => state => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  if (!onClickLink) {
    return false;
  }
  const marks = state.selection.node.attrs.marks ?? [];
  const linkMark = marks.find(mark => mark.type === "link");
  if (!linkMark) {
    return false;
  }
  try {
    const event = new KeyboardEvent("keydown", {
      metaKey: false
    });
    onClickLink((0, _urls.sanitizeUrl)(linkMark.attrs.href) ?? "", event);
  } catch (_err) {
    _sonner.toast.error((0, _i18next.t)("Sorry, that type of link is not supported"));
  }
  return true;
};
const updateLinkTextSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  const range = (0, _getMarkRange.getMarkRange)(state.selection.$from, state.schema.marks.link);
  if (range && range.mark) {
    const nextSelection = _prosemirrorState.Selection.findFrom(state.doc.resolve(range.to), 1, true) ?? _prosemirrorState.TextSelection.create(state.tr.doc, 0);
    dispatch?.(state.tr.setSelection(nextSelection).removeMark(range.from, range.to, state.schema.marks.link).addMark(range.from, range.to, state.schema.marks.link.create(attrs)));
    return true;
  }
  return false;
};
const updateLinkNodeSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const markRange = (0, _getMarkRange.getMarkRangeNodeSelection)(state.selection, state.schema.marks.link);
  if (!markRange) {
    return false;
  }
  const existingMarks = state.selection.node.attrs.marks ?? [];
  const updatedMarks = existingMarks.map(mark => mark.type === "link" ? {
    ...mark,
    attrs: {
      ...mark.attrs,
      ...attrs
    }
  } : mark);
  const nextValidSelection = _prosemirrorState.Selection.findFrom(state.doc.resolve(markRange.to), 1, true) ?? _prosemirrorState.TextSelection.create(state.tr.doc, 0);
  dispatch?.(state.tr.setSelection(nextValidSelection).setNodeAttribute(state.selection.from, "marks", updatedMarks));
  return true;
};
const removeLinkTextSelection = () => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  const range = (0, _getMarkRange.getMarkRange)(state.selection.$from, state.schema.marks.link);
  if (range && range.mark) {
    const nextSelection = _prosemirrorState.Selection.findFrom(state.doc.resolve(range.to), 1, true) ?? _prosemirrorState.TextSelection.create(state.tr.doc, 0);
    dispatch?.(state.tr.setSelection(nextSelection).removeMark(range.from, range.to, range.mark));
    return true;
  }
  return false;
};
const removeLinkNodeSelection = () => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const markRange = (0, _getMarkRange.getMarkRangeNodeSelection)(state.selection, state.schema.marks.link);
  if (!markRange) {
    return false;
  }
  const existingMarks = state.selection.node.attrs.marks ?? [];
  const updatedMarks = existingMarks.filter(mark => mark.type !== "link");
  const nextValidSelection = _prosemirrorState.Selection.findFrom(state.doc.resolve(markRange.to), 1, true) ?? _prosemirrorState.TextSelection.create(state.tr.doc, 0);
  dispatch?.(state.tr.setSelection(nextValidSelection).setNodeAttribute(state.selection.from, "marks", updatedMarks));
  return true;
};
const toggleLinkTextSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.TextSelection)) {
    return false;
  }
  return (0, _prosemirrorCommands.toggleMark)(state.schema.marks.link, attrs)(state, dispatch);
};
const toggleLinkNodeSelection = attrs => (state, dispatch) => {
  if (!(state.selection instanceof _prosemirrorState.NodeSelection)) {
    return false;
  }
  const existingMarks = state.selection.node.attrs.marks ?? [];
  const linkMark = existingMarks.find(mark => mark.type === "link");
  if (linkMark) {
    return removeLinkNodeSelection()(state, dispatch);
  } else {
    return addLinkNodeSelection(attrs)(state, dispatch);
  }
};
const toggleLink = attrs => (0, _prosemirrorCommands.chainCommands)(toggleLinkTextSelection(attrs), toggleLinkNodeSelection(attrs));
exports.toggleLink = toggleLink;
const addLink = attrs => (0, _prosemirrorCommands.chainCommands)(addLinkTextSelection(attrs), addLinkNodeSelection(attrs));
exports.addLink = addLink;
const openLink = onClickLink => (0, _prosemirrorCommands.chainCommands)(openLinkTextSelection(onClickLink), openLinkNodeSelection(onClickLink));
exports.openLink = openLink;
const updateLink = attrs => (0, _prosemirrorCommands.chainCommands)(updateLinkTextSelection(attrs), updateLinkNodeSelection(attrs));
exports.updateLink = updateLink;
const removeLink = () => (0, _prosemirrorCommands.chainCommands)(removeLinkTextSelection(), removeLinkNodeSelection());
exports.removeLink = removeLink;