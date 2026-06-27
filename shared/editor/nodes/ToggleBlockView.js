"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ToggleBlockView = void 0;
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _ToggleBlock = require("./ToggleBlock");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Custom NodeView for toggle blocks that handles fold/unfold UI interactions.
 */
class ToggleBlockView {
  constructor(node, view, getPos, decorations, _innerDecorations) {
    _defineProperty(this, "dom", void 0);
    _defineProperty(this, "contentDOM", void 0);
    _defineProperty(this, "button", void 0);
    _defineProperty(this, "node", void 0);
    _defineProperty(this, "view", void 0);
    _defineProperty(this, "getPos", void 0);
    _defineProperty(this, "boundBroadcastFoldState", void 0);
    _defineProperty(this, "handleToggleButtonClick", event => {
      event.preventDefault();
      if (event.button !== 0) {
        return;
      }
      this.handleToggle();
    });
    _defineProperty(this, "handleToggleHeadClick", event => {
      const head = this.contentDOM.querySelector(`.${_EditorStyleHelper.EditorStyleHelper.toggleBlockHead}`);
      if (!head || !head.contains(event.target)) {
        return;
      }
      const pos = this.getPos();
      if (pos === undefined) {
        return;
      }
      if (!this.view.editable) {
        // pos points "before" the toggle block node
        // pos + 1 points "before" the toggle block head node(para | heading)
        // pos + 2 points at "start" of the toggle block head node
        const $headPos = this.view.state.doc.resolve(pos + 2);
        const headStartCoords = this.view.coordsAtPos($headPos.start());
        const headEndCoords = this.view.coordsAtPos($headPos.end());
        if (event.clientX >= headStartCoords.left && event.clientX <= headEndCoords.left) {
          event.preventDefault();
          this.handleToggle();
        }
      }
    });
    _defineProperty(this, "handleToggle", () => {
      const pos = this.getPos();
      if (pos === undefined) {
        return;
      }
      const isFolded = this.dom.classList.contains(_EditorStyleHelper.EditorStyleHelper.toggleBlockFolded);
      this.view.dispatch(this.view.state.tr.setMeta(_ToggleBlock.toggleFoldPluginKey, {
        type: isFolded ? _ToggleBlock.Action.UNFOLD : _ToggleBlock.Action.FOLD,
        at: pos
      }).setMeta(_ToggleBlock.toggleEventPluginKey, {
        type: isFolded ? _ToggleBlock.Action.UNFOLD : _ToggleBlock.Action.FOLD,
        at: pos
      }));
    });
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // Create DOM structure
    this.dom = document.createElement("div");
    this.dom.className = _EditorStyleHelper.EditorStyleHelper.toggleBlock;
    this.button = document.createElement("button");
    this.button.className = _EditorStyleHelper.EditorStyleHelper.toggleBlockButton;
    this.button.contentEditable = "false";
    this.button.innerHTML = '<svg fill="currentColor" width="12" height="24" viewBox="6 0 12 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.23823905,10.6097108 L11.207376,14.4695888 L11.207376,14.4695888 C11.54411,14.907343 12.1719566,14.989236 12.6097108,14.652502 C12.6783439,14.5997073 12.7398293,14.538222 12.792624,14.4695888 L15.761761,10.6097108 L15.761761,10.6097108 C16.0984949,10.1719566 16.0166019,9.54410997 15.5788477,9.20737601 C15.4040391,9.07290785 15.1896811,9 14.969137,9 L9.03086304,9 L9.03086304,9 C8.47857829,9 8.03086304,9.44771525 8.03086304,10 C8.03086304,10.2205442 8.10377089,10.4349022 8.23823905,10.6097108 Z" /></svg>';
    this.button.addEventListener("mousedown", this.handleToggleButtonClick);
    this.contentDOM = document.createElement("div");
    this.contentDOM.className = _EditorStyleHelper.EditorStyleHelper.toggleBlockContent;
    this.contentDOM.addEventListener("mousedown", this.handleToggleHeadClick);
    this.dom.appendChild(this.button);
    this.dom.appendChild(this.contentDOM);

    // Set initial fold state from decorations
    this.syncFoldState(decorations);

    // Listen for cross-tab storage changes
    this.boundBroadcastFoldState = this.broadcastFoldState.bind(this);
    window.addEventListener("storage", this.boundBroadcastFoldState);
  }
  broadcastFoldState(event) {
    if (event.key !== (0, _ToggleBlock.toggleStorageKey)(this.node.attrs.id) || !event.newValue || !event.oldValue) {
      return;
    }
    const newFoldState = JSON.parse(event.newValue);
    const oldFoldState = JSON.parse(event.oldValue);
    if (newFoldState.fold !== oldFoldState.fold) {
      const pos = this.getPos();
      if (pos === undefined) {
        return;
      }
      this.view.dispatch(this.view.state.tr.setMeta(_ToggleBlock.toggleFoldPluginKey, {
        type: newFoldState.fold ? _ToggleBlock.Action.FOLD : _ToggleBlock.Action.UNFOLD,
        at: pos
      }).setMeta(_ToggleBlock.toggleEventPluginKey, {
        type: newFoldState.fold ? _ToggleBlock.Action.FOLD : _ToggleBlock.Action.UNFOLD,
        at: pos
      }));
    }
  }
  syncFoldState(decorations) {
    const isFolded = decorations.some(d => d.spec.fold === true);
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.toggleBlockFolded, isFolded);
  }
  update(node, decorations) {
    if (node.type !== this.node.type) {
      return false;
    }
    this.node = node;
    this.syncFoldState(decorations);
    return true;
  }
  destroy() {
    this.button.removeEventListener("mousedown", this.handleToggleButtonClick);
    this.contentDOM.removeEventListener("mousedown", this.handleToggleHeadClick);
    window.removeEventListener("storage", this.boundBroadcastFoldState);
  }
}
exports.ToggleBlockView = ToggleBlockView;