"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentFileOperation;
var _nodePath = _interopRequireDefault(require("node:path"));
var _ = require(".");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentFileOperation(data) {
  return {
    id: data.id,
    type: data.type,
    format: data.format,
    name: data.collection?.name || data.document?.titleWithDefault || _nodePath.default.basename(data.key || ""),
    state: data.state,
    error: data.error,
    size: data.size,
    collectionId: data.collectionId,
    documentId: data.documentId,
    user: (0, _.presentUser)(data.user),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}