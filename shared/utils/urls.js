"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cdnPath = cdnPath;
exports.creatingUrlPrefix = void 0;
exports.fileNameFromUrl = fileNameFromUrl;
exports.getUrls = getUrls;
exports.isBase64Url = isBase64Url;
exports.isCollectionUrl = isCollectionUrl;
exports.isDocumentUrl = isDocumentUrl;
exports.isExternalUrl = isExternalUrl;
exports.isInternalUrl = isInternalUrl;
exports.isUrl = isUrl;
exports.parseShareIdFromUrl = parseShareIdFromUrl;
exports.sanitizeImageSrc = sanitizeImageSrc;
exports.sanitizeUrl = sanitizeUrl;
exports.toDisplayUrl = toDisplayUrl;
exports.urlRegex = urlRegex;
var _compat = require("es-toolkit/compat");
var _env = _interopRequireDefault(require("../env"));
var _browser = require("./browser");
var _domains = require("./domains");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Prepends the CDN url to the given path (If a CDN is configured).
 *
 * @param path The path to prepend the CDN url to.
 * @returns The path with the CDN url prepended.
 */
function cdnPath(path) {
  return `${_env.default.CDN_URL ?? ""}${path}`;
}

/**
 * Extracts the file name from a given url.
 *
 * @param url The url to extract the file name from.
 * @returns The file name.
 */
function fileNameFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.split("/").pop();
  } catch (_err) {
    return;
  }
}

/**
 * Returns true if the given string is a link to inside the application.
 *
 * @param url The url to check.
 * @returns True if the url is internal, false otherwise.
 */
function isInternalUrl(href) {
  // empty strings are never internal
  if (href === "") {
    return false;
  }

  // relative paths are always internal
  if (href[0] === "/") {
    return true;
  }
  const outline = _browser.isBrowser ? (0, _domains.parseDomain)(window.location.href) : (0, _domains.parseDomain)(_env.default.URL);
  const domain = (0, _domains.parseDomain)(href);
  return outline.host === domain.host && outline.port === domain.port || _browser.isBrowser && window.location.hostname === domain.host && window.location.port === domain.port;
}

/**
 * Returns true if the given string is a link to a document.
 *
 * @param url The url to check.
 * @returns True if a document, false otherwise.
 */
function isDocumentUrl(url) {
  try {
    const parsed = new URL(url, _env.default.URL);
    return isInternalUrl(url) && (parsed.pathname.startsWith("/doc/") || parsed.pathname.startsWith("/d/"));
  } catch (_err) {
    return false;
  }
}

/**
 * Returns true if the given string is a link to a collection.
 *
 * @param url The url to check.
 * @returns True if a collection, false otherwise.
 */
function isCollectionUrl(url) {
  try {
    const parsed = new URL(url, _env.default.URL);
    return isInternalUrl(url) && parsed.pathname.startsWith("/collection/");
  } catch (_err) {
    return false;
  }
}
/**
 * Returns true if the given string is a url.
 *
 * @param text The url to check.
 * @param options Parsing options.
 * @returns True if a url, false otherwise.
 */
function isUrl(text) {
  let {
    requireProtocol = true,
    requireHostname,
    requireHttps
  } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (text.match(/\n/)) {
    return false;
  }
  if (!requireProtocol && text.startsWith("www.")) {
    const parts = text.split(".");
    if (parts.length < 2) {
      return false;
    }
    text = `https://${text}`;
  }
  try {
    const url = new URL(text);
    const blockedProtocols = ["javascript:", "file:", "vbscript:", "data:"];
    if (blockedProtocols.includes(url.protocol)) {
      return false;
    }
    if (requireHttps && url.protocol === "http:") {
      return false;
    }
    if (url.hostname) {
      return true;
    }
    return url.protocol !== "" && (url.pathname.startsWith("//") || url.pathname.startsWith("http")) && !requireHostname;
  } catch (_err) {
    return false;
  }
}

/**
 * Temporary prefix applied to links in document that are not yet persisted.
 */
