"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _contentDisposition = _interopRequireDefault(require("content-disposition"));
var _files = require("../../../../shared/utils/files");
var _env = _interopRequireDefault(require("../../../../server/env"));
var _errors = require("../../../../server/errors");
var _authentication = _interopRequireDefault(require("../../../../server/middlewares/authentication"));
var _multipart = _interopRequireDefault(require("../../../../server/middlewares/multipart"));
var _rateLimiter = require("../../../../server/middlewares/rateLimiter");
var _timeout = _interopRequireDefault(require("../../../../server/middlewares/timeout"));
var _validate = _interopRequireDefault(require("../../../../server/middlewares/validate"));
var _models = require("../../../../server/models");
var _AttachmentHelper = _interopRequireDefault(require("../../../../server/models/helpers/AttachmentHelper"));
var _policies = require("../../../../server/policies");
var _files2 = _interopRequireDefault(require("../../../../server/storage/files"));
var _RateLimiter = require("../../../../server/utils/RateLimiter");
var _jwt = require("../../../../server/utils/jwt");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("files.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.FilesCreateSchema), (0, _timeout.default)(30 * 60 * 1000),
// 30 minutes for large file uploads
(0, _multipart.default)({
  maximumFileSize: Math.max(_env.default.FILE_STORAGE_UPLOAD_MAX_SIZE, _env.default.FILE_STORAGE_IMPORT_MAX_SIZE)
}), async ctx => {
  const actor = ctx.state.auth.user;
  const {
    key
  } = ctx.input.body;
  const file = ctx.input.file;
  if (!file) {
    throw (0, _errors.ValidationError)("Request must include a file parameter");
  }
  const attachment = await _models.Attachment.findOne({
    where: {
      key
    },
    rejectOnEmpty: true
  });
  if (attachment.userId !== actor.id) {
    throw (0, _errors.AuthorizationError)("Invalid key");
  }
  const declaredSize = Number(attachment.size);
  if (file.size > declaredSize) {
    throw (0, _errors.ValidationError)(`The uploaded file exceeds the declared size of ${(0, _files.bytesToHumanReadable)(declaredSize)}`);
  }
  try {
    await attachment.writeFile(file);
  } catch (err) {
    if (err instanceof Error && err.message.includes("permission denied")) {
      throw Error(`Permission denied writing to "${key}". Check the host machine file system permissions.`);
    }
    throw err;
  }
  if (declaredSize !== file.size) {
    await attachment.update({
      size: file.size
    }, {
      silent: true
    });
  }
  ctx.body = {
    success: true
  };
});
router.get("files.get", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.FilesGetSchema), async ctx => {
  const actor = ctx.state.auth.user;
  const key = getKeyFromContext(ctx);
  const forceDownload = !!ctx.input.query.download;
  const isSignedRequest = !!ctx.input.query.sig;
  const {
    isPublicBucket,
    fileName
  } = _AttachmentHelper.default.parseKey(key);
  const cacheHeader = "max-age=604800, immutable";
  const attachment = await _models.Attachment.findByKey(key);

  // Skip authorization for public bucket, signed requests, or public-read ACL attachments
  const skipAuthorize = isPublicBucket || isSignedRequest || attachment && !attachment.isPrivate;
  if (!skipAuthorize) {
    if (!attachment && !!ctx.input.query.key) {
      throw (0, _errors.NotFoundError)();
    }
    (0, _policies.authorize)(actor, "read", attachment);
  }
  const contentType = attachment?.contentType || (fileName ? _mimeTypes.default.lookup(fileName) : undefined) || "application/octet-stream";
  if (contentType === "application/pdf") {
    ctx.remove("X-Frame-Options");
  }
  ctx.set("Accept-Ranges", "bytes");
  ctx.set("Access-Control-Allow-Origin", "*");
  ctx.set("Cache-Control", cacheHeader);
  ctx.set("Content-Type", contentType);
  ctx.set("Content-Security-Policy",
  // Safari will not render PDFs in an embed if the sandbox directive is used, so we use a
  // tight CSP in that case. For all other file types we use the strict sandbox directive
  // which blocks all content from being loaded and rendered.
  contentType === "application/pdf" ? "default-src 'self'; object-src 'self'; base-uri 'none';" : "sandbox");
  ctx.set("Content-Disposition", (0, _contentDisposition.default)(fileName, {
    type: forceDownload ? "attachment" : _files2.default.getContentDisposition(contentType)
  }));

  // Handle byte range requests
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests
  const stats = await _files2.default.stat(key);
  const range = getByteRange(ctx, stats.size);
  if (range) {
    ctx.status = 206;
    ctx.set("Content-Length", String(range.end - range.start + 1));
    ctx.set("Content-Range", `bytes ${range.start}-${range.end}/${stats.size}`);
  } else {
    ctx.set("Content-Length", String(stats.size));
  }
  ctx.body = await _files2.default.getFileStream(key, range);
});
function getByteRange(ctx, size) {
  const {
    range
  } = ctx.headers;
  if (!range) {
    return;
  }
  const match = range.match(/bytes=(\d+)-(\d+)?/);
  if (!match) {
    return;
  }
  const start = parseInt(match[1], 10);
  const end = parseInt(match[2], 10) || size - 1;
  return {
    start,
    end
  };
}
function getKeyFromContext(ctx) {
  const {
    key,
    sig
  } = ctx.input.query;
  if (sig) {
    const payload = (0, _jwt.getJWTPayload)(sig);
    if (payload.type !== "attachment") {
      throw (0, _errors.AuthenticationError)("Invalid signature");
    }
    try {
      _jsonwebtoken.default.verify(sig, _env.default.SECRET_KEY);
    } catch (_err) {
      throw (0, _errors.AuthenticationError)("Invalid signature");
    }
    return payload.key;
  }
  if (key) {
    return key;
  }
  throw (0, _errors.ValidationError)("Must provide either key or sig parameter");
}
var _default = exports.default = router;