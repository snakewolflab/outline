"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _copyToClipboard = _interopRequireDefault(require("copy-to-clipboard"));
var _outlineIcons = require("outline-icons");
var _react = require("react");
var _reactColorful = require("react-colorful");
var _styledComponents = _interopRequireWildcard(require("styled-components"));
var _styles = require("../styles");
var _polished = require("polished");
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const DEFAULT_COLOR = "#7e3d3db3";
function ColorPicker(_ref) {
  let {
    activeColor,
    onSelect,
    alpha
  } = _ref;
  const [color, setColor] = (0, _react.useState)(activeColor || DEFAULT_COLOR);
  const [copied, setCopied] = (0, _react.useState)(false);
  const theme = (0, _styledComponents.useTheme)();
  const wrapperRef = (0, _react.useRef)(null);
  const buttonRef = (0, _react.useRef)(null);
  const applyColor = (0, _react.useCallback)(newColor => {
    const activeElement = document.activeElement;
    const hadFocusInside = wrapperRef.current?.contains(activeElement);
    onSelect(newColor);
    if (hadFocusInside && activeElement) {
      activeElement.focus();
    }
  }, [onSelect]);
  const handleColorChangeInput = newColor => {
    setColor(newColor);
    applyColor(newColor);
  };
  const handleCopy = (0, _react.useCallback)(() => {
    (0, _copyToClipboard.default)(color);
    buttonRef.current?.focus();
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  }, [color]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(Wrapper, {
    ref: wrapperRef,
    tabIndex: -1,
    children: [alpha ? /*#__PURE__*/(0, _jsxRuntime.jsx)(StyledHexAlphaColorPicker, {
      color: color,
      onChange: setColor,
      onChangeEnd: applyColor
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(StyledHexNonAlphaColorPicker, {
      color: color,
      onChange: setColor,
      onChangeEnd: applyColor
    }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(InputRow, {
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(StyledHexColorInput, {
        color: color,
        onChange: handleColorChangeInput,
        prefixed: true,
        alpha: alpha
      }), /*#__PURE__*/(0, _jsxRuntime.jsx)(CopyButton, {
        ref: buttonRef,
        onClick: handleCopy,
        type: "button",
        children: copied ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.CheckmarkIcon, {
          size: 16,
          color: (0, _polished.darken)(0.2, theme.brand.green)
        }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.CopyIcon, {
          size: 16
        })
      })]
    })]
  });
}
const Wrapper = _styledComponents.default.div.withConfig({
  componentId: "sc-mfnbuv-0"
})(["padding:4px;display:flex;flex-direction:column;"]);
const colorPickerStyles = (0, _styledComponents.css)(["&.react-colorful{width:auto;& > .react-colorful__saturation{border-radius:4px 4px 0 0;}& .react-colorful__pointer{width:14px;height:14px;}& .react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.25);}& > .react-colorful__hue{height:8px;border-radius:0 0 4px 4px;margin-bottom:8px;}}"]);
const StyledHexNonAlphaColorPicker = (0, _styledComponents.default)(_reactColorful.HexColorPicker).withConfig({
  componentId: "sc-mfnbuv-1"
})(["", ""], colorPickerStyles);
const StyledHexAlphaColorPicker = (0, _styledComponents.default)(_reactColorful.HexAlphaColorPicker).withConfig({
  componentId: "sc-mfnbuv-2"
})(["", " &.react-colorful > .react-colorful__alpha{height:8px;border-radius:4px;margin-top:8px;margin-bottom:8px;}"], colorPickerStyles);
const InputRow = _styledComponents.default.div.withConfig({
  componentId: "sc-mfnbuv-3"
})(["display:flex;justify-content:space-between;gap:4px;margin-top:8px;"]);
const StyledHexColorInput = (0, _styledComponents.default)(_reactColorful.HexColorInput).withConfig({
  componentId: "sc-mfnbuv-4"
})(["flex:1;padding:4px 6px;border:1px solid ", ";border-radius:4px;font-size:12px;background:", ";color:", ";&:focus{outline:none;border-color:", ";}"], (0, _styles.s)("inputBorder"), (0, _styles.s)("background"), (0, _styles.s)("text"), (0, _styles.s)("accent"));
const CopyButton = _styledComponents.default.button.withConfig({
  componentId: "sc-mfnbuv-5"
})(["display:flex;align-items:center;justify-content:center;padding:4px;border:1px solid ", ";border-radius:4px;background:", ";color:", ";cursor:pointer;&:hover{background:", ";color:", ";}"], (0, _styles.s)("inputBorder"), (0, _styles.s)("background"), (0, _styles.s)("textSecondary"), (0, _styles.s)("backgroundSecondary"), (0, _styles.s)("text"));
var _default = exports.default = ColorPicker;