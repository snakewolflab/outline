"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _nodeCrypto = require("node:crypto");
var _compat = require("es-toolkit/compat");
var _types = require("../../../../shared/types");
var _validations = require("../../../../shared/validations");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _Import = _interopRequireDefault(require("../../../models/Import"));
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("imports.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.ImportsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const body = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createImport", user.team);
  if (body.service === _types.IntegrationService.Markdown || body.service === _types.IntegrationService.JSON) {
    const attachment = await _models.Attachment.findByPk(body.attachmentId, {
      rejectOnEmpty: true
    });
    (0, _policies.authorize)(user, "read", attachment);
    const importModel = await _Import.default.createWithCtx(ctx, {
      name: (0, _compat.truncate)(attachment.name, {
        length: _validations.ImportValidation.maxNameLength
      }),
      service: body.service,
      state: _types.ImportState.Created,
      input: [{
        externalId: (0, _nodeCrypto.randomUUID)(),
        permission: body.permission
      }],
      scratch: {
        storageKey: attachment.key
      },
      integrationId: null,
      createdById: user.id,
      teamId: user.teamId
    });
    importModel.createdBy = user;
    ctx.body = {
      data: (0, _presenters.presentImport)(importModel),
      policies: (0, _presenters.presentPolicies)(user, [importModel])
    };
    return;
  }
  const integration = await _models.Integration.findByPk(body.integrationId, {
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", integration);
  const name = integration.settings.externalWorkspace.name;
  const importModel = await _Import.default.createWithCtx(ctx, {
    name: (0, _compat.truncate)(name, {
      length: _validations.ImportValidation.maxNameLength
    }),
    service: body.service,
    state: _types.ImportState.Created,
    input: body.input,
    integrationId: body.integrationId,
    createdById: user.id,
    teamId: user.teamId
  });
  importModel.createdBy = user;
  ctx.body = {
    data: (0, _presenters.presentImport)(importModel),
    policies: (0, _presenters.presentPolicies)(user, [importModel])
  };
});
router.post("imports.list", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _pagination.default)(), (0, _validate.default)(T.ImportsListSchema), async ctx => {
  const {
    service,
    sort,
    direction
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listImports", user.team);

  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  const where = {
    teamId: user.teamId
  };
  if (service) {
    where.service = service;
  }
  const [imports, total] = await Promise.all([
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  _Import.default.findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }),
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  _Import.default.count({
    where
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: imports.map(_presenters.presentImport),
    policies: (0, _presenters.presentPolicies)(user, imports)
  };
});
router.post("imports.info", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.ImportsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const importModel = await _Import.default.findByPk(id, {
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", importModel);
  ctx.body = {
    data: (0, _presenters.presentImport)(importModel),
    policies: (0, _presenters.presentPolicies)(user, [importModel])
  };
});
router.post("imports.delete", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.ImportsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const importModel = await _Import.default.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "delete", importModel);
  await importModel.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("imports.cancel", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.ImportsCancelSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  let importModel = await _Import.default.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(user, "cancel", importModel);
  importModel.state = _types.ImportState.Canceled;
  importModel = await importModel.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentImport)(importModel),
    policies: (0, _presenters.presentPolicies)(user, [importModel])
  };
});
var _default = exports.default = router;