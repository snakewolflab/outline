"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = EmojiIcon;
var _validator = require("validator");
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../styles");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * EmojiIcon is a component that renders an emoji in the size of a standard icon
 * in a way that can be used wherever an Icon would be.
 */
function EmojiIcon(_ref) {
  let {
    size = 24,
    emoji,
    ...rest
  } = _ref;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Span, {
    $size: size,
    ...rest,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(SVG, {
      size: size,
      emoji: (0, _validator.isUUID)(emoji) ? "�" : emoji
    })
  });
}
const Span = _styledComponents.default.span.withConfig({
  componentId: "sc-1vx36gk-0"
})(["font-family:", ";display:inline-block;width:", "px;height:", "px;"], (0, _styles.s)("fontFamilyEmoji"), props => props.$size, props => props.$size);
const SVG = _ref2 => {
  let {
    size,
    emoji
  } = _ref2;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("svg", {
    width: size,
    height: size,
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)("text", {
      x: "50%",
      y: "55%",
      dominantBaseline: "middle",
      textAnchor: "middle",
      fontSize: size * 0.7,
      children: emoji
    })
  });
};