const creatingUrlPrefix = exports.creatingUrlPrefix = "creating#";

/**
 * Returns true if the given string is a link to outside the application.
 *
 * @param url The url to check.
 * @returns True if the url is external, false otherwise.
 */
function isExternalUrl(url) {
  return !!url && !isInternalUrl(url) && !url.startsWith(creatingUrlPrefix) && (!_env.default.CDN_URL || !url.startsWith(_env.default.CDN_URL));
}

/**
 * Returns match if the given string is a base64 encoded url.
 *
 * @param url The url to check.
 * @returns A RegExp match if the url is base64, false otherwise.
 */
function isBase64Url(url) {
  const match = url.match(/^data:([a-z]+\/[^;]+);base64,(.*)/i);
  return match ? match : false;
}
const allowedSchemes = ["mailto:", "sms:", "fax:", "tel:", "geo:", "maps:", "magnet:"];
const allowedImageDataUris = ["data:image/png;base64,", "data:image/jpeg;base64,", "data:image/gif;base64,", "data:image/webp;base64,", "data:image/avif;base64,"];

/**
 * For use in the editor, this function will ensure that a url is
 * potentially valid, and filter out unsupported and malicious protocols.
 *
 * @param url The url to sanitize
 * @returns The sanitized href
 */
function sanitizeUrl(url) {
  if (!url) {
    return undefined;
  }
  const lower = url.toLowerCase();
  if (!isUrl(url, {
    requireHostname: false
  }) && !url.startsWith("/") && !url.startsWith("#") && !allowedSchemes.some(scheme => lower.startsWith(scheme))) {
    return `https://${url}`;
  }
  return url;
}

/**
 * For use in the editor on image-like elements, this function will ensure
 * that a src is potentially valid. In addition to the protocols allowed by
 * `sanitizeUrl`, base64-encoded image data URIs are permitted (excluding
 * SVG, which can contain inline scripts).
 *
 * @param src The src to sanitize.
 * @returns The sanitized src.
 */
function sanitizeImageSrc(src) {
  if (!src) {
    return undefined;
  }
  const lower = src.toLowerCase();
  if (allowedImageDataUris.some(scheme => lower.startsWith(scheme))) {
    return src;
  }
  return sanitizeUrl(src);
}

/**
 * Returns a regex to match the given url.
 *
 * @param url The url to create a regex for.
 * @returns A regex to match the url.
 */
function urlRegex(url) {
  if (!url || !isUrl(url)) {
    return undefined;
  }
  const urlObj = new URL(sanitizeUrl(url));
  return new RegExp((0, _compat.escapeRegExp)(`${urlObj.protocol}//${urlObj.host}`));
}

/**
 * Parse the share identifier from a given url.
 *
 * @param url The url to parse.
 * @returns A share identifier or undefined if not found.
 */
function parseShareIdFromUrl(url) {
  if (url[0] === "/") {
    url = `${_env.default.URL}${url}`;
  }
  let pathname;
  try {
    pathname = new URL(url).pathname;
  } catch (_err) {
    return;
  }
  const split = pathname.split("/");
  const indexOfS = split.indexOf("s");
  if (indexOfS >= 0) {
    const shareId = split[indexOfS + 1];
    if (shareId) {
      // Remove trailing format like .md
      const dotIndex = shareId.indexOf(".");
      return dotIndex >= 0 ? shareId.substring(0, dotIndex) : shareId;
    }
  }
  return undefined;
}

/**
 * Extracts LIKELY urls from the given text, note this does not validate the urls.
 *
 * @param text The text to extract urls from.
 * @returns An array of likely urls.
 */
function getUrls(text) {
  return Array.from(text.match(/(?:https?):\/\/[^\s]+/gi) || []);
}

/**
 * Converts a url to a display friendly format, removing the protocol and trailing slash.
 *
 * @param url The url to convert.
 * @returns The display friendly url.
 */
function toDisplayUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.host + (parsed.pathname === "/" ? "" : parsed.pathname);
  } catch {
    return url;
  }
}