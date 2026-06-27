"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _teamCreator = _interopRequireDefault(require("./teamCreator"));
var _context = require("../context");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _models = require("../models");
var _database = require("../storage/database");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function teamProvisioner(ctx, _ref) {
  let {
    teamId,
    name,
    domain,
    subdomain,
    avatarUrl,
    authenticationProvider
  } = _ref;
  const where = teamId ? {
    ...authenticationProvider,
    teamId
  } : authenticationProvider;

  // First try to find an authentication provider associated with a non-deleted
  // team. This ensures active workspaces are always preferred over deleted ones
  // when multiple workspaces share the same authentication provider.
  let authP = await _models.AuthenticationProvider.findOne({
    where,
    include: [{
      model: _models.Team,
      as: "team",
      required: true
    }],
    order: [["enabled", "DESC"]]
  });
  if (!authP) {
    // Check if there is a matching authentication provider for a deleted team.
    // If so, throw an appropriate error rather than creating a new team.
    authP = await _models.AuthenticationProvider.findOne({
      where,
      include: [{
        model: _models.Team,
        as: "team",
        required: true,
        paranoid: false
      }]
    });
    if (authP?.team.deletedAt) {
      throw (0, _errors.TeamPendingDeletionError)();
    }
  }

  // This authentication provider already exists which means we have a team and
  // there is nothing left to do but return the existing credentials
  if (authP) {
    return {
      authenticationProvider: authP,
      team: authP.team,
      isNewTeam: false
    };
  } else if (teamId) {
    // The user is attempting to log into a team with an unfamiliar SSO provider
    if (_env.default.isCloudHosted) {
      const err = (0, _errors.InvalidAuthenticationError)();
      _Logger.default.error("Authentication provider does not exist for team", err, {
        authenticationProvider,
        teamId
      });
      throw err;
    }

    // This team + auth provider combination has not been seen before in self hosted
    const existingTeam = await _models.Team.findByPk(teamId, {
      rejectOnEmpty: true
    });

    // If the self-hosted installation has a single team and the domain for the
    // new team is allowed then assign the authentication provider to the
    // existing team
    if (domain) {
      if (await existingTeam.isDomainAllowed(domain)) {
        authP = await existingTeam.$create("authenticationProvider", authenticationProvider);
        return {
          authenticationProvider: authP,
          team: existingTeam,
          isNewTeam: false
        };
      }
      throw (0, _errors.DomainNotAllowedError)();
    }
    throw (0, _errors.InvalidAuthenticationError)();
  }

  // We cannot find an existing team, so we create a new one
  const team = await _database.sequelize.transaction(transaction => (0, _teamCreator.default)((0, _context.createContext)({
    transaction
  }), {
    name,
    domain,
    subdomain,
    avatarUrl,
    authenticationProviders: [authenticationProvider]
  }));
  return {
    team,
    authenticationProvider: team.authenticationProviders[0],
    isNewTeam: true
  };
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "teamProvisioner"
})(teamProvisioner);