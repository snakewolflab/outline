"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _reactI18next = require("react-i18next");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A component that renders a caption for an image or video.
 */
function Caption(_ref) {
  let {
    placeholder,
    children,
    isSelected,
    width,
    onKeyDown,
    ...rest
  } = _ref;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  const handlePaste = event => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    window.document.execCommand("insertText", false, text);
  };
  const handleMouseDown = ev => {
    // always prevent clicks in caption from bubbling to the editor
    ev.stopPropagation();
  };
  const handleKeyDown = event => {
    // Cmd/Ctrl-A should select the caption text, not the whole document.
    if ((event.metaKey || event.ctrlKey) && event.key === "a") {
      event.preventDefault();
      event.stopPropagation();
      const selection = window.getSelection();
      const range = window.document.createRange();
      range.selectNodeContents(event.currentTarget);
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    onKeyDown(event);
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Content, {
    $width: width,
    $isSelected: isSelected,
    onMouseDown: handleMouseDown,
    onPaste: handlePaste,
    onKeyDown: handleKeyDown,
    className: _EditorStyleHelper.EditorStyleHelper.imageCaption,
    tabIndex: -1,
    "aria-label": t("Caption"),
    role: "textbox",
    draggable: false,
    contentEditable: true,
    suppressContentEditableWarning: true,
    "data-caption": placeholder,
    ...rest,
    children: children
  });
}
const Content = _styledComponents.default.p.withConfig({
  componentId: "sc-1edu8dz-0"
})(["cursor:text;width:", "px;min-width:200px;max-width:100%;&:empty:not(:focus){display:", ";}&:empty::before{color:", ";content:attr(data-caption);pointer-events:none;@media print{display:none;}}"], props => props.$width, props => props.$isSelected ? "block" : "none", (0, _styles.s)("placeholder"));
var _default = exports.default = Caption;