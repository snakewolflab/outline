"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Frame = _interopRequireDefault(require("../components/Frame"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function InVision(_ref) {
  let {
    matches,
    ...props
  } = _ref;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(_Frame.default, {
    ...props,
    src: props.attrs.href,
    title: "InVision Embed"
  });
}
var _default = exports.default = InVision;