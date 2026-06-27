"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Synchronizes a user's external group memberships with internal Outline
 * groups. Upserts ExternalGroup records, auto-creates Group records when
 * needed, and manages GroupUser memberships.
 *
 * @param ctx - API context with transaction.
 * @param props - sync parameters.
 * @returns result summary.
 */
async function groupsSyncer(ctx, _ref) {
  let {
    user,
    team,
    authenticationProvider,
    externalGroups
  } = _ref;
  const {
    transaction
  } = ctx.state;
  const result = {
    groupsCreated: 0,
    membershipsAdded: 0,
    membershipsRemoved: 0
  };
  const now = new Date();
  const externalGroupIds = new Set();
  for (const eg of externalGroups) {
    externalGroupIds.add(eg.id);

    // Upsert ExternalGroup record
    const [externalGroup, created] = await _models.ExternalGroup.findOrCreate({
      where: {
        authenticationProviderId: authenticationProvider.id,
        externalId: eg.id
      },
      defaults: {
        name: eg.name,
        teamId: team.id,
        lastSyncedAt: now
      },
      transaction
    });

    // Update name if changed, and always update lastSyncedAt
    if (!created) {
      const updates = {
        lastSyncedAt: now
      };
      if (externalGroup.name !== eg.name) {
        updates.name = eg.name;

        // Also update the linked internal Group name
        if (externalGroup.groupId) {
          const group = await _models.Group.findByPk(externalGroup.groupId, {
            transaction
          });
          if (group) {
            await group.update({
              name: eg.name
            }, {
              transaction
            });
          }
        }
      }
      await externalGroup.update(updates, {
        transaction
      });
    }

    // Auto-create internal Group if one doesn't exist yet
    if (!externalGroup.groupId) {
      const group = await _models.Group.createWithCtx(ctx, {
        name: eg.name,
        teamId: team.id,
        createdById: user.id
      });
      await externalGroup.update({
        groupId: group.id
      }, {
        transaction
      });
      externalGroup.groupId = group.id;
      result.groupsCreated++;
    }

    // Add user to group if not already a member
    const [, membershipCreated] = await _models.GroupUser.findOrCreateWithCtx(ctx, {
      where: {
        groupId: externalGroup.groupId,
        userId: user.id
      },
      defaults: {
        createdById: user.id
      }
    });
    if (membershipCreated) {
      result.membershipsAdded++;
    }
  }

  // Remove user from synced groups they are no longer a member of.
  // Scope query to groups the user is actually a member of to avoid
  // touching unrelated external group records.
  const staleWhere = {
    authenticationProviderId: authenticationProvider.id,
    teamId: team.id,
    groupId: {
      [_sequelize.Op.ne]: null
    }
  };
  if (externalGroupIds.size > 0) {
    staleWhere.externalId = {
      [_sequelize.Op.notIn]: [...externalGroupIds]
    };
  }
  const staleExternalGroups = await _models.ExternalGroup.findAll({
    where: staleWhere,
    include: [{
      model: _models.Group,
      as: "group",
      required: true,
      include: [{
        model: _models.GroupUser,
        as: "groupUsers",
        required: true,
        where: {
          userId: user.id
        }
      }]
    }],
    transaction
  });
  for (const stale of staleExternalGroups) {
    const membership = stale.group?.groupUsers?.[0];
    if (membership) {
      await membership.destroyWithCtx(ctx);
      result.membershipsRemoved++;
    }
  }
  _Logger.default.info("commands", `Group sync completed for user ${user.id}: ${result.groupsCreated} groups created, ${result.membershipsAdded} added, ${result.membershipsRemoved} removed`);
  return result;
}
var _default = exports.default = groupsSyncer;