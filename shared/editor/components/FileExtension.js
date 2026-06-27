"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = FileExtension;
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
var _color = require("../../utils/color");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function FileExtension(props) {
  const parts = (props.title ?? "Unknown").split(".");
  const extension = parts.length > 1 ? parts.pop() : undefined;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Icon, {
    style: {
      background: (0, _color.stringToColor)(extension || "")
    },
    $size: props.size || 28,
    children: extension ? /*#__PURE__*/(0, _jsxRuntime.jsx)("span", {
      children: extension?.slice(0, 4)
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.AttachmentIcon, {})
  });
}
const Icon = _styledComponents.default.span.withConfig({
  componentId: "sc-kyw6eg-0"
})(["font-family:", ";display:inline-flex;align-items:center;justify-content:center;font-size:10px;text-transform:uppercase;color:white;text-align:center;border-radius:4px;min-width:", "px;height:", "px;"], (0, _styles.s)("fontFamilyMono"), props => props.$size, props => props.$size);