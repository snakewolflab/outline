"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _asyncSema = require("async-sema");
var _error = require("../../../shared/utils/error");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _files = _interopRequireDefault(require("../../storage/files"));
var _BaseTask = require("./base/BaseTask");
var _env = _interopRequireDefault(require("../../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const ConcurrentUploads = 5;
/**
 * A task that uploads a list of provided urls to known attachments.
 */
class UploadAttachmentsForImportTask extends _BaseTask.BaseTask {
  async perform(items) {
    const sema = new _asyncSema.Sema(ConcurrentUploads, {
      // perf: pre-allocate the queue size
      capacity: items.length > ConcurrentUploads ? items.length : ConcurrentUploads
    });
    const uploadPromises = items.map(async item => {
      try {
        await sema.acquire();
        const attachment = await _models.Attachment.findByPk(item.attachmentId, {
          rejectOnEmpty: true
        });

        // This means the attachment has already been uploaded.
        if (String(attachment.size) !== "0") {
          return;
        }
        const res = await _files.default.storeFromUrl(item.url, attachment.key, attachment.acl, {
          timeout: _env.default.FILE_STORAGE_IMPORT_TIMEOUT
        });
        if (res) {
          await attachment.update({
            size: res.contentLength,
            contentType: res.contentType
          });
        }
      } catch (err) {
        _Logger.default.error("error uploading attachments for import", (0, _error.toError)(err));
        throw err;
      } finally {
        sema.release();
      }
    });
    return await Promise.all(uploadPromises);
  }
  get options() {
    return {
      attempts: 3,
      priority: _BaseTask.TaskPriority.Normal
    };
  }
}
exports.default = UploadAttachmentsForImportTask;