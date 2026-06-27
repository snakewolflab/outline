"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = loadDocument;
var _errors = require("../errors");
var _models = require("../models");
var _policies = require("../policies");
async function loadDocument(_ref) {
  let {
    id,
    user,
    includeState
  } = _ref;
  const document = await _models.Document.findByPk(id, {
    userId: user ? user.id : undefined,
    paranoid: false,
    includeState
  });
  if (!document) {
    throw (0, _errors.NotFoundError)();
  }
  if (document.deletedAt) {
    // don't send data if user cannot restore deleted doc
    if (user) {
      (0, _policies.authorize)(user, "restore", document);
    }
  } else {
    if (user) {
      (0, _policies.authorize)(user, "read", document);
    }
  }
  if (document.isTrialImport) {
    throw (0, _errors.PaymentRequiredError)();
  }
  return document;
}