"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "createOAuthClient", _models.Team, (actor, team) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, team), (0, _utils.isTeamMutable)(actor)));
(0, _cancan.allow)(_models.User, "listOAuthClients", _models.Team, (actor, team) => (0, _utils.isTeamAdmin)(actor, team));
(0, _cancan.allow)(_models.User, "read", _models.OAuthClient, (actor, oauthClient) => (0, _utils.or)((0, _utils.isTeamModel)(actor, oauthClient), !!oauthClient?.published));
(0, _cancan.allow)(_models.User, ["update", "delete"], _models.OAuthClient, (actor, oauthClient) => (0, _utils.and)((0, _utils.isTeamAdmin)(actor, oauthClient), (0, _utils.isTeamMutable)(actor), !oauthClient?.isDCR));