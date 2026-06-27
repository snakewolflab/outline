"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _presenters = require("../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("searches.list", (0, _authentication.default)(), (0, _validate.default)(T.SearchesListSchema), (0, _pagination.default)(), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const source = ctx.input.body?.source;
  const searches = await _models.SearchQuery.findAll({
    where: {
      ...(source ? {
        source
      } : {}),
      teamId: user.teamId,
      userId: user.id
    },
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: searches.map(_presenters.presentSearchQuery)
  };
});
router.post("searches.update", (0, _authentication.default)(), (0, _validate.default)(T.SearchesUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    score
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const search = await _models.SearchQuery.findOne({
    where: {
      id,
      userId: user.id
    },
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true,
    transaction
  });
  search.score = score;
  await search.save({
    transaction
  });
  ctx.body = {
    data: (0, _presenters.presentSearchQuery)(search)
  };
});
router.post("searches.delete", (0, _authentication.default)(), (0, _validate.default)(T.SearchesDeleteSchema), async ctx => {
  const {
    id,
    query
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  await _models.SearchQuery.destroy({
    where: {
      ...(id ? {
        id
      } : {
        query
      }),
      userId: user.id
    }
  });
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;