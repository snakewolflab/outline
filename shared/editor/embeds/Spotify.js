"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Spotify(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  let pathname = "";
  try {
    const parsed = new URL(props.attrs.href);
    pathname = parsed.pathname;
  } catch (_err) {
    pathname = "";
  }
  const normalizedPath = pathname.replace(/^\/embed/, "/");
  let height;
  if (normalizedPath.includes("episode") || normalizedPath.includes("show")) {
    height = 232;
  } else if (normalizedPath.includes("track")) {
    height = 80;
  } else {
    height = 380;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(SpotifyFrame, {
    ...props,
    width: "100%",
    height: `${height}px`,
    src: `https://open.spotify.com/embed${normalizedPath}`,
    title: "Spotify Embed",
    allow: "encrypted-media"
  });
}
const SpotifyFrame = (0, _styledComponents.default)(_Frame.default).withConfig({
  componentId: "sc-8mjlks-0"
})(["border-radius:13px;"]);
var _default = exports.default = Spotify;