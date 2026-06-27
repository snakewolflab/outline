"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _presenters = require("../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("groupMemberships.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.GroupMembershipsListSchema), async ctx => {
  const {
    groupId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const userId = user.id;
  const {
    count,
    rows: memberships
  } = await _models.GroupMembership.findAndCountAll({
    distinct: true,
    col: "id",
    where: {
      documentId: {
        [_sequelize.Op.ne]: null
      },
      sourceId: {
        [_sequelize.Op.eq]: null
      }
    },
    include: [{
      association: "group",
      required: true,
      where: groupId ? {
        id: groupId
      } : undefined,
      include: [{
        association: "groupUsers",
        required: true,
        where: {
          userId
        }
      }]
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documentIds = memberships.map(p => p.documentId).filter(Boolean);
  const documents = await _models.Document.withMembershipScope(userId, {
    includeDrafts: true
  }).findAll({
    where: {
      id: documentIds
    }
  });
  const groups = (0, _compat.uniqBy)(memberships.map(membership => membership.group), "id");
  const policies = (0, _presenters.presentPolicies)(user, [...documents, ...memberships, ...groups]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total: count
    },
    data: {
      groups: await Promise.all(groups.map(_presenters.presentGroup)),
      groupMemberships: memberships.map(_presenters.presentGroupMembership),
      documents: await (0, _presenters.presentDocuments)(ctx, documents)
    },
    policies
  };
});
var _default = exports.default = router;