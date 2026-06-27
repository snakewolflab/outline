"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normalizeIp = normalizeIp;
var _nodeNet = _interopRequireDefault(require("node:net"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Normalize an IP address string for storage in audit columns.
 *
 * Handles common upstream-proxy artifacts that would otherwise fail
 * Sequelize's `isIP` validation: IPv4-mapped IPv6 prefixes, IPv6 zone
 * identifiers, and `X-Forwarded-For` chains. Returns `null` for any
 * value that is not a valid IPv4 or IPv6 address after normalization.
 *
 * @param value the raw IP string (e.g. from `ctx.request.ip`).
 * @returns a valid IP string, or `null`.
 */
function normalizeIp(value) {
  if (!value || typeof value !== "string") {
    return null;
  }
  let ip = value.split(",")[0]?.trim() ?? "";
  ip = ip.replace(/^::ffff:/i, "");
  const zoneIndex = ip.indexOf("%");
  if (zoneIndex !== -1) {
    ip = ip.slice(0, zoneIndex);
  }
  return _nodeNet.default.isIP(ip) !== 0 ? ip : null;
}