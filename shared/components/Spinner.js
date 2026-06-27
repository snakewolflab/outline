"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Spinner;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Spinner(_ref) {
  let {
    color,
    ...props
  } = _ref;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(SVG, {
    width: "16px",
    height: "16px",
    viewBox: "0 0 16 16",
    xmlns: "http://www.w3.org/2000/svg",
    ...props,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(Circle, {
      $color: color,
      fill: "none",
      strokeWidth: "2",
      strokeLinecap: "round",
      cx: "8",
      cy: "8",
      r: "6"
    })
  });
}
const SVG = _styledComponents.default.svg.withConfig({
  componentId: "sc-1dpa2my-0"
})(["@keyframes rotator{0%{transform:rotate(0deg);}100%{transform:rotate(270deg);}}animation:rotator 1.4s linear infinite;margin:4px;"]);
const Circle = _styledComponents.default.circle.withConfig({
  componentId: "sc-1dpa2my-1"
})(["@keyframes dash{0%{stroke-dashoffset:47;}50%{stroke-dashoffset:11;transform:rotate(135deg);}100%{stroke-dashoffset:47;transform:rotate(450deg);}}stroke:", ";stroke-dasharray:46;stroke-dashoffset:0;transform-origin:center;animation:dash 1.4s ease-in-out infinite;"], props => props.$color || props.theme.textSecondary);