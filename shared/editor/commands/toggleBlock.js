"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toggleBlock = exports.splitTopLevelBlockWithinBody = exports.splitBlockPreservingBody = exports.selectNodeForwardPreservingBody = exports.selectNodeBackwardPreservingBody = exports.liftAllEmptyChildBlocks = exports.liftAllChildBlocksOfNodeBefore = exports.liftAllChildBlocksOfNodeAfter = exports.joinForwardPreservingBody = exports.joinBackwardWithToggleblock = exports.joinBackwardWithHead = exports.joinBackwardWithBody = exports.indentBlock = exports.exitToggleBlockOnEmptyParagraph = exports.deleteSelectionPreservingBody = exports.dedentBlocks = exports.createParagraphNearPreservingBody = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorTransform = require("prosemirror-transform");
var _uuid = require("uuid");
var _ToggleBlock = _interopRequireWildcard(require("../nodes/ToggleBlock"));
var _toggleBlock = require("../queries/toggleBlock");
var _isInList = require("../queries/isInList");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Commands
const deleteSelectionPreservingBody = (state, dispatch) => {
  if (state.selection.empty) {
    return false;
  }
  const {
    $from
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionInToggleBlockHead)(state)) {
    return false;
  }
  const toggleBlock = $from.node($from.depth - 1);
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    return false;
  }
  const pos = $from.before($from.depth - 1);
  const {
    tr: tr1,
    body
  } = (0, _toggleBlock.detachToggleBlockBody)(pos, state.tr);
  let tr = (0, _utils.deleteSelectionTr)(tr1);
  tr = (0, _toggleBlock.attachToggleBlockBody)(pos, body, tr);
  dispatch?.(tr.scrollIntoView());
  return true;
};
exports.deleteSelectionPreservingBody = deleteSelectionPreservingBody;
const joinForwardPreservingBody = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionAtEndOfToggleBlockHead)(state)) {
    return false;
  }
  const toggleBlock = $cursor.node($cursor.depth - 1);
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    return false;
  }
  const pos = $cursor.before($cursor.depth - 1);
  const {
    tr: tr1,
    body
  } = (0, _toggleBlock.detachToggleBlockBody)(pos, state.tr);
  let tr = (0, _utils.liftChildrenOfNodeAt)(pos, tr1);
  tr = (0, _utils.joinForwardTr)(tr);
  tr = (0, _utils.wrapNodeAt)(pos, toggleBlock.type, toggleBlock.attrs, tr);
  tr = (0, _toggleBlock.attachToggleBlockBody)(pos, body, tr);
  dispatch?.(tr);
  return true;
};
exports.joinForwardPreservingBody = joinForwardPreservingBody;
const joinBackwardWithHead = (state, dispatch) => {
  const $cursor = (0, _utils.atBlockStart)(state.selection);
  if (!$cursor) {
    return false;
  }
  const $cut = (0, _utils.findCutBefore)($cursor);
  if (!$cut) {
    return false;
  }
  if (!$cut.nodeBefore || $cut.nodeBefore.type.name !== "container_toggle") {
    return false;
  }
  const toggleBlock = $cut.nodeBefore;
  if ((0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    const pos = $cut.pos - toggleBlock.nodeSize;
    const {
      tr: tr1,
      body
    } = (0, _toggleBlock.detachToggleBlockBody)(pos, state.tr);
    let tr = (0, _utils.liftChildrenOfNodeAt)(pos, tr1);
    tr = (0, _utils.joinBackwardTr)(tr);
    tr = (0, _utils.wrapNodeAt)(pos, toggleBlock.type, toggleBlock.attrs, tr);
    tr = (0, _toggleBlock.attachToggleBlockBody)(pos, body, tr);
    dispatch?.(tr);
    return true;
  }
  return (0, _prosemirrorCommands.joinTextblockBackward)(state, dispatch);
};
exports.joinBackwardWithHead = joinBackwardWithHead;
const joinBackwardWithBody = (state, dispatch) => {
  const $cursor = (0, _utils.atBlockStart)(state.selection);
  if (!$cursor) {
    return false;
  }
  const $cut = (0, _utils.findCutBefore)($cursor);
  if (!$cut) {
    return false;
  }
  if (!$cut.nodeBefore || $cut.nodeBefore.type.name !== "container_toggle") {
    return false;
  }
  const toggleBlock = $cut.nodeBefore;
  if ((0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    return false;
  }
  return (0, _prosemirrorCommands.joinTextblockBackward)(state, dispatch);
};
exports.joinBackwardWithBody = joinBackwardWithBody;
const joinBackwardWithToggleblock = exports.joinBackwardWithToggleblock = (0, _prosemirrorCommands.chainCommands)(joinBackwardWithHead, joinBackwardWithBody);
const selectNodeForwardPreservingBody = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionAtEndOfToggleBlockHead)(state)) {
    return false;
  }
  const toggleBlock = $cursor.node($cursor.depth - 1);
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    return false;
  }
  const pos = $cursor.before($cursor.depth - 1);
  const {
    tr: tr1,
    body
  } = (0, _toggleBlock.detachToggleBlockBody)(pos, state.tr);
  let tr = (0, _utils.selectNodeForwardTr)(tr1);
  tr = (0, _toggleBlock.attachToggleBlockBody)(pos, body, tr);
  dispatch?.(tr);
  return true;
};
exports.selectNodeForwardPreservingBody = selectNodeForwardPreservingBody;
const selectNodeBackwardPreservingBody = (state, dispatch) => {
  const $cursor = (0, _utils.atBlockStart)(state.selection);
  if (!$cursor) {
    return false;
  }
  const $cut = (0, _utils.findCutBefore)($cursor);
  if (!$cut) {
    return false;
  }
  if (!$cut.nodeBefore || $cut.nodeBefore.type.name !== "container_toggle") {
    return false;
  }
  const toggleBlock = $cut.nodeBefore;
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggleBlock)) {
    return false;
  }
  const pos = $cursor.before() - toggleBlock.nodeSize;
  const {
    tr: tr1,
    body
  } = (0, _toggleBlock.detachToggleBlockBody)(pos, state.tr);
  let tr = (0, _utils.selectNodeBackwardTr)(tr1);
  tr = (0, _toggleBlock.attachToggleBlockBody)(pos, body, tr);
  dispatch?.(tr);
  return true;
};
exports.selectNodeBackwardPreservingBody = selectNodeBackwardPreservingBody;
const indentBlock = (state, dispatch) => {
  // If inside a list, allow the list's Tab handler to handle indentation instead.
  if ((0, _isInList.isInList)(state)) {
    return false;
  }
  const {
    $from
  } = state.selection;
  let before = -1;
  for (let d = $from.depth; d >= 0; d--) {
    const nodeBefore = (0, _utils.prevSibling)($from, d);
    if (nodeBefore && nodeBefore.type === state.schema.nodes.container_toggle) {
      // before of nodeBefore
      before = $from.posAtIndex($from.index(d) - 1, d);
      break;
    }
  }
  if (before === -1) {
    return false;
  }
  const slice = new _prosemirrorModel.Slice(_prosemirrorModel.Fragment.from(state.schema.nodes.container_toggle.create()), 1, 0);
  const from = before + state.doc.nodeAt(before).nodeSize;
  const to = from + state.doc.nodeAt(from).nodeSize;
  const step = new _prosemirrorTransform.ReplaceAroundStep(from - 1, to, from, to, slice, 0, true);
  const tr = state.tr.step(step).scrollIntoView();
  if (dispatch) {
    dispatch(tr);
  }
  return true;
};
exports.indentBlock = indentBlock;
const toggleBlock = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionInToggleBlock)(state)) {
    return false;
  }
  const isToggle = (0, _toggleBlock.isToggleBlock)(state);
  const toggle = (0, _utils.nearest)((0, _utils.ancestors)($cursor).filter(isToggle));
  if (!toggle) {
    return false;
  }
  const d = (0, _toggleBlock.getToggleBlockDepth)($cursor, toggle);
  const pos = $cursor.before(d);
  const isFolded = (0, _toggleBlock.isToggleBlockFolded)(state, toggle);
  dispatch?.(state.tr.setMeta(_ToggleBlock.toggleFoldPluginKey, {
    type: isFolded ? _ToggleBlock.Action.UNFOLD : _ToggleBlock.Action.FOLD,
    at: pos
  }).setMeta(_ToggleBlock.toggleEventPluginKey, {
    type: isFolded ? _ToggleBlock.Action.UNFOLD : _ToggleBlock.Action.FOLD,
    at: pos
  }));
  return true;
};
exports.toggleBlock = toggleBlock;
const createParagraphNearPreservingBody = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!$cursor) {
    return false;
  }
  const atStart = (0, _toggleBlock.isSelectionAtStartOfToggleBlockHead)(state);
  const atEnd = (0, _toggleBlock.isSelectionAtEndOfToggleBlockHead)(state);
  if (!atStart && !atEnd) {
    return false;
  }
  const toggle = $cursor.node(-1);
  if (_ToggleBlock.default.isHeadEmpty(toggle)) {
    return false;
  }
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggle)) {
    return false;
  }
  const pos = (0, _utils.atBlockStart)(state.selection) ? $cursor.before(-1) : $cursor.after(-1);
  let tr = state.tr;
  tr = tr.insert(pos, state.schema.nodes.paragraph.create());
  const $before = tr.doc.resolve(tr.selection.$from.before(-1));
  const $after = tr.doc.resolve(tr.selection.$to.after(-1));
  tr = (0, _utils.atBlockStart)(tr.selection) ? tr.setSelection(_prosemirrorState.TextSelection.near($before)) : tr.setSelection(_prosemirrorState.TextSelection.near($after));
  dispatch?.(tr);
  return true;
};
exports.createParagraphNearPreservingBody = createParagraphNearPreservingBody;
const liftAllEmptyChildBlocks = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!$cursor || !(0, _toggleBlock.isSelectionAtStartOfToggleBlockHead)(state)) {
    return false;
  }
  const toggle = $cursor.node(-1);
  if (!_ToggleBlock.default.isEmpty(toggle)) {
    return false;
  }
  dispatch?.((0, _utils.liftChildrenOfNodeAt)($cursor.before(-1), state.tr));
  return true;
};
exports.liftAllEmptyChildBlocks = liftAllEmptyChildBlocks;
const liftAllChildBlocksOfNodeBefore = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!$cursor || !(0, _toggleBlock.isSelectionAtStartOfToggleBlockHead)(state)) {
    return false;
  }
  dispatch?.((0, _utils.liftChildrenOfNodeAt)($cursor.before(-1), state.tr));
  return true;
};
exports.liftAllChildBlocksOfNodeBefore = liftAllChildBlocksOfNodeBefore;
const liftAllChildBlocksOfNodeAfter = (state, dispatch) => {
  const $cursor = (0, _utils.atBlockEnd)(state.selection);
  if (!$cursor) {
    return false;
  }
  const $cut = (0, _utils.findCutAfter)($cursor);
  if (!$cut) {
    return false;
  }
  if (!$cut.nodeAfter || $cut.nodeAfter.type.name !== "container_toggle") {
    return false;
  }
  dispatch?.((0, _utils.liftChildrenOfNodeAt)($cut.pos, state.tr));
  return true;
};
exports.liftAllChildBlocksOfNodeAfter = liftAllChildBlocksOfNodeAfter;
const dedentBlocks = (state, dispatch) => {
  // If inside a list, allow the list's Shift-Tab handler to handle outdentation instead.
  if ((0, _isInList.isInList)(state)) {
    return false;
  }
  const {
    $from
  } = state.selection;
  const isToggle = (0, _toggleBlock.isToggleBlock)(state);
  const ancestor = (0, _utils.nearest)((0, _utils.ancestors)($from).filter(isToggle));
  if (!ancestor) {
    return false;
  }
  const d = (0, _toggleBlock.getToggleBlockDepth)($from, ancestor);
  const $fr_ = state.selection instanceof _prosemirrorState.NodeSelection ? state.doc.resolve($from.pos + 1) : $from;
  const $to_ = state.doc.resolve($from.end(d) - 1);
  const range = $fr_.blockRange($to_, node => node.eq(ancestor));
  if (range === null) {
    return false;
  }
  const target = (0, _prosemirrorTransform.liftTarget)(range);
  if (target === null) {
    return false;
  }
  const tr = state.tr;
  tr.lift(range, target);
  if (dispatch) {
    dispatch(tr);
  }
  return true;
};

