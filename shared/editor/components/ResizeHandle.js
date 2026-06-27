"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ResizeTopRight = exports.ResizeTopLeft = exports.ResizeRight = exports.ResizeLeft = exports.ResizeCorner = exports.ResizeBottomRight = exports.ResizeBottomLeft = exports.ResizeBottom = void 0;
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _styles = require("../../styles");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ResizeLeft = exports.ResizeLeft = _styledComponents.default.div.withConfig({
  componentId: "sc-deq71q-0"
})(["cursor:ew-resize;position:absolute;left:-4px;top:30%;bottom:30%;width:8px;user-select:none;opacity:", ";transition:opacity 150ms ease-in-out;&:after{content:\"\";position:absolute;left:8px;top:50%;transform:translateY(-50%);width:6px;height:25%;min-height:20px;border-radius:4px;background:", ";box-shadow:0 0 0 1px ", ";opacity:0.75;}@media print{display:none;}"], props => props.$dragging ? 1 : 0, (0, _styles.s)("menuBackground"), (0, _styles.s)("textSecondary"));
const ResizeRight = exports.ResizeRight = (0, _styledComponents.default)(ResizeLeft).withConfig({
  componentId: "sc-deq71q-1"
})(["left:initial;right:-4px;&:after{left:initial;right:8px;}"]);
const ResizeBottom = exports.ResizeBottom = (0, _styledComponents.default)(ResizeLeft).withConfig({
  componentId: "sc-deq71q-2"
})(["cursor:ns-resize;left:30%;right:30%;top:initial;bottom:8px;width:auto;height:8px;&:after{left:50%;bottom:8px;transform:translateX(-50%);width:25%;height:6px;min-width:20px;min-height:0;}"]);
const ResizeCorner = exports.ResizeCorner = _styledComponents.default.div.withConfig({
  componentId: "sc-deq71q-3"
})(["position:absolute;width:8px;height:8px;border-radius:50%;z-index:10;user-select:none;opacity:", ";transition:opacity 150ms ease-in-out;@media print{display:none;}"], props => props.$dragging ? 1 : 0);
const ResizeTopLeft = exports.ResizeTopLeft = (0, _styledComponents.default)(ResizeCorner).withConfig({
  componentId: "sc-deq71q-4"
})(["cursor:nwse-resize;top:-4px;left:-4px;"]);
const ResizeTopRight = exports.ResizeTopRight = (0, _styledComponents.default)(ResizeCorner).withConfig({
  componentId: "sc-deq71q-5"
})(["cursor:nesw-resize;top:-4px;right:-4px;"]);
const ResizeBottomLeft = exports.ResizeBottomLeft = (0, _styledComponents.default)(ResizeCorner).withConfig({
  componentId: "sc-deq71q-6"
})(["cursor:nesw-resize;bottom:-4px;left:-4px;"]);
const ResizeBottomRight = exports.ResizeBottomRight = (0, _styledComponents.default)(ResizeCorner).withConfig({
  componentId: "sc-deq71q-7"
})(["cursor:nwse-resize;bottom:-4px;right:-4px;"]);