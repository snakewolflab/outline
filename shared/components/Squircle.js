"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Flex = _interopRequireDefault(require("./Flex"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Squircle is a component that renders a square with rounded corners (squircle shape).
 * It's commonly used for app icons, avatars, and other UI elements where a softer
 * square shape is desired.
 */
const Squircle = _ref => {
  let {
    color,
    size = 28,
    children,
    className,
    style
  } = _ref;
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Wrapper, {
    size: size,
    align: "center",
    justify: "center",
    className: className,
    style: style,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("svg", {
      width: size,
      height: size,
      fill: color,
      viewBox: "0 0 28 28",
      "data-fixed-color": true,
      children: /*#__PURE__*/(0, _jsxRuntime.jsx)("path", {
        d: "M0 11.1776C0 1.97285 1.97285 0 11.1776 0H16.8224C26.0272 0 28 1.97285 28 11.1776V16.8224C28 26.0272 26.0272 28 16.8224 28H11.1776C1.97285 28 0 26.0272 0 16.8224V11.1776Z"
      })
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Content, {
      children: children
    })]
  });
};
const Wrapper = (0, _styledComponents.default)(_Flex.default).withConfig({
  componentId: "sc-tpifes-0"
})(["position:relative;width:", "px;height:", "px;svg{transition:fill 150ms ease-in-out;transition-delay:var(--delay);}"], props => props.size, props => props.size);
const Content = _styledComponents.default.div.withConfig({
  componentId: "sc-tpifes-1"
})(["display:flex;transform:translate(-50%,-50%);position:absolute;top:50%;left:50%;"]);
var _default = exports.default = Squircle;