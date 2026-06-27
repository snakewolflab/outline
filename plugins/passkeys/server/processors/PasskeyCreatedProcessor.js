"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PasskeyCreatedProcessor = void 0;
var _models = require("../../../../server/models");
var _BaseProcessor = _interopRequireDefault(require("../../../../server/queues/processors/BaseProcessor"));
var _PasskeyCreatedEmail = require("../email/templates/PasskeyCreatedEmail");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class PasskeyCreatedProcessor extends _BaseProcessor.default {
  async perform(event) {
    const userPasskey = await _models.UserPasskey.findByPk(event.modelId);
    if (!userPasskey) {
      return;
    }
    const user = await _models.User.scope("withTeam").findByPk(event.userId);
    if (!user) {
      return;
    }
    await new _PasskeyCreatedEmail.PasskeyCreatedEmail({
      to: user.email,
      language: user.language,
      userId: user.id,
      passkeyId: userPasskey.id,
      passkeyName: userPasskey.name,
      teamUrl: user.team.url
    }).schedule();
  }
}
exports.PasskeyCreatedProcessor = PasskeyCreatedProcessor;
_defineProperty(PasskeyCreatedProcessor, "applicableEvents", ["passkeys.create"]);