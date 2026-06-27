"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _random = require("../../../../shared/random");
var _types = require("../../../../shared/types");
var _userInviter = _interopRequireDefault(require("../../../commands/userInviter"));
var _env = _interopRequireDefault(require("../../../env"));
var _Logger = _interopRequireDefault(require("../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _notification = _interopRequireDefault(require("../../../presenters/notification"));
var _presenters = require("../../../presenters");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
function dev() {
  return async function checkDevelopmentMiddleware(ctx, next) {
    if (_env.default.ENVIRONMENT !== "development") {
      throw new Error("Attempted to access development route in production");
    }
    return next();
  };
}
router.post("developer.create_test_users", dev(), (0, _authentication.default)(), (0, _validate.default)(T.CreateTestUsersSchema), async ctx => {
  const {
    count
  } = ctx.input.body;
  const invites = Array(Math.min(count, 100)).fill(0).map(() => {
    const rando = (0, _random.randomString)(10);
    return {
      email: `${rando}@example.com`,
      name: `${rando.slice(0, 5)} Tester`,
      role: "member"
    };
  });
  _Logger.default.info("utils", `Creating ${count} test users`, invites);

  // Generate a bunch of invites
  const response = await (0, _userInviter.default)(ctx, {
    invites
  });

  // Convert from invites to active users by marking as active
  await Promise.all(response.users.map(user => user.updateActiveAt(ctx, true)));
  ctx.body = {
    data: {
      users: response.users.map(user => (0, _presenters.presentUser)(user))
    }
  };
});
router.post("developer.create_test_notifications", dev(), (0, _authentication.default)(), (0, _validate.default)(T.CreateTestNotificationsSchema), async ctx => {
  const {
    count
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const events = [_types.NotificationEventType.UpdateDocument, _types.NotificationEventType.CreateComment, _types.NotificationEventType.MentionedInDocument, _types.NotificationEventType.MentionedInComment, _types.NotificationEventType.AddUserToDocument];
  const [documents, actors] = await Promise.all([_models.Document.findAll({
    where: {
      teamId: user.teamId
    },
    limit: 25
  }), _models.User.findAll({
    where: {
      teamId: user.teamId,
      id: {
        [_sequelize.Op.ne]: user.id
      }
    },
    limit: 25
  })]);
  const notifications = await Promise.all(Array(Math.min(count, 100)).fill(0).map(() => {
    const document = documents.length ? (0, _random.randomElement)(documents) : undefined;
    return _models.Notification.create({
      event: (0, _random.randomElement)(events),
      userId: user.id,
      actorId: actors.length ? (0, _random.randomElement)(actors).id : user.id,
      teamId: user.teamId,
      documentId: document?.id
    });
  }));
  _Logger.default.info("utils", `Creating ${count} test notifications`);
  ctx.body = {
    data: {
      notifications: await Promise.all(notifications.map(notification => (0, _notification.default)(ctx, notification)))
    }
  };
});
var _default = exports.default = router;