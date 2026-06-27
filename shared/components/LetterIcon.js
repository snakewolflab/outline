"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
var _Squircle = _interopRequireDefault(require("./Squircle"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A squircle shaped icon with a letter inside, used for collections.
 */
const LetterIcon = _ref => {
  let {
    children,
    size = 24,
    ...rest
  } = _ref;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(LetterIconWrapper, {
    $size: size,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Squircle.default, {
      size: Math.round(size * 0.66),
      ...rest,
      children: children ?? "?"
    })
  });
};
const LetterIconWrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-1q3pblq-0"
})(["display:inline-flex;align-items:center;justify-content:center;width:", "px;height:", "px;font-weight:700;font-size:", "px;color:var(--background,", ");"], _ref2 => {
  let {
    $size
  } = _ref2;
  return $size;
}, _ref3 => {
  let {
    $size
  } = _ref3;
  return $size;
}, _ref4 => {
  let {
    $size
  } = _ref4;
  return $size / 2;
}, (0, _styles.s)("background"));
var _default = exports.default = LetterIcon;