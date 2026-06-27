"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../../../server/models");
var _BaseProcessor = _interopRequireDefault(require("../../../../server/queues/processors/BaseProcessor"));
var _DeliverWebhookTask = _interopRequireDefault(require("../tasks/DeliverWebhookTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class WebhookProcessor extends _BaseProcessor.default {
  /**
   * Only queue an event when the team has an enabled webhook subscription that
   * matches it. The vast majority of events belong to teams with no applicable
   * subscriptions, so this avoids creating and running an empty job for them.
   *
   * @param event The event about to be queued.
   * @returns true if a matching subscription exists.
   */
  static async shouldQueue(event) {
    if (!event.teamId) {
      return false;
    }
    const subscriptions = await _models.WebhookSubscription.findEnabledByTeamId(event.teamId);
    return subscriptions.some(subscription => _models.WebhookSubscription.matchEvent(subscription.events, event.name));
  }
  async perform(event) {
    if (!event.teamId) {
      return;
    }
    const subscriptions = await _models.WebhookSubscription.findEnabledByTeamId(event.teamId);
    const applicableSubscriptions = subscriptions.filter(subscription => _models.WebhookSubscription.matchEvent(subscription.events, event.name));
    await Promise.all(applicableSubscriptions.map(subscription => new _DeliverWebhookTask.default().schedule({
      event,
      subscriptionId: subscription.id
    })));
  }
}
exports.default = WebhookProcessor;
_defineProperty(WebhookProcessor, "applicableEvents", ["*"]);