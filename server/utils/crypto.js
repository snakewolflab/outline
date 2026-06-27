"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hash = hash;
exports.safeEqual = safeEqual;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Compare two strings in constant time to prevent timing attacks.
 *
 * @param a The first string to compare
 * @param b The second string to compare
 * @returns Whether the strings are equal
 */
function safeEqual(a, b) {
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return _nodeCrypto.default.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Hash a string using SHA-256.
 *
 * @param input The input string to hash
 * @returns The hashed input
 */
function hash(input) {
  return _nodeCrypto.default.createHash("sha256").update(input).digest("hex");
}