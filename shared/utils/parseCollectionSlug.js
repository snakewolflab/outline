"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseCollectionSlug;
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Parse the likely collection identifier from a given url.
 *
 * @param url The url to parse.
 * @returns A collection identifier or undefined if not found.
 */
function parseCollectionSlug(url) {
  let parsed;
  if (url[0] === "/") {
    url = `${_env.default.URL}${url}`;
  }
  try {
    parsed = new URL(url).pathname;
  } catch (_err) {
    return;
  }
  const split = parsed.split("/");
  const indexOfCollection = split.indexOf("collection");
  return split[indexOfCollection + 1] ?? undefined;
}