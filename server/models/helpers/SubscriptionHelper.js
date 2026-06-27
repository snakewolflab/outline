"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _queryString = _interopRequireDefault(require("query-string"));
var _env = _interopRequireDefault(require("../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Helper class for working with subscription settings
 */
class SubscriptionHelper {
  /**
   * Get the unsubscribe URL for a user and document. This url allows the user
   * to unsubscribe from a specific document without being signed in, for one-click
   * links in emails.
   *
   * @param userId The user ID to unsubscribe
   * @param documentId The document ID to unsubscribe from
   * @returns The unsubscribe URL
   */
  static unsubscribeUrl(userId, documentId) {
    const token = this.unsubscribeToken(userId, documentId);
    return `${_env.default.URL}/api/subscriptions.delete?${_queryString.default.stringify({
      token,
      userId,
      documentId
    })}`;
  }

  /**
   * Generate a token for unsubscribing a user from a document or collection.
   *
   * @param userId The user ID to unsubscribe
   * @param documentId The document ID to unsubscribe from
   * @returns The unsubscribe token
   */
  static unsubscribeToken(userId, documentId) {
    const hash = _nodeCrypto.default.createHash("sha256");
    hash.update(`${userId}-${_env.default.SECRET_KEY}-${documentId}`);
    return hash.digest("hex");
  }
}
exports.default = SubscriptionHelper;