"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.commentingEnabled = commentingEnabled;
exports.feature = feature;
var _types = require("../../shared/types");
var _errors = require("../errors");
/**
 * Middleware to check if a feature is enabled for the team.
 *
 * @param preference The preference to check
 * @returns The middleware function
 */
function feature(preference) {
  return async function featureEnabledMiddleware(ctx, next) {
    if (!ctx.state.auth.user.team.getPreference(preference)) {
      throw (0, _errors.ValidationError)(`${preference} is currently disabled`);
    }
    return next();
  };
}

/**
 * Middleware to check that commenting is enabled for the team.
 *
 * @returns The middleware function
 */
function commentingEnabled() {
  return async function commentingEnabledMiddleware(ctx, next) {
    const commenting = ctx.state.auth.user.team.getPreference(_types.TeamPreference.Commenting);
    // A legacy boolean `false` (team not yet migrated) means disabled.
    if (commenting === _types.CommentingAccess.None || commenting === false) {
      throw (0, _errors.ValidationError)("Commenting is currently disabled");
    }
    return next();
  };
}