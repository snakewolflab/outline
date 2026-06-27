"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _i18next = require("i18next");
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _sonner = require("sonner");
var _browser = require("../../utils/browser");
var _backspaceToParagraph = _interopRequireDefault(require("../commands/backspaceToParagraph"));
var _codeFence = require("../commands/codeFence");
var _selectAll = require("../commands/selectAll");
var _toggleBlockType = _interopRequireDefault(require("../commands/toggleBlockType"));
var _CodeHighlighting = require("../extensions/CodeHighlighting");
var _Mermaid = _interopRequireWildcard(require("../extensions/Mermaid"));
var _code = require("../lib/code");
var _isCode = require("../lib/isCode");
var _multiplayer = require("../lib/multiplayer");
var _findChildren = require("../queries/findChildren");
var _tableCell = require("../lib/markdown/tableCell");
var _findNewlines = require("../queries/findNewlines");
var _findParentNode = require("../queries/findParentNode");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _getMarkRange = require("../queries/getMarkRange");
var _isInCode = require("../queries/isInCode");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const DEFAULT_LANGUAGE = "javascript";

/** Fraction of the viewport height above which a code block is collapsible. */
const COLLAPSE_HEIGHT_RATIO = 0.5;

/** Approximate rendered line height of a code block, in pixels. */
const CODE_LINE_HEIGHT = 20;
/**
 * Find all code block positions whose estimated height exceeds
 * COLLAPSE_HEIGHT_RATIO of the viewport height.
 *
 * @param doc - the document to scan.
 * @returns set of positions of tall code blocks.
 */
function findTallBlocks(doc) {
  const tall = new Set();
  if (!_browser.isBrowser) {
    return tall;
  }
  const maxLines = window.innerHeight * COLLAPSE_HEIGHT_RATIO / CODE_LINE_HEIGHT;
  for (const block of (0, _findChildren.findBlockNodes)(doc, true)) {
    if ((0, _isCode.isCode)(block.node)) {
      const lines = (block.node.textContent.match(/\n/g)?.length ?? 0) + 1;
      if (lines > maxLines) {
        tall.add(block.pos);
      }
    }
  }
  return tall;
}

/**
 * Build a CollapseState with node decorations for the collapsed class and
 * widget decorations for toggle buttons on all tall blocks.
 */
function buildCollapseState(doc, tallBlocks, collapsedBlocks, expandLabel, collapseLabel) {
  const decorations = [];
  for (const pos of tallBlocks) {
    const node = doc.nodeAt(pos);
    if (!node || !(0, _isCode.isCode)(node)) {
      continue;
    }
    const isCollapsed = collapsedBlocks.has(pos);
    if (isCollapsed) {
      const totalLines = (node.textContent.match(/\n/g)?.length ?? 0) + 1;
      const gutterWidth = String(totalLines).length;
      const lineNumberText = Array.from({
        length: totalLines
      }, (_, i) => String(i + 1).padStart(gutterWidth, " ")).join("\n");
      decorations.push(_prosemirrorView.Decoration.node(pos, pos + node.nodeSize, {
        class: "collapsed",
        "data-line-numbers": lineNumberText
      }, {
        collapsed: true
      }));
    }
    const label = isCollapsed ? expandLabel : collapseLabel;
    decorations.push(_prosemirrorView.Decoration.widget(pos + node.nodeSize, () => {
      const button = document.createElement("button");
      button.className = _EditorStyleHelper.EditorStyleHelper.codeBlockToggle;
      button.contentEditable = "false";
      button.type = "button";
      button.textContent = label;
      return button;
    }, {
      side: 1,
      key: `toggle-${pos}-${isCollapsed}`
    }));
  }
  return {
    tallBlocks,
    collapsedBlocks,
    decorations: _prosemirrorView.DecorationSet.create(doc, decorations)
  };
}

/**
 * Options for the CodeFence node.
 */

