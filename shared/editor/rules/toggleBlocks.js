"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = toggleBlocks;
var _markdownItContainer = _interopRequireDefault(require("markdown-it-container"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function toggleBlocks(md) {
  return (0, _markdownItContainer.default)(md, "toggle", {
    marker: "+",
    validate: () => true
  });
}