"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = revisionCreator;
var _context = require("../context");
var _models = require("../models");
var _database = require("../storage/database");
async function revisionCreator(_ref) {
  let {
    event,
    document,
    collaboratorIds,
    user
  } = _ref;
  return _database.sequelize.transaction(async transaction => await _models.Revision.createFromDocument((0, _context.createContext)({
    user,
    authType: event.authType,
    ip: event.ip,
    transaction
  }), document, collaboratorIds));
}