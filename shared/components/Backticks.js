"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Backticks = void 0;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const BacktickSpan = _styledComponents.default.span.withConfig({
  componentId: "sc-16pljbc-0"
})(["font-family:", ";background:", ";border-radius:3px;padding:2px 4px;font-size:90%;"], (0, _styles.s)("fontFamilyMono"), (0, _styles.s)("codeBackground"));
/**
 * Component to render backticked content with styling.
 * @param props - Props object containing the content to be rendered.
 * @returns JSX.Element - The rendered component.
 */
const Backticks = _ref => {
  let {
    content
  } = _ref;
  if (!content) {
    return null;
  }

  // Regex to match text between backticks
  const regex = /`([^`]+)`/g;
  const parts = content.split(regex);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
    children: parts.map((part, i) => {
      // Even indices are normal text, odd indices are backticked content
      if (i % 2 === 0) {
        return part;
      }
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(BacktickSpan, {
        children: part
      }, i);
    })
  });
};
exports.Backticks = Backticks;