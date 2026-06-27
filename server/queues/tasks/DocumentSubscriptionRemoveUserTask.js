"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _context = require("../../context");
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _models = require("../../models");
var _policies = require("../../policies");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DocumentSubscriptionRemoveUserTask extends _BaseTask.BaseTask {
  async perform(event) {
    const user = await _models.User.findByPk(event.userId);
    if (!user) {
      return;
    }
    const document = await _models.Document.findByPk(event.documentId, {
      userId: user.id
    });
    if ((0, _policies.can)(user, "read", document)) {
      _Logger.default.debug("task", `Skip unsubscribing user ${user.id} as they have permission to the document ${event.documentId} through other means`);
      return;
    }
    await _database.sequelize.transaction(async transaction => {
      const subscription = await _models.Subscription.findOne({
        where: {
          userId: user.id,
          documentId: event.documentId,
          event: _types.SubscriptionType.Document
        },
        transaction,
        lock: _sequelize.Transaction.LOCK.UPDATE
      });
      await subscription?.destroyWithCtx((0, _context.createContext)({
        user,
        authType: event.authType,
        ip: event.ip,
        transaction
      }));
    });
  }
}
exports.default = DocumentSubscriptionRemoveUserTask;