class CodeFence extends _Node.default {
  get showLineNumbers() {
    return this.options.userPreferences?.codeBlockLineNumbers ?? true;
  }
  get name() {
    return "code_fence";
  }
  get schema() {
    return {
      attrs: {
        language: {
          default: DEFAULT_LANGUAGE,
          validate: "string"
        },
        wrap: {
          default: false,
          validate: "boolean"
        }
      },
      content: "text*",
      marks: "comment",
      group: "block",
      code: true,
      defining: true,
      draggable: false,
      parseDOM: [{
        tag: `.${_EditorStyleHelper.EditorStyleHelper.codeBlock}`,
        preserveWhitespace: "full",
        contentElement: node => node.querySelector("code") || node,
        getAttrs: dom => ({
          language: dom.dataset.language,
          wrap: dom.classList.contains("with-line-wrap")
        })
      }, {
        tag: "code",
        preserveWhitespace: "full",
        getAttrs: dom => {
          // Only parse code blocks that contain newlines for code fences,
          // otherwise the code mark rule will be applied.
          if (!dom.textContent?.includes("\n")) {
            return false;
          }
          return {
            language: dom.dataset.language
          };
        }
      }],
      toDOM: node => {
        const classes = [_EditorStyleHelper.EditorStyleHelper.codeBlock, node.attrs.wrap ? "with-line-wrap" : this.showLineNumbers ? "with-line-numbers" : ""].filter(Boolean).join(" ");
        return ["div", {
          class: classes,
          "data-language": node.attrs.language
        }, ["pre", ["code", {
          spellCheck: "false"
        }, 0]]];
      }
    };
  }
  commands(_ref) {
    let {
      type,
      schema
    } = _ref;
    return {
      code_block: attrs => {
        if (attrs?.language) {
          (0, _code.setRecentlyUsedCodeLanguage)(attrs.language);
        }
        return (0, _toggleBlockType.default)(type, schema.nodes.paragraph, {
          language: (0, _code.getRecentlyUsedCodeLanguage)() ?? DEFAULT_LANGUAGE,
          ...attrs
        });
      },
      expandCodeBlockAt: pos => (state, dispatch) => {
        const $pos = state.doc.resolve(pos);
        const codeBlock = (0, _findParentNode.findParentNodeClosestToPos)($pos, _isCode.isCode);
        if (!codeBlock) {
          return false;
        }
        const collapseState = CodeFence.collapseKey.getState(state);
        if (!collapseState?.collapsedBlocks.has(codeBlock.pos)) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.setMeta(CodeFence.collapseKey, {
            expand: codeBlock.pos
          }).setMeta("addToHistory", false));
        }
        return true;
      },
      toggleCodeBlockCollapse: () => (state, dispatch) => {
        const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
        if (!codeBlock) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.setMeta(CodeFence.collapseKey, {
            toggle: codeBlock.pos
          }).setMeta("addToHistory", false));
        }
        return true;
      },
      toggleCodeBlockWrap: () => (state, dispatch) => {
        const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
        if (!codeBlock) {
          return false;
        }
        if (dispatch) {
          dispatch(state.tr.setNodeMarkup(codeBlock.pos, undefined, {
            ...codeBlock.node.attrs,
            wrap: !codeBlock.node.attrs.wrap
          }));
        }
        return true;
      },
      edit_mermaid: () => (state, dispatch) => {
        const codeBlock = state.selection instanceof _prosemirrorState.NodeSelection && (0, _isCode.isCode)(state.selection.node) ? {
          pos: state.selection.from,
          node: state.selection.node
        } : (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
        if (!codeBlock || !(0, _isCode.isMermaid)(codeBlock.node)) {
          return false;
        }
        const mermaidState = _Mermaid.pluginKey.getState(state);
        const decorations = mermaidState?.decorationSet.find(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize);
        const nodeDecoration = decorations?.find(d => d.spec.diagramId && d.from === codeBlock.pos);
        const diagramId = nodeDecoration?.spec.diagramId;
        if (dispatch && diagramId) {
          dispatch(state.tr.setMeta(_Mermaid.pluginKey, {
            editingId: mermaidState?.editingId === diagramId ? undefined : diagramId
          }).setSelection(_prosemirrorState.TextSelection.create(state.doc, codeBlock.pos + 1)).scrollIntoView());
        }
        return true;
      },
      copyToClipboard: () => (state, dispatch) => {
        const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
        if (codeBlock) {
          (0, _copyToClipboard.default)(codeBlock.node.textContent);
          _sonner.toast.message((0, _i18next.t)("Copied to clipboard"));
          return true;
        }
        const {
          doc,
          tr
        } = state;
        const range = (0, _getMarkRange.getMarkRange)(doc.resolve(state.selection.from), this.editor.schema.marks.code_inline) || (0, _getMarkRange.getMarkRange)(doc.resolve(state.selection.to), this.editor.schema.marks.code_inline);
        if (range) {
          const $end = doc.resolve(range.to);
          tr.setSelection(new _prosemirrorState.TextSelection($end, $end));
          dispatch?.(tr);
          (0, _copyToClipboard.default)(tr.doc.textBetween(state.selection.from, state.selection.to));
          _sonner.toast.message((0, _i18next.t)("Copied to clipboard"));
          return true;
        }
        return false;
      }
    };
  }
  get allowInReadOnly() {
    return true;
  }
  keys(_ref2) {
    let {
      type,
      schema
    } = _ref2;
    const output = {
      // Both shortcuts work, but Shift-Ctrl-c matches the one in the menu
      "Shift-Ctrl-c": (0, _toggleBlockType.default)(type, schema.nodes.paragraph),
      "Shift-Ctrl-\\": (0, _toggleBlockType.default)(type, schema.nodes.paragraph),
      "Shift-Tab": _codeFence.outdentInCode,
      Tab: _codeFence.indentInCode,
      Enter: _codeFence.enterInCode,
      Backspace: (0, _backspaceToParagraph.default)(type),
      "Shift-Enter": _codeFence.newlineInCode,
      "Mod-a": (0, _selectAll.selectAll)(type),
      "Mod-]": _codeFence.indentInCode,
      "Mod-[": _codeFence.outdentInCode
    };
    if (_browser.isMac) {
      return {
        ...output,
        "Ctrl-a": _codeFence.moveToPreviousNewline,
        "Ctrl-e": _codeFence.moveToNextNewline
      };
    }
    return output;
  }

  /** Plugins for collapsible code block behavior. */
  collapsePlugins() {
    const collapseKey = CodeFence.collapseKey;
    const build = (doc, tall, collapsed) => buildCollapseState(doc, tall, collapsed, (0, _i18next.t)("Expand"), (0, _i18next.t)("Collapse"));
    return [
    // Main collapse plugin: manages state and decorations
    new _prosemirrorState.Plugin({
      key: collapseKey,
      state: {
        init: (_config, state) => {
          const tallBlocks = findTallBlocks(state.doc);
          return build(state.doc, tallBlocks, new Set(tallBlocks));
        },
        apply: (tr, prev, _oldState, newState) => {
          const meta = tr.getMeta(collapseKey);

          // Toggle collapsed state
          if (meta?.toggle !== undefined) {
            const next = new Set(prev.collapsedBlocks);
            if (next.has(meta.toggle)) {
              next.delete(meta.toggle);
            } else {
              next.add(meta.toggle);
            }
            return build(newState.doc, prev.tallBlocks, next);
          }

          // Expand a specific block (auto-expand on focus)
          if (meta?.expand !== undefined) {
            if (prev.collapsedBlocks.has(meta.expand)) {
              const next = new Set(prev.collapsedBlocks);
              next.delete(meta.expand);
              return build(newState.doc, prev.tallBlocks, next);
            }
            return prev;
          }

          // Recompute tall blocks on doc changes. Newly tall blocks are only
          // auto-collapsed when content arrives via load/remote sync — never
          // while the user is typing, which would collapse the block under
          // the cursor.
          if (tr.docChanged) {
            const tallBlocks = findTallBlocks(newState.doc);
            const collapsedBlocks = new Set();
            const isRemote = (0, _multiplayer.isRemoteTransaction)(tr);
            const inverse = tr.mapping.invert();
            for (const pos of tallBlocks) {
              const oldPos = inverse.map(pos);
              if (isRemote && !prev.tallBlocks.has(oldPos)) {
                // Newly tall blocks start collapsed on load
                collapsedBlocks.add(pos);
              } else if (prev.collapsedBlocks.has(oldPos)) {
                // Preserve previous collapsed state
                collapsedBlocks.add(pos);
              }
            }
            return build(newState.doc, tallBlocks, collapsedBlocks);
          }
          return prev;
        }
      },
      props: {
        decorations(state) {
          return this.getState(state)?.decorations ?? _prosemirrorView.DecorationSet.empty;
        }
      }
    }),
    // Click handler for toggle button + auto-expand on focus
    new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("collapse-toggle"),
      appendTransaction: (transactions, oldState, newState) => {
        const hasCollapseMeta = transactions.some(tr => tr.getMeta(collapseKey));
        const hasSelectionSet = transactions.some(tr => tr.selectionSet);
        if (hasCollapseMeta || !hasSelectionSet) {
          return null;
        }
        const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(newState.selection);
        const collapseState = collapseKey.getState(newState);
        if (!codeBlock || !collapseState?.collapsedBlocks.has(codeBlock.pos)) {
          return null;
        }

        // Only auto-expand when the selection moved INTO the block. If the
        // selection was already inside this block (e.g. after the user just
        // clicked Collapse while the cursor was inside), don't re-expand.
        const oldCodeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(oldState.selection);
        if (oldCodeBlock?.pos === codeBlock.pos) {
          return null;
        }
        return newState.tr.setMeta(collapseKey, {
          expand: codeBlock.pos
        }).setMeta("addToHistory", false);
      },
      props: {
        handleDOMEvents: {
          mousedown: (view, event) => {
            const target = event.target;
            const button = target.closest(`.${_EditorStyleHelper.EditorStyleHelper.codeBlockToggle}`);
            if (!button) {
              return false;
            }
            const codeBlockEl = button.previousElementSibling?.classList.contains(_EditorStyleHelper.EditorStyleHelper.codeBlock) ? button.previousElementSibling : null;
            if (!codeBlockEl) {
              return false;
            }
            const codeEl = codeBlockEl.querySelector("code");
            if (!codeEl) {
              return false;
            }
            const pos = view.posAtDOM(codeEl, 0);
            const $pos = view.state.doc.resolve(pos);
            const parent = (0, _findParentNode.findParentNodeClosestToPos)($pos, _isCode.isCode);
            if (!parent) {
              return false;
            }
            const collapseState = collapseKey.getState(view.state);
            const isCollapsing = !collapseState?.collapsedBlocks.has(parent.pos);
            view.dispatch(view.state.tr.setMeta(collapseKey, {
              toggle: parent.pos
            }).setMeta("addToHistory", false));
            if (isCollapsing) {
              codeBlockEl.scrollIntoView({
                block: "nearest"
              });
            }
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
        }
      }
    })];
  }
  get plugins() {
    const createActiveCodeBlockDecoration = state => {
      const codeBlock = (0, _findParentNode.findParentNode)(_isCode.isCode)(state.selection);
      if (!codeBlock) {
        return _prosemirrorView.DecorationSet.empty;
      }
      if ((0, _isCode.isMermaid)(codeBlock.node)) {
        const mermaidState = _Mermaid.pluginKey.getState(state);
        const decorations = mermaidState?.decorationSet.find(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize);
        const nodeDecoration = decorations?.find(d => d.spec.diagramId && d.from === codeBlock.pos);
        const diagramId = nodeDecoration?.spec.diagramId;
        if (!diagramId || mermaidState?.editingId !== diagramId) {
          return _prosemirrorView.DecorationSet.empty;
        }
      }
      const decoration = _prosemirrorView.Decoration.node(codeBlock.pos, codeBlock.pos + codeBlock.node.nodeSize, {
        class: "code-active"
      });
      return _prosemirrorView.DecorationSet.create(state.doc, [decoration]);
    };
    return [(0, _CodeHighlighting.CodeHighlighting)({
      name: this.name,
      lineNumbers: this.showLineNumbers
    }), this.name === "code_fence" ? (0, _Mermaid.default)({
      isDark: this.editor.props.theme.isDark,
      editor: this.editor
    }) : undefined, new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("code-fence-split"),
      props: {
        handleTextInput: (view, _from, _to, text) => {
          if (text === "`") {
            const {
              state,
              dispatch
            } = view;
            return (0, _codeFence.splitCodeBlockOnTripleBackticks)(state, dispatch);
          }
          return false;
        }
      }
    }), new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("triple-click"),
      props: {
        handleDOMEvents: {
          mousedown(view, event) {
            const {
              dispatch,
              state
            } = view;
            const {
              selection: {
                $from,
                $to
              }
            } = state;
            if ($from.sameParent($to) && event.detail === 3 && (0, _isInCode.isInCode)(view.state, {
              onlyBlock: true
            })) {
              dispatch?.(state.tr.setSelection(_prosemirrorState.TextSelection.create(state.doc, (0, _findNewlines.findPreviousNewline)($from), (0, _findNewlines.findNextNewline)($from))).scrollIntoView());
              event.preventDefault();
              return true;
            }
            return false;
          }
        }
      }
    }), new _prosemirrorState.Plugin({
      key: new _prosemirrorState.PluginKey("code-fence-active"),
      state: {
        init: (_, state) => createActiveCodeBlockDecoration(state),
        apply: (tr, pluginState, oldState, newState) => {
          // Only recompute if selection or document changed
          if (!tr.selectionSet && !tr.docChanged && !tr.getMeta(_Mermaid.pluginKey)) {
            return pluginState;
          }
          return createActiveCodeBlockDecoration(newState);
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      }
    }),
    // Collapse plugins - only on code_fence (not CodeBlock subclass)
    ...(this.name === "code_fence" ? this.collapsePlugins() : [])].filter(Boolean);
  }
  inputRules(_ref3) {
    let {
      type
    } = _ref3;
    return [(0, _prosemirrorInputrules.textblockTypeInputRule)(/^```$/, type, () => ({
      language: (0, _code.getRecentlyUsedCodeLanguage)() ?? DEFAULT_LANGUAGE
    }))];
  }
  toMarkdown(state, node) {
    // Fence content bypasses esc(), so when inside a table cell escape it here
    // so it cannot break out of the column.
    const content = state.inTable ? (0, _tableCell.escapeRawTableCell)(node.textContent) : node.textContent;
    state.write("```" + (node.attrs.language || "") + "\n");
    state.text(content, false);
    state.ensureNewLine();
    state.write("```");
    state.closeBlock(node);
  }
  get markdownToken() {
    return "fence";
  }
  parseMarkdown() {
    return {
      block: "code_block",
      getAttrs: tok => ({
        language: tok.info
      }),
      noCloseToken: true
    };
  }
}
exports.default = CodeFence;
/** Plugin key for the collapse state, shared with the command. */
_defineProperty(CodeFence, "collapseKey", new _prosemirrorState.PluginKey("collapse-code-block"));