"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _PlaceholderPlugin = require("../plugins/PlaceholderPlugin");
var _Node = _interopRequireDefault(require("./Node"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Options for the Doc node.
 */

class Doc extends _Node.default {
  get name() {
    return "doc";
  }
  get schema() {
    return {
      content: "block+"
    };
  }
  get plugins() {
    return [new _PlaceholderPlugin.PlaceholderPlugin([{
      condition: _ref => {
        let {
          $start,
          parent,
          node,
          state,
          textContent
        } = _ref;
        return textContent === "" && !(0, _compat.isNull)(parent) && parent.type === state.doc.type && parent.childCount === 1 && node.childCount === 0 && $start.index($start.depth - 1) === 0;
      },
      text: this.options.placeholder
    }])];
  }
}
exports.default = Doc;