"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorCommands = require("prosemirror-commands");
var _deleteEmptyFirstParagraph = _interopRequireDefault(require("../commands/deleteEmptyFirstParagraph"));
var _Node = _interopRequireDefault(require("./Node"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class Paragraph extends _Node.default {
  get name() {
    return "paragraph";
  }
  get schema() {
    return {
      content: "inline*",
      group: "block",
      parseDOM: [{
        tag: "p",
        getAttrs: dom => {
          if (!(dom instanceof HTMLElement)) {
            return false;
          }

          // We must suppress image captions from being parsed as a separate paragraph.
          if (dom.classList.contains(_EditorStyleHelper.EditorStyleHelper.imageCaption)) {
            return false;
          }
          return {};
        }
      }],
      toDOM: () => ["p", {
        dir: "auto"
      }, 0]
    };
  }
  keys(_ref) {
    let {
      type
    } = _ref;
    return {
      "Shift-Ctrl-0": (0, _prosemirrorCommands.setBlockType)(type),
      Backspace: _deleteEmptyFirstParagraph.default
    };
  }
  commands(_ref2) {
    let {
      type
    } = _ref2;
    return () => (0, _prosemirrorCommands.setBlockType)(type);
  }
  toMarkdown(state, node) {
    // render empty paragraphs as hard breaks to ensure that newlines are
    // persisted between reloads (this breaks from markdown tradition)
    if (node.textContent.trim() === "" && node.childCount === 0 && !state.inTable) {
      state.write(state.options.commonMark ? "\n" : "\\\n");
    } else {
      state.renderInline(node);
      state.closeBlock(node);
    }
  }
  parseMarkdown() {
    return {
      block: "paragraph"
    };
  }
}
exports.default = Paragraph;