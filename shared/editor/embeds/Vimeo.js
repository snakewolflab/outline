"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Vimeo(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const videoId = matches[4];
  const hId = matches[5];
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
    ...props,
    src: `https://player.vimeo.com/video/${videoId}?byline=0${hId ? `&h=${hId}` : ""}`,
    title: `Vimeo Embed (${videoId})`,
    height: "412px",
    border: false,
    referrerPolicy: "strict-origin-when-cross-origin"
  });
}
var _default = exports.default = Vimeo;