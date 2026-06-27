"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
class DeleteAttachmentTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      attachmentId,
      teamId
    } = _ref;
    const attachment = await _models.Attachment.findOne({
      where: {
        teamId,
        id: attachmentId
      }
    });
    if (!attachment) {
      return;
    }
    await attachment.destroy();
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DeleteAttachmentTask;