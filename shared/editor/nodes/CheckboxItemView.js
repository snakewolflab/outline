"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckboxItemView = void 0;
var _prosemirrorState = require("prosemirror-state");
var _uuid = require("uuid");
var _browser = require("../../utils/browser");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const checkboxSVG = `<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><rect class="checkbox-box" x="1" y="1" width="12" height="12" rx="3" /><path class="checkbox-tick" d="M3.5 7.3L6 9.8L10.5 4.2" /></svg>`;

/**
 * Custom NodeView for checkbox items. Keeps the DOM stable across checked
 * state changes so the tick can transition its stroke when toggled, and
 * handles clicks on both the checkbox and the margin beside it.
 */
class CheckboxItemView {
  constructor(node, _view, getPos) {
    _defineProperty(this, "dom", void 0);
    _defineProperty(this, "contentDOM", void 0);
    _defineProperty(this, "view", void 0);
    _defineProperty(this, "getPos", void 0);
    _defineProperty(this, "checkbox", void 0);
    _defineProperty(this, "wrapper", void 0);
    _defineProperty(this, "handleClick", event => {
      // The target may be the checkbox itself, the SVG inside it, or the
      // surrounding margin, so resolve up to the nearest checkbox element.
      if (!(event.target instanceof Element)) {
        return;
      }
      const checkbox = event.target.closest(".checkbox");
      const pos = this.getPos();
      if (pos === undefined) {
        return;
      }
      const {
        view
      } = this;
      const {
        tr,
        doc
      } = view.state;
      if (checkbox) {
        // Clicking the checkbox toggles its checked state.
        view.dispatch(tr.setNodeMarkup(pos, undefined, {
          checked: checkbox.getAttribute("aria-checked") !== "true"
        }));
      } else if (view.editable) {
        // Clicking the margin beside the checkbox focuses the start of the item.
        view.dispatch(tr.setSelection(_prosemirrorState.TextSelection.near(doc.resolve(pos + 1))));
        view.focus();
      }
    });
    this.view = _view;
    this.getPos = getPos;
    const id = `checkbox-${(0, _uuid.v4)()}`;
    this.dom = document.createElement("li");
    this.dom.setAttribute("data-type", "checkbox_item");
    this.checkbox = document.createElement("span");
    this.checkbox.tabIndex = -1;
    this.checkbox.className = "checkbox";
    this.checkbox.setAttribute("aria-labelledby", id);
    this.checkbox.setAttribute("role", "checkbox");
    this.checkbox.innerHTML = checkboxSVG;
    this.wrapper = document.createElement("span");
    this.wrapper.contentEditable = "false";
    this.wrapper.appendChild(this.checkbox);
    if (_browser.isBrowser) {
      this.wrapper.addEventListener("click", this.handleClick);
    }
    this.contentDOM = document.createElement("div");
    this.contentDOM.id = id;
    this.dom.appendChild(this.wrapper);
    this.dom.appendChild(this.contentDOM);
    this.updateChecked(node);
  }
  update(node) {
    if (node.type.name !== "checkbox_item") {
      return false;
    }
    this.updateChecked(node);
    return true;
  }
  ignoreMutation(mutation) {
    // Only mutations within the editable content should be read by the editor;
    // the checkbox chrome is managed here.
    return !this.contentDOM.contains(mutation.target);
  }
  destroy() {
    if (_browser.isBrowser) {
      this.wrapper.removeEventListener("click", this.handleClick);
    }
  }
  updateChecked(node) {
    const checked = !!node.attrs.checked;
    this.checkbox.setAttribute("aria-checked", checked.toString());
    this.dom.classList.toggle("checked", checked);
  }
}
exports.CheckboxItemView = CheckboxItemView;