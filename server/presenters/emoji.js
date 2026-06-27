"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function present(emoji) {
  return {
    id: emoji.id,
    name: emoji.name,
    teamId: emoji.teamId,
    url: emoji.attachment?.url,
    createdBy: emoji.createdBy ? (0, _user.default)(emoji.createdBy) : undefined,
    createdById: emoji.createdById,
    createdAt: emoji.createdAt,
    updatedAt: emoji.updatedAt
  };
}