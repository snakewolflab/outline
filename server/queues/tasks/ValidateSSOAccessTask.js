"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _MutexLock = require("../../utils/MutexLock");
var _time = require("../../../shared/utils/time");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ValidateSSOAccessTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      userId
    } = _ref;
    await _MutexLock.MutexLock.using(`validateSSO:${userId}`, _time.Minute.ms, async signal => {
      const userAuthentications = await _models.UserAuthentication.findAll({
        where: {
          userId
        }
      });
      if (userAuthentications.length === 0) {
        return;
      }

      // Check the validity of the user's authentications.
      let error;
      const validity = await Promise.all(userAuthentications.map(async authentication => {
        try {
          return await authentication.validateAccess();
        } catch (err) {
          error = err;
          return false;
        }
      }));
      if (signal.aborted) {
        throw signal.error;
      }
      if (validity.some(isValid => isValid)) {
        return;
      }

      // If an unexpected error occurred, throw it to trigger a retry.
      if (error) {
        throw error;
      }

      // If all are invalid then we need to revoke the users Outline sessions.
      const user = await _models.User.findByPk(userId);
      _Logger.default.info("task", `Authentication token no longer valid for ${user?.id}`);
      await user?.rotateJwtSecret({});
    });
  }
  get options() {
    return {
      attempts: 2,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = ValidateSSOAccessTask;