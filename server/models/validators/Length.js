"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = Length;
var _sequelizeTypescript = require("sequelize-typescript");
/**
 * A decorator that validates the length of a string by counting Unicode
 * code points. Useful for strings with unicode characters of variable lengths.
 */
function Length(_ref) {
  let {
    msg,
    min = 0,
    max
  } = _ref;
  return (target, propertyName) => (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validLength(value) {
        const length = value ? Array.from(value).length : 0;
        if (length > max || length < min) {
          throw new Error(msg);
        }
      }
    }
  });
}