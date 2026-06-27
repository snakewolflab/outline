"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _EventHelper = require("../../../../shared/utils/EventHelper");
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
router.post("events.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.EventsListSchema), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const {
    name,
    events,
    auditLog,
    actorId,
    documentId,
    collectionId,
    sort,
    direction
  } = ctx.input.body;
  let where = {
    teamId: user.teamId,
    actorId: {
      [_sequelize.Op.ne]: null
    }
  };
  if (auditLog) {
    (0, _policies.authorize)(user, "audit", user.team);
    where.name = events ? (0, _compat.intersection)(_EventHelper.EventHelper.AUDIT_EVENTS, events) : _EventHelper.EventHelper.AUDIT_EVENTS;
  } else {
    where.name = events ? (0, _compat.intersection)(_EventHelper.EventHelper.ACTIVITY_EVENTS, events) : _EventHelper.EventHelper.ACTIVITY_EVENTS;
  }
  if (name && where.name.includes(name)) {
    where.name = name;
  }
  if (actorId) {
    const actor = await _models.User.findByPk(actorId);
    (0, _policies.authorize)(user, "readDetails", actor);
    where = {
      ...where,
      actorId
    };
  }

  // Non-admins must specify either documentId or collectionId to use the read policy
  if (!user.isAdmin && !documentId && !collectionId) {
    (0, _policies.authorize)(user, "listAllEvents", user.team);
  }
  if (documentId) {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", document);
    where = {
      ...where,
      documentId
    };
  }
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", collection);
    where = {
      ...where,
      collectionId
    };
  }
  const loadedEvents = await _models.Event.findAll({
    where,
    order: [[sort, direction]],
    include: [{
      model: _models.User,
      as: "actor",
      paranoid: false
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  ctx.body = {
    pagination: ctx.state.pagination,
    data: loadedEvents.map(event => (0, _presenters.presentEvent)(event, auditLog))
  };
});
var _default = exports.default = router;