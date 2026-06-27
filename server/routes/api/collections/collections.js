"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _nodeCrypto = require("node:crypto");
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _types = require("../../../../shared/types");
var _validations = require("../../../../shared/validations");
var _collectionExporter = _interopRequireDefault(require("../../../commands/collectionExporter"));
var _teamUpdater = _interopRequireDefault(require("../../../commands/teamUpdater"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _indexing = require("../../../utils/indexing");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
var _errors = require("../../../errors");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("collections.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.CollectionsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    name,
    color,
    description,
    data,
    permission,
    sharing,
    icon,
    sort,
    index,
    commenting,
    templateManagement
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createCollection", user.team);
  const collection = _models.Collection.build({
    name,
    content: data,
    description: data ? undefined : description,
    icon,
    color,
    teamId: user.teamId,
    createdById: user.id,
    permission,
    sharing,
    sort,
    index,
    commenting,
    templateManagement
  });
  await collection.saveWithCtx(ctx);

  // we must reload the collection to get memberships for policy presenter
  const reloaded = await _models.Collection.findByPk(collection.id, {
    userId: user.id,
    transaction,
    rejectOnEmpty: true
  });
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, reloaded),
    policies: (0, _presenters.presentPolicies)(user, [reloaded])
  };
});
router.post("collections.info", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    includeArchivedBy: true,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", collection);
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.documents", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsDocumentsSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "readDocument", collection);
  const documentStructure = await collection.getCachedDocumentStructure();
  ctx.body = {
    data: documentStructure || []
  };
});
router.post("collections.import", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.CollectionsImportSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    attachmentId,
    permission,
    format
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "importCollection", user.team);
  const attachment = await _models.Attachment.findByPk(attachmentId, {
    transaction
  });
  (0, _policies.authorize)(user, "read", attachment);
  const service = format === _types.FileOperationFormat.MarkdownZip ? _types.IntegrationService.Markdown : _types.IntegrationService.JSON;
  await _models.Import.createWithCtx(ctx, {
    name: (0, _compat.truncate)(attachment.name, {
      length: _validations.ImportValidation.maxNameLength
    }),
    service,
    state: _types.ImportState.Created,
    input: [{
      externalId: (0, _nodeCrypto.randomUUID)(),
      permission: permission ?? undefined
    }],
    scratch: {
      storageKey: attachment.key
    },
    integrationId: null,
    createdById: user.id,
    teamId: user.teamId
  });
  ctx.body = {
    success: true
  };
});
router.post("collections.add_group", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsAddGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    groupId,
    permission
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const [collection, group] = await Promise.all([_models.Collection.findByPk(id, {
    userId: user.id,
    transaction
  }), _models.Group.findByPk(groupId, {
    transaction
  })]);
  (0, _policies.authorize)(user, "update", collection);
  (0, _policies.authorize)(user, "read", group);
  let membership = await _models.GroupMembership.findOne({
    where: {
      collectionId: id,
      groupId
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (membership) {
    membership.permission = permission;
    await membership.save(ctx.context);
  } else {
    membership = await _models.GroupMembership.create({
      collectionId: id,
      groupId,
      permission,
      createdById: user.id
    }, ctx.context);
  }
  const groupMemberships = [(0, _presenters.presentGroupMembership)(membership)];
  ctx.body = {
    data: {
      groupMemberships
    }
  };
});
router.post("collections.remove_group", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRemoveGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    groupId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const [collection, group] = await Promise.all([_models.Collection.findByPk(id, {
    userId: user.id,
    transaction
  }), _models.Group.findByPk(groupId, {
    transaction
  })]);
  (0, _policies.authorize)(user, "update", collection);
  (0, _policies.authorize)(user, "read", group);
  const [membership] = await collection.$get("groupMemberships", {
    where: {
      groupId
    },
    transaction
  });
  if (!membership) {
    ctx.throw((0, _errors.InvalidRequestError)("This Group is not a part of the collection"));
  }
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("collections.group_memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.CollectionsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", collection);
  let where = {
    collectionId: id
  };
  let groupWhere;
  if (query) {
    groupWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.Group,
      as: "group",
      where: groupWhere,
      required: true
    }]
  };
  const [total, memberships] = await Promise.all([_models.GroupMembership.count(options), _models.GroupMembership.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  })]);
  const groupMemberships = memberships.map(_presenters.presentGroupMembership);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: {
      groupMemberships,
      groups: await Promise.all(memberships.map(membership => (0, _presenters.presentGroup)(membership.group)))
    }
  };
});
router.post("collections.add_user", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _validate.default)(T.CollectionsAddUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId,
    permission
  } = ctx.input.body;
  const [collection, user] = await Promise.all([_models.Collection.findByPk(id, {
    userId: actor.id,
    transaction
  }), _models.User.findByPk(userId, {
    transaction
  })]);
  (0, _policies.authorize)(actor, "update", collection);
  (0, _policies.authorize)(actor, "read", user);
  let membership = await _models.UserMembership.findOne({
    where: {
      collectionId: id,
      userId
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (membership) {
    membership.permission = permission || user.defaultCollectionPermission;
    await membership.save(ctx.context);
  } else {
    membership = await _models.UserMembership.create({
      collectionId: id,
      userId,
      permission: permission || user.defaultCollectionPermission,
      createdById: actor.id
    }, ctx.context);
  }
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      memberships: [(0, _presenters.presentMembership)(membership)]
    }
  };
});
router.post("collections.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId
  } = ctx.input.body;
  const [collection, user] = await Promise.all([_models.Collection.findByPk(id, {
    userId: actor.id,
    transaction
  }), _models.User.findByPk(userId, {
    transaction
  })]);
  (0, _policies.authorize)(actor, "update", collection);
  (0, _policies.authorize)(actor, "read", user);
  const [membership] = await collection.$get("memberships", {
    where: {
      userId
    },
    transaction
  });
  if (!membership) {
    ctx.throw((0, _errors.InvalidRequestError)("User is not a collection member"));
  }
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("collections.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.CollectionsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", collection);
  let where = {
    collectionId: id
  };
  let userWhere;
  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  };
  const [total, memberships] = await Promise.all([_models.UserMembership.count(options), _models.UserMembership.findAll({
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
      memberships: memberships.map(_presenters.presentMembership),
      users: memberships.map(membership => (0, _presenters.presentUser)(membership.user))
    }
  };
});
router.post("collections.export", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FiftyPerHour), (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _validate.default)(T.CollectionsExportSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    format,
    includeAttachments
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    team
  } = user;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "export", collection);
  const fileOperation = await (0, _collectionExporter.default)({
    collection,
    team,
    user,
    format,
    includeAttachments,
    ctx
  });
  ctx.body = {
    success: true,
    data: {
      fileOperation: (0, _presenters.presentFileOperation)(fileOperation)
    }
  };
});
router.post("collections.export_all", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.CollectionsExportAllSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    format,
    includeAttachments,
    includePrivate
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const team = await _models.Team.findByPk(user.teamId, {
    transaction
  });
  (0, _policies.authorize)(user, "createExport", team);
  const fileOperation = await (0, _collectionExporter.default)({
    user,
    team,
    format,
    includeAttachments,
    includePrivate,
    ctx
  });
  ctx.body = {
    success: true,
    data: {
      fileOperation: (0, _presenters.presentFileOperation)(fileOperation)
    }
  };
});
router.post("collections.update", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    name,
    description,
    data,
    icon,
    permission,
    color,
    sort,
    sharing,
    commenting,
    templateManagement
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "update", collection);

  // we're making this collection have no default access, ensure that the
  // current user has an admin membership so that at least they can manage it.
  if (permission !== _types.CollectionPermission.ReadWrite && collection.permission === _types.CollectionPermission.ReadWrite) {
    let membership = await _models.UserMembership.findOne({
      where: {
        collectionId: collection.id,
        userId: user.id
      },
      transaction
    });
    if (!membership) {
      await _models.UserMembership.create({
        collectionId: collection.id,
        userId: user.id,
        permission: _types.CollectionPermission.Admin,
        createdById: user.id
      }, {
        transaction,
        hooks: false
      });
    }
  }
  let privacyChanged = false;
  let sharingChanged = false;
  if (name !== undefined) {
    collection.name = name.trim();
  }
  if (description !== undefined) {
    collection.description = description;
  }
  if (data !== undefined) {
    collection.content = data;
  }
  if (icon !== undefined) {
    collection.icon = icon;
  }
  if (color !== undefined) {
    collection.color = color;
  }
  if (permission !== undefined) {
    privacyChanged = permission !== collection.permission;
    collection.permission = permission ? permission : null;
  }
  if (sharing !== undefined) {
    sharingChanged = sharing !== collection.sharing;
    collection.sharing = sharing;
  }
  if (sort !== undefined) {
    collection.sort = sort;
  }
  if (commenting !== undefined) {
    collection.commenting = commenting;
  }
  if (templateManagement !== undefined) {
    collection.templateManagement = templateManagement;
  }
  await collection.saveWithCtx(ctx);

  // must reload to update collection membership for correct policy calculation
  // if the privacy level has changed. Otherwise skip this query for speed.
  if (privacyChanged || sharingChanged) {
    await collection.reload({
      transaction
    });
    const team = await _models.Team.findByPk(user.teamId, {
      transaction,
      rejectOnEmpty: true
    });
    if (collection.permission === null && team?.defaultCollectionId === collection.id) {
      await (0, _teamUpdater.default)(ctx, {
        params: {
          defaultCollectionId: null
        },
        user,
        team
      });
    }
  }
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.list", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsListSchema), (0, _pagination.default)(), (0, _transaction.transaction)(), async ctx => {
  const {
    includeListOnly,
    query,
    statusFilter
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const collectionIds = await user.collectionIds({
    transaction
  });
  const where = {
    teamId: user.teamId,
    [_sequelize.Op.and]: [{
      deletedAt: {
        [_sequelize.Op.eq]: null
      }
    }]
  };
  if (!statusFilter) {
    where[_sequelize.Op.and].push({
      archivedAt: {
        [_sequelize.Op.eq]: null
      }
    });
  }
  if (!includeListOnly || !user.isAdmin) {
    where[_sequelize.Op.and].push({
      id: collectionIds
    });
  }
  if (query) {
    where[_sequelize.Op.and].push(_sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`));
  }
  const statusQuery = [];
  if (statusFilter?.includes(_types.CollectionStatusFilter.Archived)) {
    statusQuery.push({
      archivedAt: {
        [_sequelize.Op.ne]: null
      }
    });
  }
  if (statusQuery.length) {
    where[_sequelize.Op.and].push({
      [_sequelize.Op.or]: statusQuery
    });
  }
  const replacements = {
    query: `%${query}%`
  };
  const [collections, total] = await Promise.all([_models.Collection.scope(statusFilter?.includes(_types.CollectionStatusFilter.Archived) ? [{
    method: ["withMembership", user.id]
  }, "withArchivedBy"] : {
    method: ["withMembership", user.id]
  }).findAll({
    where,
    replacements,
    order: [_sequelize.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    transaction
  }), _models.Collection.count({
    where,
    // @ts-expect-error Types are incorrect for count
    replacements,
    transaction
  })]);
  const nullIndex = collections.findIndex(collection => collection.index === null);
  if (nullIndex !== -1) {
    const indexedCollections = await (0, _indexing.collectionIndexing)(user.teamId, {
      transaction
    });
    collections.forEach(collection => {
      collection.index = indexedCollections[collection.id];
    });
  }
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: await Promise.all(collections.map(collection => (0, _presenters.presentCollection)(ctx, collection))),
    policies: (0, _presenters.presentPolicies)(user, collections)
  };
});
router.post("collections.delete", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "delete", collection);
  await collection.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("collections.archive", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsArchiveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "archive", collection);
  await collection.archiveWithCtx(ctx);
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.restore", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsRestoreSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let collection = await _models.Collection.findByPk(id, {
    userId: user.id,
    includeDocumentStructure: true,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "restore", collection);
  await _models.Document.update({
    lastModifiedById: user.id,
    archivedAt: null
  }, {
    where: {
      collectionId: collection.id,
      teamId: user.teamId,
      archivedAt: collection.archivedAt
    },
    transaction
  });
  collection.archivedAt = null;
  collection.archivedById = null;
  collection = await collection.saveWithCtx(ctx, undefined, {
    name: "restore"
  });
  ctx.body = {
    data: await (0, _presenters.presentCollection)(ctx, collection),
    policies: (0, _presenters.presentPolicies)(user, [collection])
  };
});
router.post("collections.move", (0, _authentication.default)(), (0, _validate.default)(T.CollectionsMoveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    index
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  let collection = await _models.Collection.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "move", collection);
  collection = await collection.updateWithCtx(ctx, {
    index
  }, {
    name: "move"
  });
  ctx.body = {
    success: true,
    data: {
      index: collection.index
    }
  };
});
var _default = exports.default = router;