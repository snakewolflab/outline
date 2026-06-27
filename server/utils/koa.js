"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.streamZipResponse = exports.getFileFromRequest = void 0;
var _contentDisposition = _interopRequireDefault(require("content-disposition"));
var _compat = require("es-toolkit/compat");
var _yazl = require("yazl");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Get the first file from an incoming koa request
 *
 * @param request The incoming request
 * @returns The first file or undefined
 */
const getFileFromRequest = request => {
  const {
    files
  } = request;
  if (!files) {
    return undefined;
  }
  const file = Object.values(files)[0];
  if (!file) {
    return undefined;
  }
  return (0, _compat.isArray)(file) ? file[0] : file;
};

/**
 * Stream a freshly-built zip archive as the response body. The supplied
 * `build` callback receives a yazl ZipFile to populate with entries; the
 * helper handles response headers, error forwarding, and finalizing the
 * archive once `build` resolves.
 *
 * @param ctx The koa context to write the response to.
 * @param fileName The filename to advertise in the Content-Disposition header.
 * @param build Callback that adds entries to the provided ZipFile.
 */
exports.getFileFromRequest = getFileFromRequest;
const streamZipResponse = async (ctx, fileName, build) => {
  const zip = new _yazl.ZipFile();
  await build(zip);
  ctx.set("Content-Type", "application/zip");
  ctx.set("Content-Disposition", (0, _contentDisposition.default)(fileName, {
    type: "attachment"
  }));
  zip.outputStream.on("error", err => {
    ctx.app.emit("error", err, ctx);
    ctx.res.destroy(err);
  });
  ctx.body = zip.outputStream;
  zip.end();
};
exports.streamZipResponse = streamZipResponse;