"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zodEmojiType = void 0;
exports.zodEnumFromObjectKeys = zodEnumFromObjectKeys;
exports.zodTimezone = exports.zodShareIdType = exports.zodIdType = exports.zodIconType = void 0;
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _zod = require("zod");
var _IconLibrary = require("../../shared/utils/IconLibrary");
var _UrlHelper = require("../../shared/utils/UrlHelper");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function zodEnumFromObjectKeys(input) {
  const keys = Object.keys(input);
  return _zod.z.enum(keys);
}
const zodIdType = () => _zod.z.union([_zod.z.string().regex(_UrlHelper.UrlHelper.SLUG_URL_REGEX), _zod.z.uuid()], {
  error: "Must be a valid UUID or slug"
});
exports.zodIdType = zodIdType;
const zodIconType = () => _zod.z.union([_zod.z.string().regex((0, _emojiRegex.default)()), zodEnumFromObjectKeys(_IconLibrary.IconLibrary.mapping), _zod.z.uuid()]);
exports.zodIconType = zodIconType;
const zodEmojiType = () => _zod.z.union([_zod.z.string().regex((0, _emojiRegex.default)()), _zod.z.uuid()]);
exports.zodEmojiType = zodEmojiType;
const zodShareIdType = () => _zod.z.union([_zod.z.uuid(), _zod.z.string().regex(_UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX)]);
exports.zodShareIdType = zodShareIdType;
const zodTimezone = () => _zod.z.string().refine(timezone => {
  try {
    Intl.DateTimeFormat(undefined, {
      timeZone: timezone
    });
    return true;
  } catch {
    return false;
  }
}, {
  error: "invalid timezone"
});
exports.zodTimezone = zodTimezone;