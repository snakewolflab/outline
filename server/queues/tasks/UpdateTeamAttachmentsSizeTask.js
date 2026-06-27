"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _database = require("../../storage/database");
/**
 * A task that updates the team stats.
 */
class UpdateTeamAttachmentsSizeTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      teamId
    } = _ref;
    const sizeInBytes = await _models.Attachment.getTotalSizeForTeam(_database.sequelizeReadOnly, teamId);
    if (!sizeInBytes) {
      return;
    }
    await _models.Team.update({
      approximateTotalAttachmentsSize: sizeInBytes
    }, {
      where: {
        id: teamId
      }
    });
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = UpdateTeamAttachmentsSizeTask;