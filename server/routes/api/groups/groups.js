"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _constants = require("../../../../shared/constants");
var _types = require("../../../../shared/types");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _errors = require("../../../errors");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();

/** Standard include for loading ExternalGroup with its AuthenticationProvider. */
const externalGroupInclude = {
  model: _models.ExternalGroup,
  as: "externalGroups",
  required: false,
  include: [{
    model: _models.AuthenticationProvider,
    as: "authenticationProvider",
    attributes: ["id", "name", "providerId"]
  }]
};
router.post("groups.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupsListSchema), async ctx => {
  const {
    sort,
    direction,
    query,
    userId,
    externalId,
    name,
    source
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listGroups", user.team);
  let where = {
    teamId: user.teamId
  };
  if (name) {
    where = {
      ...where,
      name: {
        [_sequelize.Op.eq]: name
      }
    };
  } else if (query) {
    where = {
      ...where,
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (externalId) {
    where = {
      ...where,
      externalId
    };
  }
  if (userId) {
    const groupIds = await _models.Group.filterByMember(userId).findAll({
      attributes: ["id"]
    }).then(groups => groups.map(g => g.id));
    where = {
      ...where,
      id: {
        [_sequelize.Op.in]: groupIds
      }
    };
  }
  if (source) {
    const externalGroupWhere = {
      teamId: user.teamId,
      groupId: {
        [_sequelize.Op.ne]: null
      }
    };
    const sourceGroupIds = await _models.ExternalGroup.findAll({
      attributes: ["groupId"],
      where: externalGroupWhere,
      ...(source !== "manual" && {
        include: [{
          model: _models.AuthenticationProvider,
          as: "authenticationProvider",
          attributes: [],
          where: {
            name: source
          }
        }]
      })
    }).then(egs => egs.map(eg => eg.groupId).filter(id => id !== null));
    where = {
      ...where,
      id: {
        ...(where.id ?? {}),
        [source === "manual" ? _sequelize.Op.notIn : _sequelize.Op.in]: sourceGroupIds
      }
    };
  }
  const [groups, total] = await Promise.all([_models.Group.findAll({
    where,
    include: [{
      model: _models.GroupUser,
      as: "groupUsers",
      required: false,
      where: {
        userId: user.id
      }
    }, externalGroupInclude],
    order: [sort === "source" ? [{
      model: _models.ExternalGroup,
      as: "externalGroups"
    }, {
      model: _models.AuthenticationProvider,
      as: "authenticationProvider"
    }, "name", direction] : [sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Group.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      groups: await Promise.all(groups.map(_presenters.presentGroup)),
      // TODO: Deprecated, will remove in the future as language conflicts with GroupMembership
      groupMemberships: (await Promise.all(groups.map(group => _models.GroupUser.scope("withUser").findAll({
        where: {
          groupId: group.id
        },
        order: [["permission", "ASC"]],
        limit: _constants.MAX_AVATAR_DISPLAY
      })))).flat().filter(groupUser => groupUser.user).map(groupUser => (0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      }))
    },
    policies: (0, _presenters.presentPolicies)(user, groups)
  };
});
router.post("groups.info", (0, _authentication.default)(), (0, _validate.default)(T.GroupsInfoSchema), async ctx => {
  const {
    id,
    externalId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const include = [{
    model: _models.GroupUser,
    as: "groupUsers",
    required: false,
    where: {
      userId: user.id
    }
  }, externalGroupInclude];
  const group = id ? await _models.Group.findByPk(id, {
    include
  }) : externalId ? await _models.Group.findOne({
    include,
    where: {
      teamId: user.teamId,
      externalId
    }
  }) : null;
  (0, _policies.authorize)(user, "read", group);
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _authentication.default)(), (0, _validate.default)(T.GroupsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    name,
    externalId,
    disableMentions
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createGroup", user.team);
  const group = await _models.Group.createWithCtx(ctx, {
    name,
    externalId,
    disableMentions,
    teamId: user.teamId,
    createdById: user.id
  });
  group.groupUsers = [];
  group.externalGroups = [];
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.update", (0, _authentication.default)(), (0, _validate.default)(T.GroupsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction,
    include: [{
      model: _models.GroupUser,
      as: "groupUsers",
      required: false,
      where: {
        userId: user.id
      }
    }, externalGroupInclude],
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Group
    }
  });
  (0, _policies.authorize)(user, "update", group);
  if (group.externalGroups?.length && ctx.input.body.name !== undefined && ctx.input.body.name !== group.name) {
    throw (0, _errors.ValidationError)("The name of a group synced from an external provider cannot be changed");
  }
  await group.updateWithCtx(ctx, ctx.input.body);
  ctx.body = {
    data: await (0, _presenters.presentGroup)(group),
    policies: (0, _presenters.presentPolicies)(user, [group])
  };
});
router.post("groups.delete", (0, _authentication.default)(), (0, _validate.default)(T.GroupsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction,
    include: [externalGroupInclude],
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.Group
    }
  });
  (0, _policies.authorize)(user, "delete", group);
  await group.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("groups.deleteAll", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.GroupsDeleteAllSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    authenticationProviderId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const authenticationProvider = await _models.AuthenticationProvider.findByPk(authenticationProviderId, {
    transaction
  });
  (0, _policies.authorize)(user, "update", authenticationProvider);
  const groupIds = await _models.ExternalGroup.findAll({
    attributes: ["groupId"],
    where: {
      authenticationProviderId,
      teamId: user.teamId,
      groupId: {
        [_sequelize.Op.ne]: null
      }
    },
    transaction
  }).then(egs => egs.map(eg => eg.groupId).filter(id => id !== null));
  if (groupIds.length) {
    await _models.Group.destroy({
      where: {
        id: groupIds
      },
      transaction
    });
  }
  ctx.body = {
    success: true
  };
});
router.post("groups.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const group = await _models.Group.findByPk(id);
  (0, _policies.authorize)(user, "read", group);
  let userWhere;
  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  const groupUserWhere = {
    groupId: id
  };
  if (permission) {
    groupUserWhere.permission = permission;
  }
  const options = {
    where: groupUserWhere,
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  };
  const [total, groupUsers] = await Promise.all([_models.GroupUser.count(options), _models.GroupUser.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      groupMemberships: groupUsers.map(groupUser => (0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      })),
      users: groupUsers.map(groupUser => (0, _presenters.presentUser)(groupUser.user))
    }
  };
});
router.post("groups.add_user", (0, _authentication.default)(), (0, _validate.default)(T.GroupsAddUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    userId,
    permission
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    transaction
  } = ctx.state;
  const user = await _models.User.findByPk(userId, {
    transaction
  });
  (0, _policies.authorize)(actor, "read", user);

  // Load group with group users for authorization
  const group = await _models.Group.findByPk(id, {
    transaction,
    include: [{
      model: _models.GroupUser,
      as: "groupUsers",
      required: false,
      where: {
        userId: actor.id
      }
    }, externalGroupInclude]
  });
  (0, _policies.authorize)(actor, "update", group);
  if (group.externalGroups?.length) {
    throw (0, _errors.ValidationError)("This group is managed by an external provider and its membership cannot be modified");
  }
  const userPermission = permission;
  const [groupUser] = await _models.GroupUser.findOrCreateWithCtx(ctx, {
    where: {
      groupId: group.id,
      userId: user.id
    },
    defaults: {
      createdById: actor.id,
      permission: userPermission || _types.GroupPermission.Member
    }
  }, {
    name: "add_user"
  });

  // If the user already exists in the group, update the permission if provided
  if (userPermission !== undefined && groupUser.permission !== userPermission) {
    await groupUser.updateWithCtx(ctx, {
      permission: userPermission
    });
  }
  groupUser.user = user;
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      groupMemberships: [(0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      })],
      groups: [await (0, _presenters.presentGroup)(group)]
    }
  };
});
router.post("groups.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.GroupsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    userId
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    transaction
  } = ctx.state;
  const group = await _models.Group.findByPk(id, {
    transaction,
    include: [{
      model: _models.GroupUser,
      as: "groupUsers",
      required: false,
      where: {
        userId: actor.id
      }
    }, externalGroupInclude]
  });
  (0, _policies.authorize)(actor, "update", group);
  if (group.externalGroups?.length) {
    throw (0, _errors.ValidationError)("This group is managed by an external provider and its membership cannot be modified");
  }
  const user = await _models.User.findByPk(userId, {
    transaction
  });
  (0, _policies.authorize)(actor, "read", user);
  const groupUser = await _models.GroupUser.unscoped().findOne({
    where: {
      groupId: group.id,
      userId: user.id
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  await groupUser?.destroyWithCtx(ctx, {
    name: "remove_user"
  });
  ctx.body = {
    data: {
      groups: [await (0, _presenters.presentGroup)(group)]
    }
  };
});
router.post("groups.update_user", (0, _authentication.default)(), (0, _validate.default)(T.GroupsUpdateUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    userId,
    permission
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const {
    transaction
  } = ctx.state;

  // Load group with group users for authorization
  const group = await _models.Group.findByPk(id, {
    transaction,
    include: [{
      model: _models.GroupUser,
      as: "groupUsers",
      required: false,
      where: {
        userId: actor.id
      }
    }, externalGroupInclude]
  });
  (0, _policies.authorize)(actor, "update", group);
  if (group.externalGroups?.length) {
    throw (0, _errors.ValidationError)("This group is managed by an external provider and its membership cannot be modified");
  }
  const user = await _models.User.findByPk(userId, {
    transaction
  });
  (0, _policies.authorize)(actor, "read", user);
  const groupUser = await _models.GroupUser.unscoped().findOne({
    where: {
      groupId: group.id,
      userId: user.id
    },
    transaction,
    rejectOnEmpty: true,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.GroupUser
    }
  });
  await groupUser.updateWithCtx(ctx, {
    permission
  });
  groupUser.user = user;
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      groupMemberships: [(0, _presenters.presentGroupUser)(groupUser, {
        includeUser: true
      })],
      groups: [await (0, _presenters.presentGroup)(group)]
    }
  };
});
var _default = exports.default = router;