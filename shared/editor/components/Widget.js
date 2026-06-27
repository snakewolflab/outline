"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Title = exports.Subtitle = exports.Preview = void 0;
exports.default = Widget;
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _styles = require("../../styles");
var _urls = require("../../utils/urls");
var _Flex = _interopRequireDefault(require("../../components/Flex"));
var _EditorStyleHelper = require("../styles/EditorStyleHelper");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function Widget(props) {
  const className = props.isSelected ? "ProseMirror-selectednode widget" : "widget";
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Wrapper, {
    className: className,
    target: "_blank",
    href: (0, _urls.sanitizeUrl)(props.href),
    rel: "noreferrer nofollow",
    onDoubleClick: props.onDoubleClick,
    onMouseDown: props.onMouseDown,
    onClick: props.onClick,
    children: [props.icon, /*#__PURE__*/(0, _jsxRuntime.jsxs)(Preview, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(Title, {
        children: props.title
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Subtitle, {
        children: props.context
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(Children, {
        children: props.children
      })]
    })]
  });
}
const Children = _styledComponents.default.div.withConfig({
  componentId: "sc-1d23nsp-0"
})(["margin-left:auto;height:20px;opacity:0;&:hover{color:", ";}"], (0, _styles.s)("text"));
const Title = exports.Title = _styledComponents.default.strong.withConfig({
  componentId: "sc-1d23nsp-1"
})(["font-weight:500;font-size:14px;line-height:28px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;user-select:none;color:", ";"], (0, _styles.s)("text"));
const Preview = exports.Preview = (0, _styledComponents.default)(_Flex.default).attrs({
  gap: 8,
  align: "center"
}).withConfig({
  componentId: "sc-1d23nsp-2"
})(["flex-grow:1;color:", ";"], (0, _styles.s)("textTertiary"));
const Subtitle = exports.Subtitle = _styledComponents.default.span.withConfig({
  componentId: "sc-1d23nsp-3"
})(["font-size:13px;line-height:28px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap;flex-shrink:0;user-select:none;color:", " !important;"], (0, _styles.s)("textTertiary"));
const Wrapper = _styledComponents.default.a.withConfig({
  componentId: "sc-1d23nsp-4"
})(["display:flex;align-items:center;gap:6px;background:", ";color:", " !important;box-shadow:0 0 0 1px ", ";white-space:nowrap;border-radius:", ";padding:", ";max-width:840px;cursor:var(--pointer);user-select:none;text-overflow:ellipsis;overflow:hidden;", ""], (0, _styles.s)("background"), (0, _styles.s)("text"), (0, _styles.s)("divider"), _EditorStyleHelper.EditorStyleHelper.blockRadius, _EditorStyleHelper.EditorStyleHelper.blockRadius, props => props.href && (0, _styledComponents.css)(["&:hover,&:active{cursor:pointer !important;text-decoration:none !important;background:", ";", "{opacity:1;}}"], (0, _styles.s)("backgroundSecondary"), Children));