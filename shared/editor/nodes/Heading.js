"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.HeadingLevel = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _i18next = require("i18next");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _sonner = require("sonner");
var _browser = require("../../utils/browser");
var _backspaceToParagraph = _interopRequireDefault(require("../commands/backspaceToParagraph"));
var _toggleBlockType = _interopRequireDefault(require("../commands/toggleBlockType"));
var _Node = _interopRequireDefault(require("./Node"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
let HeadingLevel = exports.HeadingLevel = /*#__PURE__*/function (HeadingLevel) {
  HeadingLevel[HeadingLevel["One"] = 1] = "One";
  HeadingLevel[HeadingLevel["Two"] = 2] = "Two";
  HeadingLevel[HeadingLevel["Three"] = 3] = "Three";
  HeadingLevel[HeadingLevel["Four"] = 4] = "Four";
  return HeadingLevel;
}({});
/**
 * Options for the Heading node.
 */
class Heading extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "handleCopyLink", event => {
      if (!(event.currentTarget instanceof HTMLButtonElement)) {
        return;
      }
      const heading = event.currentTarget.closest(".heading-content");
      if (!heading) {
        return;
      }

      // Search previous siblings for the anchor element, as other elements
      // (e.g. multiplayer cursors) may be inserted between the anchor and heading.
      let anchor = heading.previousElementSibling;
      while (anchor && !anchor.className?.includes(_EditorStyleHelper.EditorStyleHelper.headingPositionAnchor)) {
        anchor = anchor.previousElementSibling;
      }
      if (!anchor) {
        return;
      }
      const hash = `#${anchor.id}`;

      // the existing url might contain a hash already, lets make sure to remove
      // that rather than appending another one.
      const normalizedUrl = window.location.href.split("#")[0].replace("/edit", "");
      (0, _copyToClipboard.default)(normalizedUrl + hash);
      _sonner.toast.message((0, _i18next.t)("Link copied to clipboard"));
    });
  }
  get name() {
    return "heading";
  }
  get defaultOptions() {
    return {
      levels: [1, 2, 3, 4]
    };
  }
  get schema() {
    return {
      attrs: {
        level: {
          default: 1,
          validate: "number"
        },
        collapsed: {
          default: undefined
        }
      },
      content: "inline*",
      group: "block",
      defining: true,
      draggable: false,
      parseDOM: this.options.levels.map(level => ({
        tag: `h${level}`,
        attrs: {
          level
        }
      })),
      toDOM: node => [`h${node.attrs.level + (this.options.offset || 0)}`, {
        dir: "auto",
        class: "heading-content"
      }, 0]
    };
  }
  toMarkdown(state, node) {
    state.write(state.repeat("#", node.attrs.level) + " ");
    state.renderInline(node);
    state.closeBlock(node);
  }
  parseMarkdown() {
    return {
      block: "heading",
      getAttrs: token => ({
        level: +token.tag.slice(1)
      })
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return attrs => (0, _toggleBlockType.default)(type, schema.nodes.paragraph, attrs);
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    const options = this.options.levels.reduce((items, level) => ({
      ...items,
      [`Shift-Ctrl-${level}`]: (0, _toggleBlockType.default)(type, schema.nodes.paragraph, {
        level
      })
    }), {});
    return {
      ...options,
      Backspace: (0, _backspaceToParagraph.default)(type),
      ArrowLeft: (state, dispatch) => {
        if (!_browser.isSafari) {
          return false;
        }
        const {
          $from,
          empty
        } = state.selection;
        if (!empty || $from.parent.type !== type) {
          return false;
        }
        const end = $from.end();
        if ($from.pos !== end || !$from.parent.lastChild?.isText) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, end - 1)).scrollIntoView());
        }
        return true;
      },
      // Cmd+Left in Firefox lands the DOM caret inside the heading-anchor
      // widget (contentEditable=false, ignoreSelection: true), so Prosemirror
      // does not update its model. Subsequent commands like Enter then operate
      // on the stale position. Move the model selection explicitly to keep it
      // in sync with the visual caret.
      "Mod-ArrowLeft": (state, dispatch) => {
        const {
          $from,
          empty
        } = state.selection;
        if (!empty || $from.parent.type !== type) {
          return false;
        }
        const start = $from.start();
        if ($from.pos === start) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, start)).scrollIntoView());
        }
        return true;
      }
    };
  }
  get plugins() {
    const createWidgetDecorations = doc => {
      const decorations = [];
      doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          // Create anchor button to copy a link to the heading
          const anchor = document.createElement("button");
          anchor.innerText = "#";
          anchor.type = "button";
          anchor.contentEditable = "false";
          anchor.className = "heading-anchor";
          anchor.setAttribute("aria-label", "Copy link to heading");
          anchor.addEventListener("mousedown", event => this.handleCopyLink(event));
          decorations.push(_prosemirrorView.Decoration.widget(
          // Safari requires the widget to be placed at the end of the node rather than the beginning
          // or caret selection is not correct, browser quirk – see issue #1234
          _browser.isSafari ? pos + node.nodeSize - 1 : pos + 1, anchor, {
            // Safari keeps this widget at the end; positive side preserves IME
            // insertion order, while relaxed side preserves caret navigation.
            side: _browser.isSafari ? 1 : -1,
            ignoreSelection: true,
            relaxedSide: _browser.isSafari,
            key: pos.toString()
          }));

          // Creates a "space" for the caret to move to before the widget.
          // Without this it is very hard to place the caret at the beginning
          // of the heading when it begins with an atom element.
          if (node.firstChild?.isAtom === false) {
            decorations.push(_prosemirrorView.Decoration.widget(pos + 1, () => document.createElement("span"), {
              side: -1,
              ignoreSelection: true,
              relaxedSide: true,
              key: "span"
            }));
          }
        }
      });
      return decorations;
    };
    const widgetsPlugin = new _prosemirrorState.Plugin({
      state: {
        init(_, _ref3) {
          let {
            doc
          } = _ref3;
          return _prosemirrorView.DecorationSet.create(doc, createWidgetDecorations(doc));
        },
        apply(tr, oldDecoSet) {
          if (tr.docChanged) {
            return _prosemirrorView.DecorationSet.create(tr.doc, createWidgetDecorations(tr.doc));
          }
          return oldDecoSet.map(tr.mapping, tr.doc);
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      }
    });
    return [widgetsPlugin];
  }
  inputRules(_ref4) {
    let {
      type
    } = _ref4;
    return this.options.levels.map(level => (0, _prosemirrorInputrules.textblockTypeInputRule)(new RegExp(`^(#{1,${level}})\\s$`), type, () => ({
      level
    })));
  }
}
exports.default = Heading;