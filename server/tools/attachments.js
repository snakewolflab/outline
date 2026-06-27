"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.attachmentTools = attachmentTools;
var _crypto = require("crypto");
var _zod = require("zod");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _models = require("../models");
var _AttachmentHelper = _interopRequireDefault(require("../models/helpers/AttachmentHelper"));
var _policies = require("../policies");
var _attachment = _interopRequireDefault(require("../presenters/attachment"));
var _files = _interopRequireDefault(require("../storage/files"));
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _types = require("../../shared/types");
var _files2 = require("../../shared/utils/files");
var _util = require("./util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Registers attachment-related MCP tools on the given server, filtered by
 * the OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function attachmentTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("attachments.create", scopes)) {
    server.registerTool("create_attachment", {
      title: "Create attachment upload",
      description: "Requests a pre-signed upload URL. Use the returned uploadUrl and form fields to upload a file directly via a multipart POST request (e.g. with curl). The returned attachment URL is returned for use in documents.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        contentType: _zod.z.string().describe("The MIME type of the file, e.g. image/png, image/jpeg."),
        name: _zod.z.string().describe("The filename including extension, e.g. screenshot.png."),
        size: _zod.z.coerce.number().int().nonnegative().finite().describe("The file size in bytes.")
      }
    }, (0, _util.withTracing)("create_attachment", async (_ref, extra) => {
      let {
        contentType,
        name,
        size
      } = _ref;
      try {
        const ctx = (0, _util.buildAPIContext)(extra);
        const {
          user
        } = ctx.state.auth;
        const team = await _models.Team.findByPk(user.teamId, {
          rejectOnEmpty: true
        });
        (0, _policies.authorize)(user, "createAttachment", team);
        const preset = _types.AttachmentPreset.DocumentAttachment;
        const maxUploadSize = _AttachmentHelper.default.presetToMaxUploadSize(preset);
        if (size > maxUploadSize) {
          throw (0, _errors.ValidationError)(`Sorry, this file is too large – the maximum size is ${(0, _files2.bytesToHumanReadable)(maxUploadSize)}`);
        }
        const id = (0, _crypto.randomUUID)();
        const acl = _AttachmentHelper.default.presetToAcl(preset);
        const key = _AttachmentHelper.default.getKey({
          id,
          name,
          userId: user.id
        });
        const attachment = await _models.Attachment.createWithCtx(ctx, {
          id,
          key,
          acl,
          size,
          contentType,
          teamId: user.teamId,
          userId: user.id
        });
        const usePut = _env.default.AWS_S3_UPLOAD_METHOD === "put";
        if (usePut) {
          const presignedPut = await _files.default.getPresignedPut(key, acl, size, contentType);
          if (!presignedPut) {
            throw (0, _errors.InvalidRequestError)(`The current storage backend does not support PUT uploads. Set AWS_S3_UPLOAD_METHOD to "post" or use an S3-compatible storage provider.`);
          }
          const curlCommand = `curl -X PUT ${Object.entries(presignedPut.headers).map(_ref2 => {
            let [k, v] = _ref2;
            return `-H '${k}: ${v}'`;
          }).join(" ")} --data-binary '@/path/to/file' '${presignedPut.url}'`;
          return (0, _util.success)({
            mode: "put",
            url: presignedPut.url,
            headers: presignedPut.headers,
            maxUploadSize,
            curlCommand,
            attachment: (0, _util.pathToUrl)(team, {
              ...(0, _attachment.default)(attachment),
              url: attachment.redirectUrl
            })
          });
        } else {
          const presignedPost = await _files.default.getPresignedPost(ctx, key, acl, maxUploadSize, contentType);
          const uploadUrl = new URL(_files.default.getUploadUrl(), team.url).href;
          const form = {
            "Cache-Control": "max-age=31557600",
            "Content-Type": contentType,
            ...presignedPost.fields
          };
          const formArgs = Object.entries(form).map(_ref3 => {
            let [k, v] = _ref3;
            return `-F '${k}=${v}'`;
          }).join(" ");
          const curlCommand = `curl -X POST ${formArgs} -F 'file=@/path/to/file' '${uploadUrl}'`;
          return (0, _util.success)({
            mode: "post",
            uploadUrl,
            form,
            maxUploadSize,
            curlCommand,
            attachment: (0, _util.pathToUrl)(team, {
              ...(0, _attachment.default)(attachment),
              url: attachment.redirectUrl
            })
          });
        }
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
}