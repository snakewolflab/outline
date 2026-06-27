"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VerificationCode = void 0;
var _nodeCrypto = require("node:crypto");
var _time = require("../../shared/utils/time");
var _redis = _interopRequireDefault(require("../storage/redis"));
var _crypto = require("./crypto");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * This class manages verification codes for email authentication.
 * It stores and retrieves 6-digit codes in Redis with a 10-minute TTL.
 */
class VerificationCode {
  /**
   * Redis client instance (lazy initialized)
   */
  static get redis() {
    return _redis.default.defaultClient;
  }

  /**
   * TTL for verification codes in milliseconds (10 minutes)
   */

  /**
   * Generate a random 6-digit code
   *
   * @returns A string representing a 6-digit code
   */
  static generate() {
    // Generate a random integer between 100000 and 999999 (6 digits)
    return (0, _nodeCrypto.randomInt)(100000, 1000000).toString().padStart(6, "0");
  }

  /**
   * Store a verification code in Redis with a 10-minute TTL
   *
   * @param teamId The team the code is being issued for
   * @param email The email address associated with the code
   * @param code The 6-digit verification code
   * @returns Promise resolving to true if successful
   */
  static async store(teamId, email, code) {
    const key = this.getKey(teamId, email);
    await this.redis.set(key, code, "PX", this.TTL);
    return true;
  }

  /**
   * Retrieve a verification code from Redis
   *
   * @param teamId The team the code was issued for
   * @param email The email address associated with the code
   * @returns Promise resolving to the code or undefined if not found
   */
  static async retrieve(teamId, email) {
    const key = this.getKey(teamId, email);
    return (await this.redis.get(key)) ?? undefined;
  }

  /**
   * Verify if a given code matches the stored code for an email within a team.
   *
   * @param teamId The team the code was issued for
   * @param email The email address associated with the code
   * @param code The code to verify
   * @returns Promise resolving to true if the code matches, false otherwise
   */
  static async verify(teamId, email, code) {
    const storedCode = await this.retrieve(teamId, email);
    if (!storedCode) {
      return false;
    }
    const attemptsKey = this.getAttemptsKey(teamId, email);
    const attempts = await this.redis.incr(attemptsKey);
    if (attempts === 1) {
      await this.redis.pexpire(attemptsKey, this.TTL);
    }
    if (attempts > this.MAX_ATTEMPTS) {
      await this.delete(teamId, email);
      return false;
    }
    return (0, _crypto.safeEqual)(storedCode, code);
  }

  /**
   * Delete a verification code from Redis
   *
   * @param teamId The team the code was issued for
   * @param email The email address associated with the code
   * @returns Promise resolving to true if successful
   */
  static async delete(teamId, email) {
    const key = this.getKey(teamId, email);
    const attemptsKey = this.getAttemptsKey(teamId, email);
    await this.redis.del(key, attemptsKey);
    return true;
  }

  /**
   * Get the Redis key for a code scoped to a team and email address.
   *
   * @param teamId The team the code was issued for
   * @param email The email address
   * @returns The Redis key
   */
  static getKey(teamId, email) {
    return `${this.KEY_PREFIX}${teamId}:${email.trim().toLowerCase()}`;
  }

  /**
   * Get the Redis key for tracking verification attempts.
   *
   * @param teamId The team the code was issued for
   * @param email The email address.
   * @returns the Redis key for attempts.
   */
  static getAttemptsKey(teamId, email) {
    return `${this.ATTEMPTS_PREFIX}${teamId}:${email.trim().toLowerCase()}`;
  }
}
exports.VerificationCode = VerificationCode;
_defineProperty(VerificationCode, "TTL", _time.Minute.ms * 10);
/**
 * Maximum number of verification attempts before the code is deleted
 */
_defineProperty(VerificationCode, "MAX_ATTEMPTS", 10);
/**
 * Prefix for Redis keys
 */
_defineProperty(VerificationCode, "KEY_PREFIX", "email_verification_code:");
/**
 * Prefix for Redis attempt counter keys
 */
_defineProperty(VerificationCode, "ATTEMPTS_PREFIX", "email_verification_attempts:");