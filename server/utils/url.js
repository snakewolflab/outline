"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateUrlId = void 0;
exports.isInvalidAppPath = isInvalidAppPath;
exports.isPrivateIP = isPrivateIP;
exports.validateUrlNotPrivate = validateUrlNotPrivate;
var _nodeDns = _interopRequireDefault(require("node:dns"));
var _nodeNet = _interopRequireDefault(require("node:net"));
var _ipaddr = _interopRequireDefault(require("ipaddr.js"));
var _random = require("../../shared/random");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const UrlIdLength = 10;
const generateUrlId = () => (0, _random.randomString)(UrlIdLength);

// Paths probed by vulnerability scanners.
exports.generateUrlId = generateUrlId;
const scannerPathPattern = new RegExp([
// paths
"^\\/(?:cgi-bin|wp-admin|wp-content|wp-includes|wp-json|wp-login\\.php|wordpress|xmlrpc\\.php|phpmyadmin|pma|myadmin|owa|autodiscover|actuator|vendor|webdav|cms|drupal|joomla|magento|laravel|adminer|console|server-status|server-info|HNAP1|boaform|hudson|jenkins)(?:\\/|$)",
// file endings
"\\.(?:php|asp|aspx|jsp|cgi|env|sql|bak|swp|htaccess|htpasswd)(?:$|[/?])",
// dotfiles
"^\\/\\.(?:well-known|env|git|svn|aws|ssh|DS_Store)"].join("|"), "i");

/**
 * Checks whether a request path looks like an automated scanner probe rather
 * than a legitimate application route, so the server can short-circuit with a
 * 404 instead of rendering the SPA shell.
 *
 * @param path - the request path to check.
 * @returns true if the path matches a known scanner pattern.
 */
function isInvalidAppPath(path) {
  return scannerPathPattern.test(path);
}

/**
 * Checks if an IP address is private, loopback, or link-local.
 *
 * @param ip - The IP address to check.
 * @returns true if the IP is private.
 */
function isPrivateIP(ip) {
  if (!_ipaddr.default.isValid(ip)) {
    return false;
  }

  // Only globally-routable unicast addresses are permitted
  return _ipaddr.default.parse(ip).range() !== "unicast";
}

/**
 * Checks whether an IP address is present in the allowed private IP list,
 * supporting both exact matches and CIDR ranges.
 *
 * @param ip - the IP address to check.
 * @returns true if the IP is explicitly allowed.
 */
function isAllowedPrivateIP(ip) {
  const allowList = _env.default.ALLOWED_PRIVATE_IP_ADDRESSES;
  if (!allowList || allowList.length === 0) {
    return false;
  }
  if (!_ipaddr.default.isValid(ip)) {
    return false;
  }
  const addr = _ipaddr.default.parse(ip);
  for (const entry of allowList) {
    if (_nodeNet.default.isIP(entry)) {
      if (entry === ip) {
        return true;
      }
    } else if (_ipaddr.default.isValid(entry.split("/")[0])) {
      try {
        if (addr.match(_ipaddr.default.parseCIDR(entry))) {
          return true;
        }
      } catch {
        // Skip invalid CIDR entries
      }
    }
  }
  return false;
}

/**
 * Validates that a URL does not resolve to a private or internal IP address.
 * Respects the ALLOWED_PRIVATE_IP_ADDRESSES environment variable.
 *
 * @param url - the URL to validate.
 * @throws InternalError if the URL resolves to a private IP that is not allowed.
 */
async function validateUrlNotPrivate(url) {
  // URL.hostname keeps the square brackets around IPv6 literals (e.g.
  // "[::1]"), which net.isIP does not accept, so strip them before checking.
  const hostname = new URL(url).hostname.replace(/^\[|\]$/g, "");
  if (_nodeNet.default.isIP(hostname)) {
    if (isPrivateIP(hostname) && !isAllowedPrivateIP(hostname)) {
      throw (0, _errors.InvalidRequestError)(`DNS lookup ${hostname} is not allowed.` + (_env.default.isCloudHosted ? "" : " To allow this request, add the IP address or CIDR range to the ALLOWED_PRIVATE_IP_ADDRESSES environment variable."));
    }
    return;
  }
  const {
    address
  } = await _nodeDns.default.promises.lookup(hostname);
  if (isPrivateIP(address) && !isAllowedPrivateIP(address)) {
    throw (0, _errors.InvalidRequestError)(`DNS lookup ${address} (${hostname}) is not allowed.` + (_env.default.isCloudHosted ? "" : " To allow this request, add the IP address or CIDR range to the ALLOWED_PRIVATE_IP_ADDRESSES environment variable."));
  }
}