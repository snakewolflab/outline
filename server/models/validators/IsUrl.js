"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = IsUrl;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
var _env = _interopRequireDefault(require("../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A decorator that validates that a string is a valid HTTP(S) url. A top-level
 * domain is only required when cloud hosted, allowing self-hosted installations
 * to use internal hostnames.
 */
function IsUrl(target, propertyName) {
  return (0, _sequelizeTypescript.addAttributeOptions)(target, propertyName, {
    validate: {
      validUrl(value) {
        if (!(0, _classValidator.isURL)(value, {
          protocols: ["http", "https"],
          require_protocol: true,
          require_tld: _env.default.isCloudHosted
        })) {
          throw new Error("Must be a valid url");
        }
      }
    }
  });
}