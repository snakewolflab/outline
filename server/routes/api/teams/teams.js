"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("../../../../shared/types");
var _teamCreator = _interopRequireDefault(require("../../../commands/teamCreator"));
var _teamUpdater = _interopRequireDefault(require("../../../commands/teamUpdater"));
var _ConfirmTeamDeleteEmail = _interopRequireDefault(require("../../../emails/templates/ConfirmTeamDeleteEmail"));
var _env = _interopRequireDefault(require("../../../env"));
var _errors = require("../../../errors");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _crypto = require("../../../utils/crypto");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const handleTeamUpdate = async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const team = await _models.Team.findByPk(user.teamId, {
    include: [{
      model: _models.TeamDomain,
      separate: true
    }],
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(user, "update", team);
  const updatedTeam = await (0, _teamUpdater.default)(ctx, {
    params: ctx.input.body,
    user,
    team
  });
  ctx.body = {
    data: (0, _presenters.presentTeam)(updatedTeam),
    policies: (0, _presenters.presentPolicies)(user, [updatedTeam])
  };
};
router.post("team.update", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.TeamsUpdateSchema), (0, _transaction.transaction)(), handleTeamUpdate);
router.post("teams.update", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.TeamsUpdateSchema), (0, _transaction.transaction)(), handleTeamUpdate);
router.post("teams.requestDelete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), async ctx => {
  if (!_env.default.EMAIL_ENABLED) {
    throw (0, _errors.ValidationError)("Email support is not setup for this instance");
  }
  const {
    user
  } = ctx.state.auth;
  const {
    team
  } = user;
  (0, _policies.authorize)(user, "delete", team);
  await new _ConfirmTeamDeleteEmail.default({
    to: user.email,
    language: user.language,
    deleteConfirmationCode: team.getDeleteConfirmationCode(user)
  }).schedule();
  ctx.body = {
    success: true
  };
});
router.post("teams.delete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.TeamsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    auth
  } = ctx.state;
  const {
    code
  } = ctx.input.body;
  const {
    user
  } = auth;
  const {
    team
  } = user;
  (0, _policies.authorize)(user, "delete", team);
  if (_env.default.EMAIL_ENABLED) {
    const deleteConfirmationCode = team.getDeleteConfirmationCode(user);
    if (!(0, _crypto.safeEqual)(code, deleteConfirmationCode)) {
      throw (0, _errors.ValidationError)("The confirmation code was incorrect");
    }
  }
  await team.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("teams.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    name
  } = ctx.request.body;
  const existingTeam = await _models.Team.scope("withAuthenticationProviders").findByPk(user.teamId, {
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "createTeam", existingTeam);
  const authenticationProviders = existingTeam.authenticationProviders.map(provider => ({
    name: provider.name,
    providerId: provider.providerId
  }));
  const team = await (0, _teamCreator.default)(ctx, {
    name,
    subdomain: name,
    authenticationProviders
  });
  const newUser = await _models.User.createWithCtx(ctx, {
    teamId: team.id,
    name: user.name,
    email: user.email,
    role: _types.UserRole.Admin
  });
  ctx.body = {
    success: true,
    data: {
      team: (0, _presenters.presentTeam)(team),
      transferUrl: `${team.url}/auth/redirect?token=${newUser?.getTransferToken()}`
    }
  };
});
var _default = exports.default = router;