"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _Img = _interopRequireDefault(require("../components/Img"));
var _styledComponents = require("styled-components");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function PlantUmlDiagrams(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  const theme = (0, _styledComponents.useTheme)();
  const mode = theme.isDark ? "dsvg" : "svg";
  const title = props.attrs.href.split("/uml/")[1];
  const finalUrl = `https://www.plantuml.com/plantuml/${mode}/${title}`;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
    ...props,
    src: finalUrl,
    icon: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Img.default, {
      src: "/images/plantuml.png",
      alt: "PlantUml",
      width: 16,
      height: 16
    }),
    canonicalUrl: props.attrs.href,
    border: true
  });
}
var _default = exports.default = PlantUmlDiagrams;