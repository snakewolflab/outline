"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _models = require("../models");
var _database = require("../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Permanently deletes a team and all related data from the database. Note that this does not happen
 * in a single transaction due to the potential size of such a transaction, so it is possible for
 * the operation to be interrupted and leave partial data. In which case it can be safely re-run.
 *
 * @param team - The team to delete.
 */
async function teamPermanentDeleter(team) {
  if (!team.deletedAt) {
    throw new Error(`Cannot permanently delete ${team.id} team. Please delete it and try again.`);
  }
  _Logger.default.info("commands", `Permanently destroying team ${team.name} (${team.id})`);
  const teamId = team.id;

  // Attachments are destroyed as individual instances (rather than a bulk
  // delete) so the BeforeDestroy hook runs and removes the associated file from
  // storage. We cannot use findAllInBatches with an advancing offset here –
  // deleting a batch shifts the remaining rows backwards, so advancing the
  // offset would skip records and leave attachments that still reference the
  // team, causing a foreign key violation when the team itself is destroyed.
  // Instead we repeatedly fetch and delete the first batch until none remain.
  let attachments;
  do {
    attachments = await _models.Attachment.findAll({
      where: {
        teamId
      },
      limit: 100
    });
    if (attachments.length > 0) {
      await _database.sequelize.transaction(async transaction => {
        _Logger.default.info("commands", `Deleting ${attachments.length} attachments…`);
        await Promise.all(attachments.map(attachment => attachment.destroy({
          transaction
        })));
      });
    }
  } while (attachments.length > 0);

  // Destroy user-relation models
  await _models.User.findAllInBatches({
    attributes: ["id"],
    where: {
      teamId
    },
    batchLimit: 100
  }, async users => {
    await _database.sequelize.transaction(async transaction => {
      const userIds = users.map(user => user.id);
      await _models.UserAuthentication.destroy({
        where: {
          userId: userIds
        },
        force: true,
        transaction
      });
      await _models.ApiKey.destroy({
        where: {
          userId: userIds
        },
        force: true,
        transaction
      });
      await _models.Event.destroy({
        where: {
          teamId,
          actorId: userIds
        },
        force: true,
        transaction
      });
    });
  });

  // Destory team-relation models
  await _database.sequelize.transaction(async transaction => {
    await _models.AuthenticationProvider.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    // events must be first due to db constraints
    await _models.Event.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Collection.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Document.unscoped().destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.FileOperation.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Group.unscoped().destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Import.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Integration.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.IntegrationAuthentication.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.SearchQuery.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await _models.Share.destroy({
      where: {
        teamId
      },
      force: true,
      transaction
    });
    await team.destroy({
      force: true,
      transaction
    });
    await _models.Event.create({
      name: "teams.destroy",
      modelId: teamId
    }, {
      transaction
    });
  });
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "teamPermanentDeleter"
})(teamPermanentDeleter);