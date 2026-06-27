"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxListView = void 0;
var _i18next = require("i18next");
var _browser = require("../../utils/browser");
var _Storage = _interopRequireDefault(require("../../utils/Storage"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Custom NodeView that wraps checkbox lists with a toggle control for
 * showing/hiding completed items.
 */
class CheckboxListView {
  constructor(node, _view, _getPos, userIdentifier) {
    _defineProperty(this, "dom", void 0);
    _defineProperty(this, "contentDOM", void 0);
    _defineProperty(this, "toggleControl", void 0);
    _defineProperty(this, "node", void 0);
    _defineProperty(this, "userIdentifier", void 0);
    _defineProperty(this, "isNested", void 0);
    _defineProperty(this, "handleToggleClick", clickEvent => {
      if (!_browser.isBrowser) {
        return;
      }
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
      const listId = this.node.attrs.id;
      if (!listId) {
        return;
      }
      const storageKey = `checklist-${listId}-${this.userIdentifier}-hidden`;
      const currentlyCollapsed = !!_Storage.default.get(storageKey);
      _Storage.default.set(storageKey, !currentlyCollapsed);
      this.updateToggleState();
    });
    this.node = node;
    this.userIdentifier = userIdentifier;

    // Detect if this is a nested checkbox list (inside a checkbox_item)
    const pos = _getPos();
    this.isNested = pos !== undefined && _view.state.doc.resolve(pos).parent.type.name === "checkbox_item";

    // Build DOM structure
    const wrapperElement = document.createElement("div");
    wrapperElement.classList.add(_EditorStyleHelper.EditorStyleHelper.checklistWrapper);
    this.toggleControl = document.createElement("button");
    this.toggleControl.classList.add(_EditorStyleHelper.EditorStyleHelper.checklistCompletedToggle);
    this.toggleControl.contentEditable = "false";
    this.contentDOM = document.createElement("ul");
    this.contentDOM.classList.add("checkbox_list");
    if (this.isNested) {
      this.toggleControl.style.display = "none";
      wrapperElement.appendChild(this.contentDOM);
    } else {
      if (_browser.isBrowser) {
        this.toggleControl.addEventListener("click", this.handleToggleClick);
      }
      wrapperElement.appendChild(this.toggleControl);
      wrapperElement.appendChild(this.contentDOM);
    }
    this.dom = wrapperElement;
    if (_browser.isBrowser && !this.isNested) {
      this.updateToggleState();
    }
  }
  updateToggleState() {
    if (!_browser.isBrowser || this.isNested) {
      return;
    }
    const listId = this.node.attrs.id;
    if (!listId) {
      this.toggleControl.style.display = "none";
      return;
    }
    const storageKey = `checklist-${listId}-${this.userIdentifier}-hidden`;
    const shouldCollapse = !!_Storage.default.get(storageKey);

    // Count completed items, including checkbox lists nested directly within a
    // checkbox_item (which are toggle-less). Skip checkbox lists nested via a
    // non-checkbox list, as those manage their own toggle.
    let completedItemsCount = 0;
    this.node.descendants((childNode, _pos, parent) => {
      if (childNode.type.name === "checkbox_list" && parent?.type.name !== "checkbox_item") {
        return false;
      }
      if (childNode.type.name === "checkbox_item" && childNode.attrs.checked === true) {
        completedItemsCount++;
      }
      return undefined;
    });

    // Show/hide button based on completed count
    if (completedItemsCount === 0) {
      this.toggleControl.style.display = "none";
      this.dom.classList.remove(_EditorStyleHelper.EditorStyleHelper.checklistCompletedHidden);
    } else {
      this.toggleControl.style.display = "inline-block";
      this.toggleControl.textContent = shouldCollapse ? (0, _i18next.t)("Show {{ count }} completed", {
        count: completedItemsCount
      }) : (0, _i18next.t)("Hide completed");
      if (shouldCollapse) {
        this.dom.classList.add(_EditorStyleHelper.EditorStyleHelper.checklistCompletedHidden);
      } else {
        this.dom.classList.remove(_EditorStyleHelper.EditorStyleHelper.checklistCompletedHidden);
      }
    }
  }
  update(node) {
    if (!_browser.isBrowser) {
      return false;
    }
    if (node.type.name !== "checkbox_list") {
      return false;
    }
    this.node = node;
    this.updateToggleState();
    return true;
  }
  destroy() {
    if (!_browser.isBrowser || this.isNested) {
      return;
    }
    this.toggleControl.removeEventListener("click", this.handleToggleClick);
  }
}
exports.CheckboxListView = CheckboxListView;