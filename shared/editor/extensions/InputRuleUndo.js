"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _prosemirrorInputrules = require("prosemirror-inputrules");
var _Extension = _interopRequireDefault(require("../lib/Extension"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class InputRuleUndo extends _Extension.default {
  get name() {
    return "inputRuleUndo";
  }
  keys() {
    return {
      Backspace: _prosemirrorInputrules.undoInputRule
    };
  }
}
exports.default = InputRuleUndo;