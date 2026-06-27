"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = TextLength;
var _prosemirrorModel = require("prosemirror-model");
var _sequelizeTypescript = require("sequelize-typescript");
var _ProsemirrorHelper = require("../../../shared/utils/ProsemirrorHelper");
var _editor = require("../../editor");
/**
 * A decorator that validates the size of the text within a prosemirror data
 * object, taking into account unicode characters of variable lengths.
 */
function TextLength(_ref) {
  let {
    msg,
    min = 0,
    max
  } = _ref;
  return (target, propertyName) => (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validLength(value) {
        let text;
        try {
          text = _ProsemirrorHelper.ProsemirrorHelper.toPlainText(_prosemirrorModel.Node.fromJSON(_editor.schema, value));
        } catch (_err) {
          throw new Error("Invalid data");
        }
        const length = text ? Array.from(text).length : 0;
        if (length > max || length < min) {
          throw new Error(msg);
        }
      }
    }
  });
}