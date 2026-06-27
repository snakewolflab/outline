"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MutexLock = void 0;
var _redlock = _interopRequireWildcard(require("redlock"));
var _redis = _interopRequireDefault(require("../storage/redis"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _ShutdownHelper = _interopRequireWildcard(require("./ShutdownHelper"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class MutexLock {
  /**
   * Returns the redlock instance
   */
  static get lock() {
    if (!this.redlock) {
      this.redlock = new _redlock.default([_redis.default.defaultClient], {
        retryJitter: 100,
        retryCount: 120,
        retryDelay: 1000
      });
      this.redlock.on("error", err => {
        if (err instanceof _redlock.ResourceLockedError) {
          // Expected during lock contention retries, not an error.
          return;
        } else if (err instanceof _redlock.ExecutionError) {
          _Logger.default.warn("Failed to extend Redlock lock", {
            message: err.message
          });
        } else {
          _Logger.default.error("Unexpected Redlock error", err);
        }
      });
    }
    return this.redlock;
  }

  /**
   * Acquire a Mutex lock
   *
   * @param resource The resource to lock
   * @param timeout The duration to acquire the lock for if not released in milliseconds
   * @returns A promise that resolves a to a Lock
   */
  static async acquire(resource, timeout, options) {
    const lock = await this.lock.acquire([resource], timeout);
    if (options?.releaseOnShutdown) {
      const key = `lock:${resource}`;
      // @ts-expect-error Attach resource for use in shutdown
      lock._key = key;
      _ShutdownHelper.default.add(key, _ShutdownHelper.ShutdownOrder.last, lock.release.bind(lock));
    }
    return lock;
  }

  /**
   * Execute a routine in the context of an auto-extending lock. The lock is
   * automatically acquired before the routine runs and released when it
   * completes. If the lock cannot be extended, the provided AbortSignal will
   * be triggered so the routine can bail out.
   *
   * @param resource The resource to lock.
   * @param timeout The initial lock duration in milliseconds (auto-extended while running).
   * @param routine The async routine to execute while holding the lock.
   * @returns A promise that resolves with the routine's return value.
   */
  static async using(resource, timeout, routine) {
    return this.lock.using([resource], timeout, routine);
  }

  /**
   * Safely release a lock
   *
   * @param lock The lock to release
   */
  static release(lock) {
    try {
      if (lock && lock.expiration > new Date().getTime()) {
        return lock.release();
      }
      return false;
    } finally {
      // @ts-expect-error Attach resource for use in shutdown
      const key = lock._key;
      if (key) {
        _ShutdownHelper.default.remove(key);
      }
    }
  }
}
exports.MutexLock = MutexLock;
// Default expiry time for acquiring lock in milliseconds
_defineProperty(MutexLock, "defaultLockTimeout", 4000);
_defineProperty(MutexLock, "redlock", void 0);