/**
 * Exit toggle block when pressing Enter in the last empty paragraph within the body.
 */
exports.dedentBlocks = dedentBlocks;
const exitToggleBlockOnEmptyParagraph = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!$cursor) {
    return false;
  }
  if (!(0, _toggleBlock.isSelectionInToggleBlockBody)(state)) {
    return false;
  }

  // Check if current node is an empty paragraph
  const node = $cursor.parent;
  if (node.type !== state.schema.nodes.paragraph || node.content.size > 0) {
    return false;
  }

  // Check if this is the last node in the toggle block body
  const parentOfParagraph = $cursor.node(-1);
  if ($cursor.index(-1) !== parentOfParagraph.childCount - 1) {
    return false;
  }

  // Check if the paragraph is a direct child of the toggle block
  if (parentOfParagraph.type !== state.schema.nodes.container_toggle) {
    return false;
  }

  // Find the toggle block ancestor
  const isToggle = (0, _toggleBlock.isToggleBlock)(state);
  const ancestor = (0, _utils.nearest)((0, _utils.ancestors)($cursor).filter(isToggle));
  if (!ancestor) {
    return false;
  }

  // Create a range scoped to the toggle block ancestor
  const d = (0, _toggleBlock.getToggleBlockDepth)($cursor, ancestor);
  const $start = state.doc.resolve($cursor.start(d + 1));
  const $end = state.doc.resolve($cursor.end(d + 1));
  const range = $start.blockRange($end, n => n.eq(ancestor));
  if (range === null) {
    return false;
  }
  const target = (0, _prosemirrorTransform.liftTarget)(range);
  if (target === null) {
    return false;
  }
  const tr = state.tr;
  tr.lift(range, target);
  dispatch?.(tr);
  return true;
};
exports.exitToggleBlockOnEmptyParagraph = exitToggleBlockOnEmptyParagraph;
const splitBlockPreservingBody = (state, dispatch) => {
  const {
    $cursor
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionInMiddleOfToggleBlockHead)(state)) {
    return false;
  }
  const toggle = $cursor.node($cursor.depth - 1);
  if (!(0, _toggleBlock.isToggleBlockFolded)(state, toggle)) {
    return false;
  }
  let tr = state.tr;
  tr = tr.insert($cursor.after(-1), toggle.firstChild.type.create(undefined, tr.doc.slice($cursor.pos, $cursor.end()).content));
  tr = (0, _utils.wrapNodeAt)($cursor.after(-1), toggle.type, {
    id: (0, _uuid.v4)()
  }, tr);
  tr = tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve($cursor.after(-1)), 1));
  tr = tr.delete($cursor.pos, $cursor.end());
  dispatch?.(tr);
  return true;
};
exports.splitBlockPreservingBody = splitBlockPreservingBody;
const splitTopLevelBlockWithinBody = (state, dispatch) => {
  const {
    $from
  } = state.selection;
  if (!(0, _toggleBlock.isSelectionInToggleBlockBody)(state)) {
    return false;
  }
  const isToggle = (0, _toggleBlock.isToggleBlock)(state);
  const ancestor = (0, _utils.nearest)((0, _utils.ancestors)($from).filter(isToggle));
  if (!ancestor) {
    return false;
  }
  const d = (0, _toggleBlock.getToggleBlockDepth)($from, ancestor);
  if (d === $from.depth - 1) {
    // split if the block containing cursor is a direct child of a toggle block
    return (0, _prosemirrorCommands.splitBlock)(state, dispatch);
  }
  return false;
};
exports.splitTopLevelBlockWithinBody = splitTopLevelBlockWithinBody;