"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _queryString = _interopRequireDefault(require("query-string"));
var _env = _interopRequireDefault(require("../../env"));
var _ShareSubscription = _interopRequireDefault(require("../ShareSubscription"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Helper class for working with share subscriptions.
 */
class ShareSubscriptionHelper {
  /**
   * Get the confirmation URL for a share subscription.
   *
   * @param subscription The share subscription to confirm.
   * @returns The confirmation URL.
   */
  static confirmUrl(subscription) {
    const token = _ShareSubscription.default.generateConfirmToken(subscription);
    return `${_env.default.URL}/api/shares.confirmSubscription?${_queryString.default.stringify({
      id: subscription.id,
      token
    })}`;
  }

  /**
   * Get the unsubscribe URL for a share subscription.
   *
   * @param subscription The share subscription to unsubscribe.
   * @returns The unsubscribe URL.
   */
  static unsubscribeUrl(subscription) {
    const token = _ShareSubscription.default.generateUnsubscribeToken(subscription);
    return `${_env.default.URL}/api/shares.unsubscribe?${_queryString.default.stringify({
      id: subscription.id,
      token
    })}`;
  }
}
exports.default = ShareSubscriptionHelper;