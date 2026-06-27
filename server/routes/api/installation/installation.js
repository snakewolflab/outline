"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _types = require("../../../../shared/types");
var _slugify = _interopRequireDefault(require("../../../../shared/utils/slugify"));
var _teamCreator = _interopRequireDefault(require("../../../commands/teamCreator"));
var _errors = require("../../../errors");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _authentication2 = require("../../../utils/authentication");
var _getInstallationInfo = require("../../../utils/getInstallationInfo");
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
// Note: This entire router is only mounted in self-hosted installations.
const router = new _koaRouter.default();
router.post("installation.create", (0, _validate.default)(T.InstallationCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    teamName,
    userName,
    userEmail
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;

  // Check that this can only be called when there are no existing teams
  const existingTeamCount = await _models.Team.count({
    transaction
  });
  if (existingTeamCount > 0) {
    throw (0, _errors.ValidationError)("Installation already has existing teams");
  }
  const team = await (0, _teamCreator.default)(ctx, {
    name: teamName,
    subdomain: (0, _slugify.default)(teamName),
    authenticationProviders: []
  });
  const user = await _models.User.createWithCtx(ctx, {
    name: userName,
    email: userEmail,
    teamId: team.id,
    role: _types.UserRole.Admin
  });
  await (0, _authentication2.signIn)(ctx, "email", {
    user,
    team,
    isNewTeam: true,
    isNewUser: true,
    client: _types.Client.Web
  });
});
router.post("installation.info", (0, _authentication.default)(), async ctx => {
  const currentVersion = (0, _getInstallationInfo.getVersion)();
  const {
    latestVersion,
    versionsBehind
  } = await (0, _getInstallationInfo.getVersionInfo)(currentVersion);
  ctx.body = {
    data: {
      version: currentVersion,
      latestVersion,
      versionsBehind
    },
    policies: []
  };
});
var _default = exports.default = router;