"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _error = require("../../../shared/utils/error");
var _context = require("../../context");
var _models = require("../../models");
var _files = _interopRequireDefault(require("../../storage/files"));
var _BaseTask = require("./base/BaseTask");
var _database = require("../../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that uploads the provided url to a known attachment.
 */
class UploadAttachmentFromUrlTask extends _BaseTask.BaseTask {
  async perform(props) {
    const attachment = await _models.Attachment.findByPk(props.attachmentId, {
      rejectOnEmpty: true,
      include: [{
        association: "user"
      }]
    });
    try {
      const res = await _files.default.storeFromUrl(props.url, attachment.key, attachment.acl);
      if (res?.url) {
        await _database.sequelize.transaction(async transaction => {
          const ctx = (0, _context.createContext)({
            user: attachment.user,
            transaction
          });
          await attachment.updateWithCtx(ctx, {
            url: res.url,
            size: res.contentLength,
            contentType: res.contentType
          });
        });
      }
    } catch (err) {
      return {
        error: (0, _error.errToString)(err)
      };
    }
    return {};
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadAttachmentFromUrlTask;