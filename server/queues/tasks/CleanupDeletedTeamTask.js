"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _teamPermanentDeleter = _interopRequireDefault(require("../../commands/teamPermanentDeleter"));
var _models = require("../../models");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class CleanupDeletedTeamTask extends _BaseTask.BaseTask {
  async perform(_ref) {
    let {
      teamId
    } = _ref;
    const team = await _models.Team.findByPk(teamId, {
      paranoid: false,
      rejectOnEmpty: true
    });
    await (0, _teamPermanentDeleter.default)(team);
  }
  get options() {
    return {
      attempts: 1,
      priority: _BaseTask.TaskPriority.Background
    };
  }
}
exports.default = CleanupDeletedTeamTask;