"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _Img = _interopRequireDefault(require("../components/Img"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Diagrams(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const {
    embed
  } = props;
  const embedUrl = matches[0];
  const params = new URL(embedUrl).searchParams;
  const titlePrefix = embed.settings?.url ? "Draw.io" : "Diagrams.net";
  const title = params.get("title") ? `${titlePrefix} (${params.get("title")})` : titlePrefix;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
    ...props,
    src: props.attrs.href,
    icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Img.default, {
      src: "/images/diagrams.png",
      alt: "Diagrams.net",
      width: 16,
      height: 16
    }),
    canonicalUrl: props.attrs.href,
    title: title,
    border: true
  });
}
var _default = exports.default = Diagrams;