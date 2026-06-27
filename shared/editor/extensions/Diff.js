"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _mobx = require("mobx");
var _prosemirrorState = require("prosemirror-state");
var _prosemirrorView = require("prosemirror-view");
var _prosemirrorModel = require("prosemirror-model");
var _scrollIntoViewIfNeeded = _interopRequireDefault(require("scroll-into-view-if-needed"));
var _Extension = _interopRequireDefault(require("../lib/Extension"));
var _utils = require("../styles/utils");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _ToggleBlock = require("../nodes/ToggleBlock");
var _class, _descriptor;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
const pluginKey = new _prosemirrorState.PluginKey("diffs");

/**
 * Options for the Diff extension.
 */
let Diff = exports.default = (_class = class Diff extends _Extension.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "currentChangeIndex", _descriptor, this);
  }
  get name() {
    return "diff";
  }
  get defaultOptions() {
    return {
      changes: null,
      insertionClassName: _EditorStyleHelper.EditorStyleHelper.diffInsertion,
      deletionClassName: _EditorStyleHelper.EditorStyleHelper.diffDeletion,
      nodeInsertionClassName: _EditorStyleHelper.EditorStyleHelper.diffNodeInsertion,
      nodeDeletionClassName: _EditorStyleHelper.EditorStyleHelper.diffNodeDeletion,
      modificationClassName: _EditorStyleHelper.EditorStyleHelper.diffModification,
      nodeModificationClassName: _EditorStyleHelper.EditorStyleHelper.diffNodeModification,
      currentChangeClassName: _EditorStyleHelper.EditorStyleHelper.diffCurrentChange
    };
  }
  commands() {
    return {
      /**
       * Navigate to the next change in the document.
       */
      nextChange: () => this.goToChange(1),
      /**
       * Navigate to the previous change in the document.
       */
      prevChange: () => this.goToChange(-1)
    };
  }

  /**
   * Get the current change index being viewed.
   *
   * @returns the index of the current change, or -1 if no change is selected.
   */
  getCurrentChangeIndex() {
    return this.currentChangeIndex;
  }

  /**
   * Get the total number of individual changes.
   *
   * @returns the total count of all inserted, deleted, and modified items.
   */
  getTotalChangesCount() {
    const {
      changes
    } = this.options;
    if (!changes) {
      return 0;
    }
    return changes.reduce((total, change) => total + change.inserted.length + change.deleted.length + change.modified.length, 0);
  }
  goToChange(direction) {
    return (state, dispatch) => {
      const totalChanges = this.getTotalChangesCount();
      if (totalChanges === 0) {
        return false;
      }
      if (direction > 0) {
        if (this.currentChangeIndex >= totalChanges - 1) {
          this.currentChangeIndex = 0;
        } else {
          this.currentChangeIndex += 1;
        }
      } else {
        if (this.currentChangeIndex === 0) {
          this.currentChangeIndex = totalChanges - 1;
        } else {
          this.currentChangeIndex -= 1;
        }
      }
      dispatch?.(state.tr.setMeta(pluginKey, {}));
      const element = window.document.querySelector(`.${this.options.currentChangeClassName}`);
      if (element) {
        (0, _scrollIntoViewIfNeeded.default)(element, {
          scrollMode: "if-needed",
          block: "center"
        });
      }
      return true;
    };
  }
  get allowInReadOnly() {
    return true;
  }
  get plugins() {
    return [new _prosemirrorState.Plugin({
      key: pluginKey,
      state: {
        init: (_, state) => this.createDecorations(state.doc),
        apply: (tr, prev) => {
          if (!tr.docChanged && !tr.getMeta(pluginKey)) {
            return prev;
          }
          return this.createDecorations(tr.doc);
        }
      },
      props: {
        decorations(state) {
          return this.getState(state);
        }
      },
      // Block doc-changing transactions to keep the diff immutable, but
      // allow selection updates and a few cooperating plugins through.
      filterTransaction: tr => !tr.docChanged || !!tr.getMeta("codeHighlighting") || !!tr.getMeta(pluginKey) || !!tr.getMeta(_ToggleBlock.toggleFoldPluginKey)
    })];
  }
  createDecorations(doc) {
    const {
      changes
    } = this.options;
    const decorations = [];

    /**
     * Determines if a slice should use node decoration instead of inline decoration.
     */
    const shouldUseNodeDecoration = slice => {
      if (slice?.content.childCount === 1) {
        const node = slice.content.firstChild;
        if (node && !node.isText && (node.isBlock && node.type.name !== "paragraph" || node.isInline && node.isAtom)) {
          return true;
        }
      }
      return false;
    };

    /**
     * Adds the appropriate decoration for a change.
     */
    const addChangeDecoration = (pos, end, className, useNodeDecoration) => {
      if (useNodeDecoration) {
        decorations.push(_prosemirrorView.Decoration.node(pos, end, {
          class: className
        }));
      } else {
        decorations.push(_prosemirrorView.Decoration.inline(pos, end, {
          class: className
        }));
      }
    };

    /**
     * Recursively unwrap nodes that are redundant or invalid given the
     * current context.
     */
    const unwrap = ($pos, fragment) => {
      const result = [];
      fragment.forEach(node => {
        let isRedundant = false;
        for (let d = 0; d <= $pos.depth; d++) {
          const ancestor = $pos.node(d);
          const ancestorRole = ancestor.type.spec.tableRole;
          const nodeRole = node.type.spec.tableRole;
          if (ancestor.type.name === node.type.name || ancestorRole === "row" && (nodeRole === "cell" || nodeRole === "header_cell") || ancestorRole === "table" && nodeRole === "row") {
            isRedundant = true;
            break;
          }
        }
        if (node.isBlock && (isRedundant || $pos.parent.type.inlineContent)) {
          result.push(...unwrap($pos, node.content));
        } else {
          result.push(node);
        }
      });
      return result;
    };

    // Add insertion, deletion, and modification decorations
    let individualChangeIndex = 0;
    changes?.forEach(change => {
      let pos = change.fromB;
      change.deleted.forEach(deletion => {
        const isCurrent = individualChangeIndex === this.currentChangeIndex;
        if (!deletion.data.slice) {
          return;
        }
        const $pos = doc.resolve(change.fromB);
        const parentRole = $pos.parent.type.spec.tableRole;
        const parentGroup = $pos.parent.type.spec.group;
        let tag = $pos.parent.type.inlineContent ? "span" : "div";
        if (parentRole === "table") {
          tag = "tr";
        } else if (parentRole === "row") {
          tag = "td";
        } else if (parentGroup?.includes("list")) {
          tag = "li";
        }
        const useNodeDecoration = shouldUseNodeDecoration(deletion.data.slice);

        // Check if we're deleting a single paragraph - if so, use <p> tag
        // and unwrap the paragraph content to avoid nested <p> tags
        let contentToSerialize = deletion.data.slice.content;
        if (deletion.data.slice.content.childCount === 1) {
          const deletedNode = deletion.data.slice.content.firstChild;
          if (deletedNode?.type.name === "paragraph") {
            tag = "p";
            // Unwrap the paragraph to get just its inline content
            contentToSerialize = deletedNode.content;
          }
        }
        const fragment = _prosemirrorModel.Fragment.from(unwrap($pos, contentToSerialize));
        decorations.push(_prosemirrorView.Decoration.widget(change.fromB, view => {
          const dom = view.dom.ownerDocument.createElement(tag);
          dom.setAttribute("class", (0, _utils.cn)({
            [this.options.currentChangeClassName]: isCurrent,
            [this.options.deletionClassName]: !useNodeDecoration,
            [this.options.nodeDeletionClassName]: useNodeDecoration
          }));
          dom.appendChild(_prosemirrorModel.DOMSerializer.fromSchema(doc.type.schema).serializeFragment(fragment, {
            document: view.dom.ownerDocument
          }));
          return dom;
        }, {
          side: -1
        }));
        individualChangeIndex++;
      });
      change.inserted.forEach(insertion => {
        const isCurrent = individualChangeIndex === this.currentChangeIndex;
        const end = pos + insertion.length;
        const useNodeDecoration = shouldUseNodeDecoration(insertion.data.step.slice);
        const className = (0, _utils.cn)({
          [this.options.currentChangeClassName]: isCurrent,
          [this.options.insertionClassName]: !useNodeDecoration,
          [this.options.nodeInsertionClassName]: useNodeDecoration
        });
        addChangeDecoration(pos, end, className, useNodeDecoration);
        pos = end;
        individualChangeIndex++;
      });

      // Add modification decorations
      change.modified.forEach(modification => {
        const isCurrent = individualChangeIndex === this.currentChangeIndex;
        // A modification slice may contain multiple nodes (e.g., multiple table cells)
        // We need to add a decoration for each node individually
        if (!modification.data.slice) {
          return;
        }
        modification.data.slice.content.forEach(node => {
          const nodeSize = node.nodeSize;
          const end = pos + nodeSize;

          // Check if this specific node should use node decoration
          const useNodeDecoration = !node.isText && (node.isBlock && node.type.name !== "paragraph" || node.isInline && node.isAtom);
          const className = (0, _utils.cn)({
            [this.options.currentChangeClassName]: isCurrent,
            [this.options.modificationClassName]: !useNodeDecoration,
            [this.options.nodeModificationClassName]: useNodeDecoration
          });
          addChangeDecoration(pos, end, className, useNodeDecoration);
          pos = end;
        });
        individualChangeIndex++;
      });
    });
    return _prosemirrorView.DecorationSet.create(doc, decorations);
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "currentChangeIndex", [_mobx.observable], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return -1;
  }
}), _class);