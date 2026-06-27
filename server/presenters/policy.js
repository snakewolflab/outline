"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _tracing = require("../logging/tracing");
var _policies = require("../policies");
function presentPolicy(user, models) {
  return (0, _compat.compact)(models).map(model => ({
    id: model.id,
    abilities: (0, _policies.serialize)(user, model)
  }));
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentPolicy);