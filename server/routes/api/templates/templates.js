"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("templates.create", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.TemplatesCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    title,
    data,
    icon,
    color,
    collectionId
  } = ctx.input.body;
  const editorVersion = ctx.headers["x-editor-version"];
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  let collection;
  if (collectionId) {
    collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "createTemplate", collection);
  } else {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  let template = await _models.Template.createWithCtx(ctx, {
    id,
    title,
    icon,
    color,
    content: data,
    collectionId: collection?.id,
    publishedAt: new Date(),
    createdById: user.id,
    lastModifiedById: user.id,
    teamId: user.teamId,
    editorVersion
  });
  template = await _models.Template.findByPk(template.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentTemplate)(template),
    policies: (0, _presenters.presentPolicies)(user, [template])
  };
});
router.post("templates.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.TemplatesListSchema), async ctx => {
  const {
    sort,
    direction,
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId,
    [_sequelize.Op.and]: [{
      deletedAt: {
        [_sequelize.Op.eq]: null
      }
    }]
  };

  // if a specific collection is passed then we need to check auth to view it
  if (collectionId) {
    where[_sequelize.Op.and].push({
      collectionId
    });
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", collection);
  } else {
    where[_sequelize.Op.and].push({
      [_sequelize.Op.or]: [{
        collectionId: {
          [_sequelize.Op.eq]: null
        }
      }, {
        collectionId: await user.collectionIds()
      }]
    });
  }
  const [templates, total] = await Promise.all([_models.Template.scope(["defaultScope", {
    method: ["withMembership", user.id]
  }]).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Template.count({
    where
  })]);
  const data = templates.map(template => (0, _presenters.presentTemplate)(template));
  const policies = (0, _presenters.presentPolicies)(user, templates);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data,
    policies
  };
});
router.post("templates.info", (0, _authentication.default)(), (0, _validate.default)(T.TemplatesInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const template = await _models.Template.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", template);
  ctx.body = {
    data: (0, _presenters.presentTemplate)(template),
    policies: (0, _presenters.presentPolicies)(user, [template])
  };
});
router.post("templates.delete", (0, _authentication.default)(), (0, _validate.default)(T.TemplatesDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const template = await _models.Template.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "delete", template);
  await template.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("templates.restore", (0, _authentication.default)(), (0, _validate.default)(T.TemplatesInfoSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const template = await _models.Template.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction,
    paranoid: false
  });
  (0, _policies.authorize)(user, "restore", template);
  await template.restoreWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentTemplate)(template),
    policies: (0, _presenters.presentPolicies)(user, [template])
  };
});
router.post("templates.duplicate", (0, _authentication.default)(), (0, _validate.default)(T.TemplatesDuplicateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    title,
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const original = await _models.Template.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "duplicate", original);
  const targetCollectionId = collectionId === undefined ? original.collectionId : collectionId;
  if (targetCollectionId) {
    const collection = await _models.Collection.findByPk(targetCollectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "createTemplate", collection);
  } else {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  let template = await _models.Template.createWithCtx(ctx, {
    title: title ?? original.title,
    createdById: user.id,
    lastModifiedById: user.id,
    teamId: user.teamId,
    collectionId: targetCollectionId,
    publishedAt: new Date(),
    content: original.content,
    icon: original.icon,
    color: original.color,
    fullWidth: original.fullWidth
  });

  // reload to get all of the data needed to present (user, collection etc)
  template = await _models.Template.findByPk(template.id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentTemplate)(template),
    policies: (0, _presenters.presentPolicies)(user, [template])
  };
});
router.post("templates.update", (0, _authentication.default)(), (0, _validate.default)(T.TemplatesUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    data,
    ...updatedFields
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const template = await _models.Template.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "update", template);
  if (updatedFields.collectionId !== undefined) {
    if (updatedFields.collectionId) {
      const collection = await _models.Collection.findByPk(updatedFields.collectionId, {
        userId: user.id,
        transaction
      });
      (0, _policies.authorize)(user, "createTemplate", collection);
    } else {
      (0, _policies.authorize)(user, "createTemplate", user.team);
    }
  }
  if (data) {
    template.content = data;
  }
  await template.updateWithCtx(ctx, updatedFields);
  ctx.body = {
    data: (0, _presenters.presentTemplate)(template),
    policies: (0, _presenters.presentPolicies)(user, [template])
  };
});
var _default = exports.default = router;