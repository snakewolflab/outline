"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = DisabledEmbed;
var _outlineIcons = require("outline-icons");
var _Widget = _interopRequireDefault(require("./Widget"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function DisabledEmbed(props) {
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Widget.default, {
    title: props.embed.title,
    href: props.href,
    icon: props.embed.icon,
    context: props.href.replace(/^https?:\/\//, ""),
    isSelected: props.isSelected,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.OpenIcon, {
      size: 20
    })
  });
}