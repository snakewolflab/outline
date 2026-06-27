"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorModel = require("prosemirror-model");
var _prosemirrorState = require("prosemirror-state");
var React = _interopRequireWildcard(require("react"));
var _urls = require("../../utils/urls");
var _Embed2 = _interopRequireDefault(require("../components/Embed"));
var _embeds = _interopRequireDefault(require("../embeds"));
var _embeds2 = require("../lib/embeds");
var _Node = _interopRequireDefault(require("./Node"));
var _isInList = require("../queries/isInList");
var _findParentNode = require("../queries/findParentNode");
var _isList = require("../queries/isList");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Embed extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "handleChangeSize", _ref => {
      let {
        node,
        getPos
      } = _ref;
      return _ref2 => {
        let {
          width,
          height
        } = _ref2;
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;
        const pos = getPos();
        const transaction = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          width,
          height
        }).setMeta("addToHistory", true);
        const $pos = transaction.doc.resolve(getPos());
        view.dispatch(transaction.setSelection(new _prosemirrorState.NodeSelection($pos)));
      };
    });
    _defineProperty(this, "component", props => {
      const {
        embeds,
        embedsDisabled
      } = this.editor.props;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Embed2.default, {
        ...props,
        embeds: embeds,
        embedsDisabled: embedsDisabled,
        onChangeSize: this.handleChangeSize(props)
      });
    });
  }
  get name() {
    return "embed";
  }
  get schema() {
    return {
      content: "inline*",
      group: "block",
      atom: true,
      attrs: {
        href: {
          validate: "string"
        },
        width: {
          default: null
        },
        height: {
          default: null
        }
      },
      parseDOM: [{
        tag: "iframe",
        getAttrs: dom => {
          const embeds = this.editor?.props.embeds ?? _embeds.default;
          const href = dom.getAttribute("data-canonical-url") || "";
          const response = (0, _embeds2.getMatchingEmbed)(embeds, href);
          if (response) {
            return {
              href
            };
          }
          return false;
        }
      }, {
        tag: "a.embed",
        getAttrs: dom => ({
          href: dom.getAttribute("href")
        })
      }],
      toDOM: node => {
        const embeds = this.editor?.props.embeds ?? _embeds.default;
        const response = (0, _embeds2.getMatchingEmbed)(embeds, node.attrs.href);
        const src = response?.embed.transformMatch?.(response.matches);
        if (src) {
          return ["iframe", {
            class: "embed",
            frameborder: "0",
            src: (0, _urls.sanitizeUrl)(src),
            contentEditable: "false",
            allowfullscreen: "true",
            "data-canonical-url": (0, _urls.sanitizeUrl)(node.attrs.href)
          }];
        } else {
          return ["a", {
            class: "embed",
            href: (0, _urls.sanitizeUrl)(node.attrs.href),
            contentEditable: "false",
            "data-canonical-url": (0, _urls.sanitizeUrl)(node.attrs.href)
          }, response?.embed.title ?? node.attrs.href];
        }
      },
      leafText: node => node.attrs.href
    };
  }
  commands(_ref3) {
    let {
      type
    } = _ref3;
    return {
      embed: attrs => (state, dispatch) => {
        dispatch?.(state.tr.replaceSelectionWith(type.create(attrs)).scrollIntoView());
        return true;
      },
      embed_list: _attrs => (state, dispatch) => {
        const {
          selection
        } = state;
        const position = selection instanceof _prosemirrorState.TextSelection ? selection.$cursor?.pos : selection.$to.pos;
        if (position === undefined || !(0, _isInList.isInList)(state)) {
          return false;
        }
        const resolvedPos = state.tr.doc.resolve(position);
        const nodeWithPos = (0, _findParentNode.findParentNodeClosestToPos)(resolvedPos, node => (0, _isList.isList)(node, this.editor.schema));
        if (!nodeWithPos) {
          return false;
        }
        const listNode = nodeWithPos.node,
          from = nodeWithPos.pos,
          to = from + listNode.nodeSize;
        const nodes = (0, _embeds2.transformListToEmbeds)(listNode, this.editor.schema);
        const slice = new _prosemirrorModel.Slice(_prosemirrorModel.Fragment.fromArray(nodes), 0, 0);
        const tr = state.tr.deleteRange(from, to);
        dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(from))).replaceSelection(slice).scrollIntoView());
        return true;
      }
    };
  }
  toMarkdown(state, node) {
    if (!state.inTable) {
      state.ensureNewLine();
    }
    const href = node.attrs.href.replace(/_/g, "%5F");
    state.write("[" + state.esc(href, false) + "](" + state.esc(href, false) + ")");
    if (!state.inTable) {
      state.write("\n\n");
    }
  }
  parseMarkdown() {
    return {
      node: "embed",
      getAttrs: token => ({
        href: token.attrGet("href")
      })
    };
  }
}
exports.default = Embed;