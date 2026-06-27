"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = headingToSlug;
var _compat = require("es-toolkit/compat");
var _slugify = _interopRequireDefault(require("slugify"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const cache = new Map();

// Slugify, escape, and remove periods from headings so that they are
// compatible with both url hashes AND dom ID's (querySelector does not like
// ID's that begin with a number or a period, for example).
function safeSlugify(text) {
  if (cache.has(text)) {
    return cache.get(text);
  }
  const slug = `h-${(0, _compat.escape)((0, _slugify.default)(text, {
    remove: /[!"#$%&'.()*+,/:;<=>?@[\]\\^_`{|}~]/g,
    lower: true
  }))}`;
  cache.set(text, slug);
  return slug;
}

// calculates a unique slug for this heading based on it's text and position
// in the document that is as stable as possible
function headingToSlug(node) {
  let index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  const slugified = safeSlugify(node.textContent);
  if (index === 0) {
    return slugified;
  }
  return `${slugified}-${index}`;
}