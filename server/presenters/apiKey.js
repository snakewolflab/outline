"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentApiKey;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentApiKey(apiKey) {
  return {
    id: apiKey.id,
    user: (0, _user.default)(apiKey.user),
    userId: apiKey.userId,
    name: apiKey.name,
    scope: apiKey.scope,
    value: apiKey.value,
    last4: apiKey.last4,
    createdAt: apiKey.createdAt,
    updatedAt: apiKey.updatedAt,
    expiresAt: apiKey.expiresAt,
    lastActiveAt: apiKey.lastActiveAt
  };
}