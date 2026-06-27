"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registrationAuth;
var _errors = require("../../../errors");
var _models = require("../../../models");
/**
 * Middleware that authenticates requests to the RFC 7592 client registration
 * management endpoint using a Bearer token (registration_access_token).
 *
 * Verifies the token matches the client identified by the `:clientId` route
 * parameter and attaches the client to `ctx.state.oauthClient`.
 */
function registrationAuth() {
  return async function registrationAuthMiddleware(ctx, next) {
    const authorization = ctx.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      throw (0, _errors.AuthenticationError)("Missing or invalid Authorization header");
    }
    const token = authorization.slice(7);
    if (!token) {
      throw (0, _errors.AuthenticationError)("Missing registration access token");
    }
    const client = await _models.OAuthClient.findByRegistrationAccessToken(token, {
      transaction: ctx.state.transaction,
      lock: ctx.state.transaction?.LOCK.UPDATE
    });
    if (!client) {
      throw (0, _errors.AuthenticationError)("Invalid registration access token");
    }
    const {
      clientId
    } = ctx.params;
    if (client.clientId !== clientId) {
      throw (0, _errors.AuthenticationError)("Token does not match the specified client");
    }
    ctx.state.oauthClient = client;
    return next();
  };
}