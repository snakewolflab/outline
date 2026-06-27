"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TextHelper = void 0;
var _compat = require("es-toolkit/compat");
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _urls = require("../../../shared/utils/urls");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _tracing = require("../../logging/tracing");
var _ = require("./..");
var _files = _interopRequireDefault(require("../../storage/files"));
var _parseAttachmentIds = _interopRequireDefault(require("../../utils/parseAttachmentIds"));
var _parseImages = _interopRequireDefault(require("../../utils/parseImages"));
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
let TextHelper = exports.TextHelper = (_dec = (0, _tracing.trace)(), _dec(_class = class TextHelper {
  /**
   * Converts attachment urls in documents to signed equivalents that allow
   * direct access without a session cookie
   *
   * @param text The text either html or markdown which contains urls to be converted
   * @param teamId The team context
   * @param expiresIn The time that signed urls should expire (in seconds)
   * @returns The replaced text
   */
  static async attachmentsToSignedUrls(text, teamId) {
    let expiresIn = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 3000;
    const attachmentIds = (0, _parseAttachmentIds.default)(text);
    await Promise.all(attachmentIds.map(async id => {
      const attachment = await _.Attachment.findOne({
        where: {
          id,
          teamId
        }
      });
      if (attachment) {
        const signedUrl = await _files.default.getSignedUrl(attachment.key, expiresIn);
        text = text.replace(new RegExp((0, _compat.escapeRegExp)(attachment.redirectUrl), "g"), signedUrl);
      }
    }));
    return text;
  }

  /**
   * Replaces remote and base64 encoded images in the given text with attachment
   * urls and uploads the images to the storage provider.
   *
   * @param ctx The API context
   * @param markdown The text to replace the images in
   * @param user The user context
   * @returns The text with the images replaced
   */
  static async replaceImagesWithAttachments(ctx, markdown, user) {
    let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    let output = markdown;
    const images = (0, _parseImages.default)(markdown);
    const timeoutPerImage = Math.floor(Math.min(_env.default.REQUEST_TIMEOUT / images.length, 10000));
    const chunks = (0, _compat.chunk)(images, 10);
    for (const chunk of chunks) {
      await Promise.all(chunk.map(async image => {
        // Skip attempting to fetch images that are not valid urls
        try {
          new URL(image.src);
        } catch (_e) {
          return;
        }
        if ((0, _urls.isInternalUrl)(image.src)) {
          return;
        }
        if (options.base64Only && !image.src.startsWith("data:")) {
          return;
        }
        try {
          const attachment = await (0, _attachmentCreator.default)({
            name: image.alt ?? "image",
            url: image.src,
            preset: _types.AttachmentPreset.DocumentAttachment,
            user,
            fetchOptions: {
              timeout: timeoutPerImage
            },
            ctx
          });
          if (attachment) {
            output = output.replace(new RegExp((0, _compat.escapeRegExp)(image.src), "g"), attachment.redirectUrl);
          }
        } catch (err) {
          _Logger.default.warn("Failed to download image for attachment", {
            error: (0, _error.errToString)(err),
            src: image.src
          });
        }
      }));
    }
    return output;
  }
}) || _class);