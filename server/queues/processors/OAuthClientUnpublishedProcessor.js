"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _models = require("../../models");
var _BaseProcessor = _interopRequireDefault(require("./BaseProcessor"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class OAuthClientUnpublishedProcessor extends _BaseProcessor.default {
  async perform(event) {
    if (event.changes?.previous.published === true && event.changes.attributes.published === false) {
      const oauthClient = await _models.OAuthClient.findByPk(event.modelId, {
        rejectOnEmpty: true
      });
      const users = await _models.User.findAll({
        attributes: ["id"],
        where: {
          teamId: oauthClient.teamId
        }
      });
      const userIds = users.map(user => user.id);

      // Revoke access for all users except any that are in the same team
      await _models.OAuthAuthentication.destroy({
        where: {
          oauthClientId: event.modelId,
          userId: {
            [_sequelize.Op.notIn]: userIds
          }
        }
      });
    }
  }
}
exports.default = OAuthClientUnpublishedProcessor;
_defineProperty(OAuthClientUnpublishedProcessor, "applicableEvents", ["oauthClients.update"]);