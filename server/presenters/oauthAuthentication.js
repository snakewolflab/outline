"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentOAuthAuthentication;
var _oauthClient = require("./oauthClient");
function presentOAuthAuthentication(oauthAuthentication) {
  return {
    id: oauthAuthentication.id,
    userId: oauthAuthentication.userId,
    oauthClientId: oauthAuthentication.oauthClientId,
    oauthClient: (0, _oauthClient.presentPublishedOAuthClient)(oauthAuthentication.oauthClient),
    scope: oauthAuthentication.scope,
    lastActiveAt: oauthAuthentication.lastActiveAt,
    createdAt: oauthAuthentication.createdAt
  };
}