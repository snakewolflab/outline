"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("relationships.info", (0, _authentication.default)(), (0, _validate.default)(T.RelationshipsInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const relationship = await _models.Relationship.findByPk(id, {
    rejectOnEmpty: true
  });
  const document = await _models.Document.findByPk(relationship.documentId, {
    userId: user.id,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", document);
  const reverseDocument = await _models.Document.findByPk(relationship.reverseDocumentId, {
    userId: user.id,
    rejectOnEmpty: true
  });
  (0, _policies.authorize)(user, "read", reverseDocument);
  const documents = [document, reverseDocument];
  ctx.body = {
    data: {
      relationship: (0, _presenters.presentRelationship)(relationship),
      documents: await (0, _presenters.presentDocuments)(ctx, documents)
    },
    policies: (0, _presenters.presentPolicies)(user, documents)
  };
});
router.post("relationships.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.RelationshipsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const where = ctx.input.body || {};
  const relationships = await _models.Relationship.findAll({
    where,
    order: [["createdAt", "DESC"]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const documents = await _models.Document.findByIds(relationships.flatMap(relationship => where.reverseDocumentId ? relationship.documentId : relationship.reverseDocumentId), {
    userId: user.id
  });
  const documentIds = new Set(documents.map(d => d.id));
  const filteredRelationships = relationships.filter(relationship => documentIds.has(where.reverseDocumentId ? relationship.documentId : relationship.reverseDocumentId));
  ctx.body = {
    pagination: ctx.state.pagination,
    data: {
      relationships: filteredRelationships.map(_presenters.presentRelationship),
      documents: await (0, _presenters.presentDocuments)(ctx, documents)
    },
    policies: (0, _presenters.presentPolicies)(user, [...documents, ...filteredRelationships])
  };
});
var _default = exports.default = router;