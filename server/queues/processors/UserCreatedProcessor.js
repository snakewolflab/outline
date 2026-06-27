"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _WelcomeEmail = _interopRequireDefault(require("../../emails/templates/WelcomeEmail"));
var _models = require("../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class UserCreatedProcessor extends _BaseProcessor.default {
  async perform(event) {
    const [user, team] = await Promise.all([_models.User.findByPk(event.userId), _models.Team.findByPk(event.teamId)]);

    // The user or team may have been deleted before this event is processed.
    if (!user || !team) {
      return;
    }

    // Invited users receive an InviteEmail at invite time, and a WelcomeEmail
    // when they accept the invite and sign in for the first time.
    if (event.name === "users.create" && user.isInvited) {
      return;
    }
    await new _WelcomeEmail.default({
      to: user.email,
      language: user.language,
      role: user.role,
      teamUrl: team.url
    }).schedule();
  }
}
exports.default = UserCreatedProcessor;
_defineProperty(UserCreatedProcessor, "applicableEvents", ["users.create", "users.invite_accepted"]);