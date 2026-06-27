"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorState = require("prosemirror-state");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _emoji = require("../lib/emoji");
var _emoji2 = _interopRequireDefault(require("../rules/emoji"));
var _validator = require("validator");
var _CustomEmoji = require("../../components/CustomEmoji");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Emoji extends _Extension.default {
  constructor() {
    super();
    // Begin loading emoji data as soon as this extension is instantiated so
    // it is available by the time the editor renders emoji nodes.
    _defineProperty(this, "component", props => {
      const name = props.node.attrs["data-name"];
      return /*#__PURE__*/(0, _jsxRuntime.jsx)("strong", {
        className: "emoji",
        "data-name": name,
        children: (0, _validator.isUUID)(name) ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_CustomEmoji.CustomEmoji, {
          value: name,
          size: "1em"
        }) : (0, _emoji.getEmojiFromName)(name)
      });
    });
    void (0, _emoji.loadEmojiData)();
  }
  get type() {
    return "node";
  }
  get name() {
    return "emoji";
  }
  get schema() {
    return {
      attrs: {
        "data-name": {
          default: "grey_question",
          validate: "string"
        }
      },
      inline: true,
      content: "text*",
      marks: "",
      group: "inline",
      selectable: false,
      parseDOM: [{
        priority: 100,
        tag: "strong.emoji",
        preserveWhitespace: "full",
        getAttrs: dom => dom.dataset.name ? {
          "data-name": dom.dataset.name
        } : false
      }],
      toDOM: node => {
        const name = node.attrs["data-name"];
        return ["strong", {
          class: `emoji ${name}`,
          "data-name": name
        }, (0, _emoji.getEmojiFromName)(name)];
      },
      leafText: node => {
        const name = node.attrs["data-name"];
        // Custom emojis are stored as UUIDs, preserve the shortcode format
        // so they can be rendered by EmojiText component
        if ((0, _validator.isUUID)(name)) {
          return `:${name}:`;
        }
        return (0, _emoji.getEmojiFromName)(name);
      }
    };
  }
  get rulePlugins() {
    return [_emoji2.default];
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      props: {
        // Placing the caret infront of an emoji is tricky as click events directly
        // on the emoji will not behave the same way as clicks on text characters, this
        // plugin ensures that clicking on an emoji behaves more naturally.
        handleClickOn: (view, _pos, node, nodePos, event) => {
          if (node.type.name === this.name) {
            const element = event.target;
            const rect = element.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const side = clickX < rect.width / 2 ? -1 : 1;

            // If the click is in the left half of the emoji, place the caret before it
            const tr = view.state.tr.setSelection(_prosemirrorState.TextSelection.near(view.state.doc.resolve(side === -1 ? nodePos : nodePos + node.nodeSize), side));
            view.dispatch(tr);
            return true;
          }
          return false;
        }
      }
    })];
  }
  commands(_ref) {
    let {
      type
    } = _ref;
    return attrs => (state, dispatch) => {
      const {
        selection
      } = state;
      const position = selection instanceof _prosemirrorState.TextSelection ? selection.$cursor?.pos : selection.$to.pos;
      if (position === undefined) {
        return false;
      }
      const node = type.create(attrs);
      const transaction = state.tr.insert(position, node);
      dispatch?.(transaction);
      return true;
    };
  }
  toMarkdown(state, node) {
    const name = node.attrs["data-name"];
    if (name) {
      state.write(`:${name}:`);
    }
  }
  parseMarkdown() {
    return {
      node: "emoji",
      getAttrs: tok => ({
        "data-name": tok.markup.trim()
      })
    };
  }
}
exports.default = Emoji;