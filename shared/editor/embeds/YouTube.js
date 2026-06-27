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
function YouTube(_ref, ref) {
  let {
    matches,
    ...props
  } = _ref;
  const videoId = matches[1];
  let src;
  try {
    const url = new URL(props.attrs.href);
    const searchParams = new URLSearchParams(url.search);
    const start = searchParams.get("t")?.replace(/s$/, "");

    // Youtube returns the url in a html encoded format where
    // '&' is replaced by '&amp;'. So we also check if the search params
    // contain html encoded query params.
    const clip = (searchParams.get("clip") || searchParams.get("amp;clip"))?.replace(/s$/, "");
    const clipt = (searchParams.get("clipt") || searchParams.get("amp;clipt"))?.replace(/s$/, "");
    src = `https://www.youtube.com/embed/${videoId}?modestbranding=1${start ? `&start=${start}` : ""}${clip ? `&clip=${clip}` : ""}${clipt ? `&clipt=${clipt}` : ""}`;
  } catch (_e) {
    // noop
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
    ...props,
    referrerPolicy: "strict-origin-when-cross-origin",
    src: src,
    title: `YouTube (${videoId})`,
    ref: ref
  });
}
var _default = exports.default = /*#__PURE__*/React.forwardRef(YouTube);