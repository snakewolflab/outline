"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _policies = require("../../policies");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Task to disable mechanisms for exporting data from a suspended or demoted user,
 * currently this is done by destroying associated Api Keys and disabling webhooks.
 */
class CleanupDemotedUserTask extends _BaseTask.BaseTask {
  async perform(props) {
    const user = await _models.User.scope("withTeam").findByPk(props.userId);
    if (!user) {
      return;
    }
    await _database.sequelize.transaction(async transaction => {
      if ((0, _policies.cannot)(user, "createWebhookSubscription", user.team)) {
        const subscriptions = await _models.WebhookSubscription.findAll({
          where: {
            createdById: props.userId,
            enabled: true
          },
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        await Promise.all(subscriptions.map(subscription => subscription.disable({
          transaction
        })));
        _Logger.default.info("task", `Disabled ${subscriptions.length} webhooks for user ${props.userId}`);
      }
      if ((0, _policies.cannot)(user, "createApiKey", user.team)) {
        const apiKeys = await _models.ApiKey.findAll({
          where: {
            userId: props.userId
          },
          transaction,
          lock: transaction.LOCK.UPDATE
        });
        await Promise.all(apiKeys.map(apiKey => apiKey.destroy({
          transaction
        })));
        _Logger.default.info("task", `Destroyed ${apiKeys.length} api keys for user ${props.userId}`);
      }
    });
  }
  get options() {
    return {
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupDemotedUserTask;