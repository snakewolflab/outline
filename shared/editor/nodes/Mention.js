"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _urls = require("../../utils/urls");
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _env = _interopRequireDefault(require("../../env"));
var _types = require("../../types");
var _Mentions = require("../components/Mentions");
var _mention = require("../lib/mention");
var _findParentNode = require("../queries/findParentNode");
var _isInList = require("../queries/isInList");
var _isList = require("../queries/isList");
var _mention2 = _interopRequireDefault(require("../rules/mention"));
var _Node = _interopRequireDefault(require("./Node"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Mention extends _Node.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "component", props => {
      switch (props.node.attrs.type) {
        case _types.MentionType.User:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionUser, {
            ...props
          });
        case _types.MentionType.Group:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionGroup, {
            ...props
          });
        case _types.MentionType.Document:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionDocument, {
            ...props
          });
        case _types.MentionType.Collection:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionCollection, {
            ...props
          });
        case _types.MentionType.Issue:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionIssue, {
            ...props,
            onChangeUnfurl: this.handleChangeUnfurl(props)
          });
        case _types.MentionType.PullRequest:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionPullRequest, {
            ...props,
            onChangeUnfurl: this.handleChangeUnfurl(props)
          });
        case _types.MentionType.Project:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionProject, {
            ...props,
            onChangeUnfurl: this.handleChangeUnfurl(props)
          });
        case _types.MentionType.URL:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionURL, {
            ...props,
            onChangeUnfurl: this.handleChangeUnfurl(props)
          });
        case _types.MentionType.Date:
          return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Mentions.MentionDate, {
            ...props,
            onChangeDate: this.handleChangeDate(props)
          });
        default:
          return null;
      }
    });
    _defineProperty(this, "handleChangeDate", _ref => {
      let {
        node,
        getPos
      } = _ref;
      return modelId => {
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;
        const pos = getPos();
        if (node.attrs.modelId === modelId) {
          return;
        }
        const transaction = tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          modelId,
          label: modelId
        });
        view.dispatch(transaction);
      };
    });
    _defineProperty(this, "handleChangeUnfurl", _ref2 => {
      let {
        node,
        getPos
      } = _ref2;
      return unfurl => {
        const {
          view
        } = this.editor;
        const {
          tr
        } = view.state;
        const label = unfurl.type === _types.UnfurlResourceType.Issue || unfurl.type === _types.UnfurlResourceType.PR || unfurl.type === _types.UnfurlResourceType.URL ? unfurl.title : unfurl.type === _types.UnfurlResourceType.Project ? unfurl.name : undefined;
        const overrides = label ? {
          label
        } : {};
        overrides.unfurl = unfurl;
        const pos = getPos();
        if (!(0, _compat.isMatch)(node.attrs, overrides)) {
          const transaction = tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            ...overrides
          });
          view.dispatch(transaction);
        }
      };
    });
  }
  get name() {
    return "mention";
  }
  get schema() {
    const toPlainText = node => node.attrs.type === _types.MentionType.User ? `@${node.attrs.label}` : node.attrs.label;
    return {
      attrs: {
        type: {
          default: _types.MentionType.User
        },
        label: {},
        modelId: {},
        actorId: {
          default: undefined
        },
        id: {
          default: undefined
        },
        href: {
          default: undefined
        },
        unfurl: {
          default: undefined
        }
      },
      inline: true,
      marks: "",
      group: "inline",
      atom: true,
      parseDOM: [{
        tag: `.${this.name}`,
        preserveWhitespace: "full",
        priority: 100,
        getAttrs: dom => {
          const type = dom.dataset.type;
          const modelId = dom.dataset.id;
          if (!type || !modelId) {
            return false;
          }
          return {
            type,
            modelId,
            actorId: dom.dataset.actorid,
            label: dom.innerText,
            id: dom.id,
            href: dom.getAttribute("href"),
            unfurl: dom.dataset.unfurl ? JSON.parse(dom.dataset.unfurl) : undefined
          };
        }
      }],
      toDOM: node => [node.attrs.type === _types.MentionType.User || node.attrs.type === _types.MentionType.Date ? "span" : "a", {
        // Date mentions are self-contained and have nothing to unfurl, so
        // they opt out of the hover preview behaviour.
        class: node.attrs.type === _types.MentionType.Date ? node.type.name : `${node.type.name} use-hover-preview`,
        id: node.attrs.id,
        href: node.attrs.type === _types.MentionType.User || node.attrs.type === _types.MentionType.Date ? undefined : node.attrs.type === _types.MentionType.Document ? `${_env.default.URL}/doc/${node.attrs.modelId}` : node.attrs.type === _types.MentionType.Collection ? `${_env.default.URL}/collection/${node.attrs.modelId}` : (0, _urls.sanitizeUrl)(node.attrs.href),
        "data-type": node.attrs.type,
        "data-id": node.attrs.modelId,
        "data-actorid": node.attrs.actorId,
        "data-url": node.attrs.type === _types.MentionType.PullRequest || node.attrs.type === _types.MentionType.Issue || node.attrs.type === _types.MentionType.Project ? (0, _urls.sanitizeUrl)(node.attrs.href) : `mention://${node.attrs.id}/${node.attrs.type}/${node.attrs.modelId}`,
        "data-unfurl": JSON.stringify(node.attrs.unfurl)
      }, toPlainText(node)],
      leafText: toPlainText
    };
  }
  get rulePlugins() {
    return [_mention2.default];
  }
  get plugins() {
    return [
    // Ensure mentions have unique IDs
    new _prosemirrorState.Plugin({
      appendTransaction: (_transactions, _oldState, newState) => {
        const tr = newState.tr;
        const existingIds = new Set();
        let modified = false;
        tr.doc.descendants((node, pos) => {
          let nodeId = node.attrs.id;
          if (node.type.name === this.name && (!nodeId || existingIds.has(nodeId))) {
            nodeId = (0, _uuid.v4)();
            modified = true;
            tr.setNodeAttribute(pos, "id", nodeId);
          }
          existingIds.add(nodeId);
        });
        if (modified) {
          return tr;
        }
        return null;
      }
    })];
  }
  keys() {
    const NavigableMention = [_types.MentionType.Collection, _types.MentionType.Document, _types.MentionType.Issue, _types.MentionType.PullRequest, _types.MentionType.Project];
    return {
      Enter: state => {
        const {
          selection
        } = state;
        if (selection instanceof _prosemirrorState.NodeSelection && selection.node.type.name === this.name && NavigableMention.includes(selection.node.attrs.type)) {
          const mentionType = selection.node.attrs.type;
          let link;
          if (mentionType === _types.MentionType.Issue || mentionType === _types.MentionType.PullRequest || mentionType === _types.MentionType.Project) {
            link = selection.node.attrs.href;
          } else {
            const {
              modelId
            } = selection.node.attrs;
            const linkType = selection.node.attrs.type === _types.MentionType.Document ? "doc" : "collection";
            link = `/${linkType}/${modelId}`;
          }
          this.editor.props.onClickLink?.(link);
          return true;
        }
        return false;
      }
    };
  }
  commands(_ref3) {
    let {
      type
    } = _ref3;
    return {
      mention: attrs => (state, dispatch) => {
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
      },
      mention_list: attrs => (state, dispatch) => {
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
        const listNodeWithMentions = (0, _mention.transformListToMentions)(listNode, this.editor.schema, attrs);
        const tr = state.tr.deleteRange(from, to);
        dispatch?.(tr.setSelection(_prosemirrorState.TextSelection.near(tr.doc.resolve(from))).replaceSelectionWith(listNodeWithMentions));
        return true;
      }
    };
  }
  toMarkdown(state, node) {
    const mType = node.attrs.type;
    const mId = node.attrs.modelId;
    const label = node.attrs.label;
    const id = node.attrs.id;

    // Use regular links for document and collection mentions
    if (mType === _types.MentionType.Document) {
      state.write(`[${label}](/doc/${mId})`);
    } else if (mType === _types.MentionType.Collection) {
      state.write(`[${label}](/collection/${mId})`);
    } else {
      // Keep the existing mention:// format for other types (user, group, issue, pull_request, url)
      state.write(`@[${label}](mention://${id}/${mType}/${mId})`);
    }
  }
  parseMarkdown() {
    return {
      node: "mention",
      getAttrs: tok => ({
        id: tok.attrGet("id"),
        type: tok.attrGet("type"),
        modelId: tok.attrGet("modelId"),
        label: tok.content
      })
    };
  }
}
exports.default = Mention;