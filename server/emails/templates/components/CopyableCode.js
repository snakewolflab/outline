"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const style = {
  fontFamily: "monospace",
  fontSize: "20px",
  display: "inline-block",
  padding: "10px 20px",
  color: "#111319",
  background: "#F9FBFC",
  fontWeight: "500",
  borderRadius: "2px",
  letterSpacing: "0.1em"
};
const CopyableCode = props => /*#__PURE__*/(0, _jsxRuntime.jsx)("pre", {
  ...props,
  style: style,
  children: props.children
});
var _default = exports.default = CopyableCode;