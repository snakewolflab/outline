"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RedisPrefixHelper = void 0;
/**
 * Helper class for Redis cache key generation.
 */
class RedisPrefixHelper {
  /**
   * Gets key against which unfurl response for the given url is stored.
   *
   * @param teamId The team ID to generate a key for.
   * @param url The url to generate a key for.
   */
  static getUnfurlKey(teamId) {
    let url = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
    return `unfurl:${teamId}:${url}`;
  }

  /**
   * Gets key for caching collection documents structure.
   *
   * @param collectionId The collection ID to generate a key for.
   * @returns the cache key string.
   */
  static getCollectionDocumentsKey(collectionId) {
    return `cd:${collectionId}`;
  }

  /**
   * Gets key for caching embed check results. This is a global cache key
   * (not team-specific) since embed headers are the same for all users.
   *
   * @param url The URL to generate a cache key for.
   * @returns the cache key string.
   */
  static getEmbedCheckKey(url) {
    return `embed:${url}`;
  }

  /**
   * Gets key for caching a user's accessible collection IDs.
   *
   * @param userId The user ID to generate a key for.
   * @returns the cache key string.
   */
  static getUserCollectionIdsKey(userId) {
    return `uc:${userId}`;
  }

  /**
   * Gets key for caching a team's enabled webhook subscriptions.
   *
   * @param teamId The team ID to generate a key for.
   * @returns the cache key string.
   */
  static getWebhookSubscriptionsKey(teamId) {
    return `whs:${teamId}`;
  }

  /**
   * Gets key for caching the count of a relationship managed by the
   * `CounterCache` decorator.
   *
   * @param modelName The owning model name (e.g. "Group").
   * @param relationName The relationship reference name (e.g. "members").
   * @param id The owning record id.
   * @returns the cache key string.
   */
  static getCounterCacheKey(modelName, relationName, id) {
    return `count:${modelName}:${relationName}:${id}`;
  }
}
exports.RedisPrefixHelper = RedisPrefixHelper;