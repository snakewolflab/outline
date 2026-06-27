"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../../../shared/types");
var _attachmentCreator = _interopRequireDefault(require("../../commands/attachmentCreator"));
var _context = require("../../context");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * A task that uploads the provided avatarUrl to S3 storage and updates the
 * team's record with the new url.
 */
class UploadTeamAvatarTask extends _BaseTask.BaseTask {
  async perform(props) {
    const team = await _models.Team.findByPk(props.teamId, {
      rejectOnEmpty: true
    });
    const user = await _models.User.findOne({
      where: {
        teamId: team.id
      }
    });
    if (!user) {
      return;
    }
    const attachment = await (0, _attachmentCreator.default)({
      name: "avatar",
      url: props.avatarUrl,
      user,
      preset: _types.AttachmentPreset.Avatar,
      ctx: (0, _context.createContext)({
        user
      })
    });
    if (attachment) {
      await team.update({
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
exports.default = UploadTeamAvatarTask;