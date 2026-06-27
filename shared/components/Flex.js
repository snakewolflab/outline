"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Flex is a styled component that provides a flexible box layout with convenient props.
 * It simplifies the use of flexbox CSS properties with a clean, declarative API.
 */
const Flex = _styledComponents.default.div.withConfig({
  shouldForwardProp: prop => !["auto", "column", "align", "justify", "wrap", "shrink", "reverse", "gap"].includes(prop)
}).withConfig({
  componentId: "sc-1fsvudc-0"
})(["display:flex;flex:", ";flex-direction:", ";align-items:", ";justify-content:", ";flex-wrap:", ";flex-shrink:", ";gap:", ";min-height:0;min-width:0;"], _ref => {
  let {
    auto
  } = _ref;
  return auto ? "1 1 auto" : "initial";
}, _ref2 => {
  let {
    column,
    reverse
  } = _ref2;
  return reverse ? column ? "column-reverse" : "row-reverse" : column ? "column" : "row";
}, _ref3 => {
  let {
    align
  } = _ref3;
  return align;
}, _ref4 => {
  let {
    justify
  } = _ref4;
  return justify;
}, _ref5 => {
  let {
    wrap
  } = _ref5;
  return wrap ? "wrap" : "initial";
}, _ref6 => {
  let {
    shrink
  } = _ref6;
  return shrink === true ? 1 : shrink === false ? 0 : "initial";
}, _ref7 => {
  let {
    gap
  } = _ref7;
  return gap !== undefined ? `${gap}px` : "initial";
});
var _default = exports.default = Flex;