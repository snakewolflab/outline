"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unbundleToken = exports.signToken = exports.generateRawToken = exports.bundleToken = void 0;
var _nodeCrypto = require("node:crypto");
var _crypto = require("./crypto");
/**
 * Generates cryptographically secure random bytes
 *
 * @param size The number of bytes to generate
 * @returns A buffer containing random bytes
 */
const generateRawToken = size => (0, _nodeCrypto.randomBytes)(size);

/**
 * Creates an HMAC-SHA256 signature for a token
 *
 * @param token The token to sign
 * @param secret The secret key for signing
 * @returns The HMAC signature as a hex string
 */
exports.generateRawToken = generateRawToken;
const signToken = (token, secret) => (0, _nodeCrypto.createHmac)("sha256", secret).update(token).digest("hex");

/**
 * Bundles a token with its HMAC signature
 *
 * @param token The raw token
 * @param secret The secret key for signing
 * @returns A string containing the token and signature separated by a dot
 */
exports.signToken = signToken;
const bundleToken = (token, secret) => {
  const sig = signToken(token, secret);
  return `${token.toString("hex")}.${sig}`;
};

/**
 * Unbundles and verifies a token with its HMAC signature
 *
 * @param bundled The bundled token string
 * @param secret The secret key for verification
 * @returns An object indicating validity and the raw token if valid
 */
exports.bundleToken = bundleToken;
const unbundleToken = (bundled, secret) => {
  const [hex, sig] = bundled.split(".");
  if (!hex || !sig) {
    return {
      valid: false
    };
  }
  const token = Buffer.from(hex, "hex");
  const expected = signToken(token, secret);
  const valid = (0, _crypto.safeEqual)(sig, expected);
  return {
    valid,
    raw: valid ? token : undefined
  };
};
exports.unbundleToken = unbundleToken;