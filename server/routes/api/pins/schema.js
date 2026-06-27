"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PinsUpdateSchema = exports.PinsListSchema = exports.PinsInfoSchema = exports.PinsDeleteSchema = exports.PinsCreateSchema = void 0;
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _zod = require("zod");
var _UrlHelper = require("../../../../shared/utils/UrlHelper");
var _zod2 = require("../../../utils/zod");
var _schema = require("../schema");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const PinsCreateSchema = exports.PinsCreateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    documentId: _zod.z.string({
      error: issue => issue.input === undefined ? "required" : undefined
    }).refine(val => (0, _isUUID.default)(val) || _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(val), {
      error: "must be uuid or url slug"
    }),
    collectionId: _zod.z.uuid().nullish(),
    index: _zod.z.string().regex(new RegExp("^[\x20-\x7E]+$"), {
      error: "must be between x20 to x7E ASCII"
    }).optional()
  })
});
const PinsInfoSchema = exports.PinsInfoSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    /** Document to get the pin info for. */
    documentId: (0, _zod2.zodIdType)(),
    /** Collection to which the pin belongs to. If not set, it's considered as "Home" pin. */
    collectionId: _zod.z.uuid().nullish()
  })
});
const PinsListSchema = exports.PinsListSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    collectionId: _zod.z.uuid().nullish()
  })
});
const PinsUpdateSchema = exports.PinsUpdateSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid(),
    index: _zod.z.string().regex(new RegExp("^[\x20-\x7E]+$"), {
      error: "must be between x20 to x7E ASCII"
    })
  })
});
const PinsDeleteSchema = exports.PinsDeleteSchema = _schema.BaseSchema.extend({
  body: _zod.z.object({
    id: _zod.z.uuid()
  })
});