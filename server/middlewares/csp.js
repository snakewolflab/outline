"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createCSPMiddleware;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _koaHelmet = require("koa-helmet");
var _compat = require("es-toolkit/compat");
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const getBucketOrigin = () => {
  if (_env.default.AWS_S3_ACCELERATE_URL) {
    return new URL(_env.default.AWS_S3_ACCELERATE_URL).origin;
  }
  const url = _env.default.AWS_S3_UPLOAD_BUCKET_URL || "";
  if (!url) {
    return;
  }
  try {
    const parsedUrl = new URL(url);
    if (_env.default.AWS_S3_UPLOAD_BUCKET_NAME && parsedUrl.hostname.startsWith(`${_env.default.AWS_S3_UPLOAD_BUCKET_NAME}.`)) {
      const hostnameWithoutBucket = parsedUrl.hostname.substring(_env.default.AWS_S3_UPLOAD_BUCKET_NAME.length + 1 // +1 for the dot
      );
      return `${parsedUrl.protocol}//${hostnameWithoutBucket}`;
    }
    return parsedUrl.origin;
  } catch {
    return;
  }
};
/**
 * Create a Content Security Policy middleware for the application.
 *
 * @param options Optional configuration for the CSP middleware.
 * @returns A Koa middleware function that applies the CSP headers.
 */
function createCSPMiddleware(options) {
  // Construct scripts CSP based on options in use
  const defaultSrc = ["'self'"];
  const scriptSrc = [];
  const styleSrc = ["'self'", "'unsafe-inline'"];
  const objectSrc = [_env.default.URL, "'self'"];
  if (_env.default.isCloudHosted) {
    scriptSrc.push("www.googletagmanager.com");
    scriptSrc.push("cdn.zapier.com");
    styleSrc.push("cdn.zapier.com");
  }

  // Allow to load assets from Vite
  if (!_env.default.isProduction) {
    scriptSrc.push(_env.default.URL.replace(`:${_env.default.PORT}`, ":3001"));
    scriptSrc.push("localhost:3001");
  } else {
    scriptSrc.push(_env.default.URL);
  }
  if (_env.default.GOOGLE_ANALYTICS_ID) {
    scriptSrc.push("www.googletagmanager.com");
    scriptSrc.push("www.google-analytics.com");
  }
  if (_env.default.CDN_URL) {
    scriptSrc.push(_env.default.CDN_URL);
    styleSrc.push(_env.default.CDN_URL);
    defaultSrc.push(_env.default.CDN_URL);
  }
  const bucketOrigin = getBucketOrigin();
  if (bucketOrigin) {
    objectSrc.push(bucketOrigin);
  }
  return function cspMiddleware(ctx, next) {
    ctx.state.cspNonce = _nodeCrypto.default.randomBytes(16).toString("hex");

    // Note: workerSrc is included even though it's missing from the koa-helmet
    // type definitions — the underlying helmet supports it. The service worker
    // is served from the same origin as the document, which may be a custom
    // domain that is not present in scriptSrc.
    const directives = {
      baseUri: ["'none'"],
      defaultSrc,
      styleSrc,
      scriptSrc: [...(0, _compat.uniq)(scriptSrc), ...(options?.extraScriptSrc ?? []), _env.default.DEVELOPMENT_UNSAFE_INLINE_CSP ? "'unsafe-inline'" : `'nonce-${ctx.state.cspNonce}'`],
      mediaSrc: ["*", "data:", "blob:"],
      imgSrc: ["*", "data:", "blob:"],
      frameSrc: ["*", "data:"],
      workerSrc: ["'self'"],
      objectSrc,
      // Do not use connect-src: because self + websockets does not work in
      // Safari, ref: https://bugs.webkit.org/show_bug.cgi?id=201591
      connectSrc: ["*"]
    };
    return (0, _koaHelmet.contentSecurityPolicy)({
      directives
    })(ctx, next);
  };
}