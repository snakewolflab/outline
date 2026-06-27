"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = validateWebhook;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _crypto = require("../utils/crypto");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function validateWebhook(_ref) {
  let {
    secretKey,
    getSignatureFromHeader,
    hmacSign = true
  } = _ref;
  return async function validateWebhookMiddleware(ctx, next) {
    const {
      body
    } = ctx.request;
    const signatureFromHeader = getSignatureFromHeader(ctx);
    if (!signatureFromHeader) {
      ctx.status = 401;
      ctx.body = "Missing signature header";
      return;
    }
    const key = typeof secretKey === "function" ? await secretKey(ctx) : secretKey;
    if (!key) {
      ctx.status = 401;
      ctx.body = "Invalid signature";
      return;
    }
    const computedSignature = hmacSign ? _nodeCrypto.default.createHmac("sha256", key).update(JSON.stringify(body)).digest("hex") : key;
    if (!(0, _crypto.safeEqual)(computedSignature, signatureFromHeader)) {
      ctx.status = 401;
      ctx.body = "Invalid signature";
      return;
    }
    return next();
  };
}