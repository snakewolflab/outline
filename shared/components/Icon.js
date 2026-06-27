"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.IconTitleWrapper = void 0;
var _mobxReact = require("mobx-react");
var _polished = require("polished");
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styledComponentsBreakpoint = _interopRequireDefault(require("styled-components-breakpoint"));
var _useStores = _interopRequireDefault(require("../hooks/useStores"));
var _types = require("../types");
var _IconLibrary = require("../utils/IconLibrary");
var _collections = require("../utils/collections");
var _icon = require("../utils/icon");
var _EmojiIcon = _interopRequireDefault(require("./EmojiIcon"));
var _Flex = _interopRequireDefault(require("./Flex"));
var _CustomEmoji = require("./CustomEmoji");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const Icon = _ref => {
  let {
    value: icon,
    color,
    size = 24,
    initial,
    forceColor,
    className
  } = _ref;
  const iconType = (0, _icon.determineIconType)(icon);
  if (!iconType) {
    // Logger.warn("Failed to determine icon type", {
    //   icon,
    // });
    return null;
  }
  try {
    if (iconType === _types.IconType.SVG) {
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(SVGIcon, {
        value: icon,
        color: color,
        size: size,
        initial: initial,
        className: className,
        forceColor: forceColor
      });
    }
    if (iconType === _types.IconType.Custom) {
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(Span, {
        size: size,
        className: className,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_CustomEmoji.CustomEmoji, {
          value: icon,
          size: size - size / 4
        })
      });
    }
    return /*#__PURE__*/(0, _jsxRuntime.jsx)(_EmojiIcon.default, {
      emoji: icon,
      size: size,
      className: className
    });
  } catch (_err) {
    // Ignore
  }
  return null;
};
const SVGIcon = (0, _mobxReact.observer)(_ref2 => {
  let {
    value: icon,
    color: inputColor,
    initial,
    size,
    className,
    forceColor
  } = _ref2;
  const {
    ui
  } = (0, _useStores.default)();
  let color = inputColor ?? _collections.colorPalette[0];

  // If the chosen icon color is very dark then we invert it in dark mode
  if (!forceColor) {
    if (ui.resolvedTheme === "dark" && color !== "currentColor") {
      color = (0, _polished.getLuminance)(color) > 0.09 ? color : "currentColor";
    }

    // If the chosen icon color is very light then we invert it in light mode
    if (ui.resolvedTheme === "light" && color !== "currentColor") {
      color = (0, _polished.getLuminance)(color) < 0.9 ? color : "currentColor";
    }
  }
  const Component = _IconLibrary.IconLibrary.getComponent(icon);
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(Component, {
    color: color,
    size: size,
    className: className,
    children: initial?.charAt(0).toUpperCase()
  });
});
const IconTitleWrapper = exports.IconTitleWrapper = (0, _styledComponents.default)(_Flex.default).withConfig({
  componentId: "sc-95smg2-0"
})(["align-items:center;justify-content:center;position:absolute;top:-44px;height:40px;width:40px;z-index:1;", ""], (0, _styledComponentsBreakpoint.default)("tablet")`
    top: 3px;
    ${props => props.dir === "rtl" ? "right: -44px" : "left: -44px"};
  `);
const Span = (0, _styledComponents.default)(_Flex.default).withConfig({
  componentId: "sc-95smg2-1"
})(["width:", "px;height:", "px;align-items:center;justify-content:center;"], props => props.size, props => props.size);
var _default = exports.default = Icon;