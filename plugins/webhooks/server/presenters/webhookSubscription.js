"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentWebhookSubscription;
var _user = _interopRequireDefault(require("../../../../server/presenters/user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentWebhookSubscription(webhook) {
  return {
    id: webhook.id,
    name: webhook.name,
    url: webhook.url,
    secret: webhook.secret,
    events: webhook.events,
    enabled: webhook.enabled,
    createdBy: webhook.createdBy ? (0, _user.default)(webhook.createdBy) : undefined,
    createdById: webhook.createdById,
    createdAt: webhook.createdAt,
    updatedAt: webhook.updatedAt
  };
}