"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = require("node:crypto");
var _types = require("../../../shared/types");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _context = require("../../context");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that uploads the provided avatarUrl to S3 storage and updates the
 * user's record with the new url.
 */
class UploadUserAvatarTask extends _BaseTask.BaseTask {
  async perform(props) {
    const user = await _models.User.findByPk(props.userId, {
      rejectOnEmpty: true
    });
    const hash = (0, _nodeCrypto.createHash)("sha256").update(props.avatarUrl).digest("hex");

    // If the user's avatar URL already contains this hash, skip the upload.
    // This handles old-style canonical S3 URLs that include the hash in the path.
    if (user.avatarUrl?.includes(hash)) {
      return;
    }

    // For redirect-style avatar URLs, check if the underlying attachment
    // already has this hash in its key to avoid re-uploading the same avatar.
    const redirectMatch = user.avatarUrl?.match(/attachments\.redirect\?id=([^&]+)/);
    if (redirectMatch) {
      const existing = await _models.Attachment.findByPk(redirectMatch[1]);
      if (existing?.key.endsWith(`/${hash}`)) {
        return;
      }
    }
    const attachment = await (0, _attachmentCreator.default)({
      name: hash,
      url: props.avatarUrl,
      user,
      preset: _types.AttachmentPreset.Avatar,
      ctx: (0, _context.createContext)({
        user
      })
    });
    if (attachment) {
      await user.update({
        avatarUrl: attachment.redirectUrl
      });
    }
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadUserAvatarTask;