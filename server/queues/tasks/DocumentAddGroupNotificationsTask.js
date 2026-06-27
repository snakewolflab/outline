"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
var _DocumentAddUserNotificationsTask = _interopRequireDefault(require("./DocumentAddUserNotificationsTask"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentAddGroupNotificationsTask extends _BaseTask.BaseTask {
  async perform(event) {
    await _models.GroupUser.findAllInBatches({
      where: {
        groupId: event.modelId,
        userId: {
          [_sequelize.Op.ne]: event.actorId
        }
      },
      batchLimit: 10
    }, async groupUsers => {
      await Promise.all(groupUsers.map(async groupUser => {
        await new _DocumentAddUserNotificationsTask.default().schedule({
          ...event,
          name: "documents.add_user",
          modelId: event.data.membershipId,
          userId: groupUser.userId
        });
      }));
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = DocumentAddGroupNotificationsTask;