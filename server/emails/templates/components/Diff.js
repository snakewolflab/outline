"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _theme = _interopRequireDefault(require("../../../../shared/styles/theme"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
var _default = _ref => {
  let {
    children,
    ...rest
  } = _ref;
  const style = {
    border: `1.5px solid ${_theme.default.backgroundSecondary}`,
    borderRadius: "4px",
    padding: ".75em 1em",
    color: _theme.default.text,
    display: "block",
    textDecoration: "none",
    width: "100%"
  };
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
    style: style,
    className: "content-diff",
    ...rest,
    children: children
  });
};
exports.default = _default;