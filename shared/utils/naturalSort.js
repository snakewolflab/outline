"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _compat = require("es-toolkit/compat");
var _naturalSort = _interopRequireDefault(require("natural-sort"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const sorter = (0, _naturalSort.default)();
const regex = (0, _emojiRegex.default)();
const stripEmojis = value => value.replace(regex, "");
const cleanValue = value => stripEmojis((0, _compat.deburr)(value));
function getSortByField(item, keyOrCallback) {
  const field = typeof keyOrCallback === "string" ? item[keyOrCallback] : keyOrCallback(item);
  return cleanValue(typeof field === "string" ? field : "");
}
function naturalSortBy(items, key, sortOptions) {
  if (!items) {
    return [];
  }
  const sort = sortOptions ? (0, _naturalSort.default)({
    caseSensitive: sortOptions.caseSensitive,
    direction: sortOptions.direction === "desc" ? "desc" : undefined
  }) : sorter;
  return items.sort((a, b) => sort(getSortByField(a, key), getSortByField(b, key)));
}
var _default = exports.default = naturalSortBy;