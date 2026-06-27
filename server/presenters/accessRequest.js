"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = present;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function present(accessRequest) {
  return {
    id: accessRequest.id,
    documentId: accessRequest.documentId,
    userId: accessRequest.userId,
    user: accessRequest.user ? (0, _user.default)(accessRequest.user) : undefined,
    teamId: accessRequest.teamId,
    status: accessRequest.status,
    responderId: accessRequest.responderId,
    responder: accessRequest.responder ? (0, _user.default)(accessRequest.responder) : undefined,
    respondedAt: accessRequest.respondedAt,
    createdAt: accessRequest.createdAt,
    updatedAt: accessRequest.updatedAt
  };
}