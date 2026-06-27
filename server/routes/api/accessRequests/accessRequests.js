"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _AccessRequest = require("../../../models/AccessRequest");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var T = _interopRequireWildcard(require("./schema"));
var _errors = require("../../../errors");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("accessRequests.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AccessRequestsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(documentId, {
    userId: user.id,
    transaction,
    rejectOnEmpty: true
  });
  if ((0, _policies.can)(user, "read", document)) {
    throw (0, _errors.InvalidRequestError)("User already has document access");
  }
  if (user.teamId !== document.teamId) {
    throw (0, _errors.NotFoundError)();
  }
  const accessRequest = await _models.AccessRequest.createWithCtx(ctx, {
    documentId: document.id,
    teamId: user.teamId,
    userId: user.id,
    status: _AccessRequest.AccessRequestStatus.Pending
  });
  ctx.body = {
    data: (0, _presenters.presentAccessRequest)(accessRequest),
    policies: (0, _presenters.presentPolicies)(user, [accessRequest])
  };
});
router.post("accessRequests.info", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AccessRequestsInfoSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    id,
    documentId
  } = ctx.input.body;
  let accessRequest = null;
  if (id) {
    accessRequest = await _models.AccessRequest.findByPk(id);
  } else if (documentId) {
    const document = await _models.Document.findByPk(documentId);
    accessRequest = document ? await _models.AccessRequest.findPendingForUser({
      documentId: document.id,
      userId: user.id
    }) : null;
  }
  if (!accessRequest) {
    throw (0, _errors.NotFoundError)("Access request not found");
  }
  (0, _policies.authorize)(user, "read", accessRequest);
  ctx.body = {
    data: (0, _presenters.presentAccessRequest)(accessRequest),
    policies: (0, _presenters.presentPolicies)(user, [accessRequest])
  };
});
router.post("accessRequests.approve", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AccessRequestsApproveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const accessRequest = await _models.AccessRequest.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.AccessRequest
    }
  });
  if (accessRequest.status !== _AccessRequest.AccessRequestStatus.Pending) {
    throw (0, _errors.InvalidRequestError)("Access request has already been responded to");
  }
  const document = await _models.Document.findByPk(accessRequest.documentId, {
    userId: user.id,
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "manageUsers", document);
  (0, _policies.authorize)(user, "read", accessRequest.user);
  const membership = await _models.UserMembership.findOne({
    where: {
      userId: accessRequest.userId,
      documentId: accessRequest.documentId
    },
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  if (!membership) {
    await _models.UserMembership.createWithCtx(ctx, {
      userId: accessRequest.userId,
      documentId: accessRequest.documentId,
      permission: permission,
      createdById: user.id
    });
  }
  await accessRequest.approve(ctx);
  ctx.body = {
    data: (0, _presenters.presentAccessRequest)(accessRequest),
    policies: (0, _presenters.presentPolicies)(user, [accessRequest])
  };
});
router.post("accessRequests.dismiss", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.AccessRequestsDismissSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const accessRequest = await _models.AccessRequest.findByPk(id, {
    rejectOnEmpty: true,
    transaction,
    lock: {
      level: transaction.LOCK.UPDATE,
      of: _models.AccessRequest
    }
  });
  const document = await _models.Document.findByPk(accessRequest.documentId, {
    userId: user.id,
    transaction,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "manageUsers", document);
  (0, _policies.authorize)(user, "read", accessRequest.user);
  if (accessRequest.status === _AccessRequest.AccessRequestStatus.Pending) {
    await accessRequest.dismiss(ctx);
  }
  ctx.body = {
    data: (0, _presenters.presentAccessRequest)(accessRequest),
    policies: (0, _presenters.presentPolicies)(user, [accessRequest])
  };
});
var _default = exports.default = router;