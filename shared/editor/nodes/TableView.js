"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TableView = void 0;
var _prosemirrorTables = require("prosemirror-tables");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _types = require("../types");
var _browser = require("../../utils/browser");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class TableView extends _prosemirrorTables.TableView {
  constructor(node, cellMinWidth) {
    super(node, cellMinWidth);
    this.node = node;
    this.cellMinWidth = cellMinWidth;
    _defineProperty(this, "scrollable", null);
    _defineProperty(this, "scrollHandler", null);
    this.dom.removeChild(this.table);
    this.dom.classList.add(_EditorStyleHelper.EditorStyleHelper.table);

    // Add an extra wrapper to enable scrolling
    this.scrollable = this.dom.appendChild(document.createElement("div"));
    this.scrollable.appendChild(this.table);
    this.scrollable.classList.add(_EditorStyleHelper.EditorStyleHelper.tableScrollable);
    if (_browser.isBrowser) {
      this.scrollable.addEventListener("scroll", () => {
        this.updateClassList(this.node);
      }, {
        passive: true
      });
    }
    this.updateClassList(node);

    // We need to wait for the next tick to ensure dom is rendered and scroll shadows are correct.
    if (_browser.isBrowser) {
      setTimeout(() => {
        if (this.dom) {
          this.updateClassList(node);
        }
      }, 0);
    }

    // Set up sticky header handling
    this.setupStickyHeader();
  }
  destroy() {
    this.cleanupStickyHeader();
  }
  update(node) {
    this.updateClassList(node);
    return super.update(node);
  }
  ignoreMutation(record) {
    if (record.type === "attributes" && record.target === this.dom && (record.attributeName === "class" || record.attributeName === "style")) {
      return true;
    }
    return record.type === "attributes" && (record.target === this.table || this.colgroup.contains(record.target));
  }
  updateClassList(node) {
    if (!_browser.isBrowser) {
      return;
    }
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableFullWidth, node.attrs.layout === _types.TableLayout.fullWidth);
    const shadowLeft = !!(this.scrollable && this.scrollable.scrollLeft > 0);
    const shadowRight = !!(this.scrollable && this.scrollable.scrollWidth > this.scrollable.clientWidth && this.scrollable.scrollLeft + this.scrollable.clientWidth < this.scrollable.scrollWidth - 1);
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableShadowLeft, shadowLeft);
    this.dom.classList.toggle(_EditorStyleHelper.EditorStyleHelper.tableShadowRight, shadowRight);
    if (this.scrollable) {
      this.dom.style.setProperty("--table-height", `${this.scrollable?.clientHeight}px`);
      this.dom.style.setProperty("--table-width", `${this.scrollable?.clientWidth}px`);
    } else {
      this.dom.style.removeProperty("--table-height");
      this.dom.style.removeProperty("--table-width");
    }
  }
  /**
   * Sets up the scroll listener for sticky header behavior. Nested tables
   * (tables within another table) are excluded from sticky header behavior.
   */
  setupStickyHeader() {
    if (!_browser.isBrowser) {
      return;
    }

    // Defer setup to ensure DOM is fully rendered
    setTimeout(() => {
      // Skip sticky header for nested tables
      if (this.dom.closest(`table .${_EditorStyleHelper.EditorStyleHelper.table}`)) {
        return;
      }
      this.scrollHandler = () => {
        this.updateStickyHeader();
      };

      // Use capture phase on document to catch all scroll events
      document.addEventListener("scroll", this.scrollHandler, {
        passive: true,
        capture: true
      });

      // Initial update
      this.updateStickyHeader();
    }, 0);
  }

  /**
   * Cleans up the scroll listener and resets header styles.
   */
  cleanupStickyHeader() {
    if (!_browser.isBrowser) {
      return;
    }
    if (this.scrollHandler) {
      document.removeEventListener("scroll", this.scrollHandler, {
        capture: true
      });
      this.scrollHandler = null;
    }

    // Reset sticky header state
    this.dom.classList.remove(_EditorStyleHelper.EditorStyleHelper.tableStickyHeader);
    this.dom.style.removeProperty("--sticky-scroll-offset");
  }

  /**
   * Updates the header row transform to create a sticky effect.
   */
  updateStickyHeader() {
    if (!_browser.isBrowser) {
      return;
    }
    const headerRow = this.table.querySelector("tr");
    if (!headerRow) {
      return;
    }
    const tableRect = this.table.getBoundingClientRect();
    const headerRowHeight = headerRow.getBoundingClientRect().height;
    const headerOffset = this.getHeaderOffset();

    // Check if the table top is above the header area but the table extends below it
    const shouldStick = tableRect.top < headerOffset && tableRect.bottom > headerOffset + headerRowHeight;
    if (shouldStick) {
      // Set the raw scroll offset - CSS will add the header offset
      const scrollOffset = Math.min(-tableRect.top, tableRect.height - headerRowHeight);
      this.dom.classList.add(_EditorStyleHelper.EditorStyleHelper.tableStickyHeader);
      this.dom.style.setProperty("--sticky-scroll-offset", `${scrollOffset}px`);
    } else {
      this.dom.classList.remove(_EditorStyleHelper.EditorStyleHelper.tableStickyHeader);
      this.dom.style.removeProperty("--sticky-scroll-offset");
    }
  }

  /**
   * Gets the current header offset from the CSS variable.
   *
   * @returns the offset in pixels from the top of the viewport.
   */
  getHeaderOffset() {
    if (!_browser.isBrowser) {
      return TableView.HEADER_HEIGHT;
    }
    const value = getComputedStyle(document.documentElement).getPropertyValue("--header-offset");
    return value ? parseFloat(value) : TableView.HEADER_HEIGHT;
  }
}
exports.TableView = TableView;
/** Default height of the app's fixed header */
_defineProperty(TableView, "HEADER_HEIGHT", 64);