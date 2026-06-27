"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentImport;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentImport(
// oxlint-disable-next-line @typescript-eslint/no-explicit-any
importModel) {
  return {
    id: importModel.id,
    name: importModel.name,
    service: importModel.service,
    state: importModel.state,
    documentCount: importModel.documentCount,
    error: importModel.error,
    createdBy: (0, _user.default)(importModel.createdBy),
    createdById: importModel.createdById,
    createdAt: importModel.createdAt,
    updatedAt: importModel.updatedAt
  };
}