"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _documentMover = _interopRequireDefault(require("../../commands/documentMover"));
var _models = require("../../models");
var _database = require("../../storage/database");
var _BaseTask = require("./base/BaseTask");
var _context = require("../../context");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class DetachDraftsFromCollectionTask extends _BaseTask.BaseTask {
  async perform(props) {
    const [collection, actor] = await Promise.all([_models.Collection.findByPk(props.collectionId, {
      paranoid: false
    }), _models.User.findByPk(props.actorId)]);
    if (!actor || !collection || !(collection.deletedAt || collection.archivedAt)) {
      return;
    }
    const documents = await _models.Document.scope("withDrafts").findAll({
      where: {
        collectionId: props.collectionId,
        publishedAt: {
          [_sequelize.Op.is]: null
        }
      },
      paranoid: false
    });
    return _database.sequelize.transaction(async transaction => {
      const ctx = (0, _context.createContext)({
        user: actor,
        ip: props.ip,
        transaction
      });
      for (const document of documents) {
        await (0, _documentMover.default)(ctx, {
          document,
          collectionId: null
        });
      }
    });
  }
}
exports.default = DetachDraftsFromCollectionTask;