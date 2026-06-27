"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Berrycast;
var React = _interopRequireWildcard(require("react"));
var _reactUseMeasure = _interopRequireDefault(require("react-use-measure"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Berrycast(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const normalizedUrl = props.attrs.href.replace(/\/$/, "");
  const [measureRef, {
    width
  }] = (0, _reactUseMeasure.default)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_jsxRuntime.Fragment, {
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)("div", {
      ref: measureRef
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
      ...props,
      src: `${normalizedUrl}/video-player`,
      title: "Berrycast Embed",
      height: `${0.5625 * width}px`,
      border: false
    })]
  });
}