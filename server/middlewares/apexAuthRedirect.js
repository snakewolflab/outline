"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = apexAuthRedirect;
var _error = require("../../shared/utils/error");
var _domains = require("../../shared/utils/domains");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * An authentication middleware that should be used on routes that return from external auth flows
 * to the apex domain. In these cases the user will be redirected to the correct subdomain where
 * they are authenticated.
 *
 * @param options Options for the middleware
 * @returns Koa middleware function
 */
function apexAuthRedirect(_ref) {
  let {
    getTeamId,
    getRedirectPath,
    getErrorPath
  } = _ref;
  return async function apexAuthRedirectMiddleware(ctx, next) {
    const {
      user
    } = ctx.state.auth;
    if (user) {
      return next();
    }
    const teamId = getTeamId(ctx);
    if (teamId) {
      try {
        const team = await _models.Team.findByPk(teamId, {
          attributes: ["id", "domain", "subdomain"]
        });
        if (!team) {
          return ctx.redirect(getErrorPath(ctx));
        }
        return (0, _domains.parseDomain)(ctx.host).teamSubdomain === team.subdomain ? ctx.redirect("/") : ctx.redirectOnClient(getRedirectPath(ctx, team));
      } catch (err) {
        _Logger.default.error("Error fetching team", (0, _error.toError)(err));
        return ctx.redirect(getErrorPath(ctx));
      }
    } else {
      return ctx.redirect(getErrorPath(ctx));
    }
  };
}