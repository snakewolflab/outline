"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CacheHelper = void 0;
var _error = require("../../shared/utils/error");
var _time = require("../../shared/utils/time");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _redis = _interopRequireDefault(require("../storage/redis"));
var _MutexLock = require("./MutexLock");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Result type for cache callbacks that need to specify a dynamic expiry.
 */

/**
 * A Helper class for server-side cache management
 */
class CacheHelper {
  /**
   * Given a key this method will attempt to get the data from cache store first
   * If data is not found, it will call the callback to get the data and save it in cache
   * using a distributed lock to prevent multiple writes.
   *
   * The callback can return either:
   * - A plain value of type T (uses the default expiry)
   * - A CacheResult<T> object with { data, expiry } for dynamic expiry
   *
   * @param key Cache key
   * @param callback Callback to get the data if not found in cache
   * @param expiry Default cache data expiry in seconds
   * @param lockTimeout Lock timeout in milliseconds
   * @returns The data from cache or the result of the callback
   */
  static async getDataOrSet(key, callback, expiry) {
    let lockTimeout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : _MutexLock.MutexLock.defaultLockTimeout;
    let cache = await this.getData(key);
    if (cache) {
      return cache;
    }

    // Nothing in the cache, acquire a lock to prevent multiple writes
    let lock;
    const lockKey = `lock:${key}`;
    try {
      try {
        lock = await _MutexLock.MutexLock.acquire(lockKey, lockTimeout);
      } catch (err) {
        _Logger.default.error(`Could not acquire lock for ${key}`, (0, _error.toError)(err));
      }
      cache = await this.getData(key);
      if (cache) {
        return cache;
      }

      // Get the data from the callback and save it in cache
      const result = await callback();
      if (result) {
        // Check if result is a CacheResult with dynamic expiry
        const isCacheResult = typeof result === "object" && "data" in result && Object.keys(result).every(k => k === "data" || k === "expiry");
        if (isCacheResult) {
          const {
            data,
            expiry: dynamicExpiry
          } = result;
          await this.setData(key, data, dynamicExpiry ?? expiry);
          return data;
        }
        await this.setData(key, result, expiry);
        return result;
      }
      return undefined;
    } finally {
      if (lock) {
        await _MutexLock.MutexLock.release(lock);
      }
    }
  }

  /**
   * Given a key, gets the data from cache store
   *
   * @param key Key against which data will be accessed
   */
  static async getData(key) {
    try {
      const data = await _redis.default.defaultClient.get(key);
      if (data !== null) {
        return JSON.parse(data);
      }
    } catch (err) {
      // just log it, response can still be obtained using the fetch call
      _Logger.default.error(`Could not fetch cached response against ${key}`, (0, _error.toError)(err));
    }
    return;
  }

  /**
   * Given a key, data and cache config, saves the data in cache store
   *
   * @param key Cache key
   * @param data Data to be saved against the key
   * @param expiry Cache data expiry in seconds
   */
  static async setData(key, data, expiry) {
    try {
      await _redis.default.defaultClient.set(key, JSON.stringify(data), "EX", expiry || CacheHelper.defaultDataExpiry);
    } catch (err) {
      // just log it, can skip caching and directly return response
      _Logger.default.error(`Could not cache response against ${key}`, (0, _error.toError)(err));
    }
  }

  /**
   * Removes a single cached entry by key.
   *
   * @param key Cache key to remove.
   */
  static async removeData(key) {
    try {
      await _redis.default.defaultClient.del(key);
    } catch (err) {
      _Logger.default.error(`Could not remove cached entry against ${key}`, (0, _error.toError)(err));
    }
  }

  /**
   * Clears all cache data with the given prefix
   *
   * @param prefix Prefix to clear cache data
   */
  static async clearData(prefix) {
    const keys = await _redis.default.defaultClient.keys(`${prefix}*`);
    await Promise.all(keys.map(async key => {
      await _redis.default.defaultClient.del(key);
    }));
  }
}
exports.CacheHelper = CacheHelper;
// Default expiry time for cache data in seconds
_defineProperty(CacheHelper, "defaultDataExpiry", _time.Day.seconds);