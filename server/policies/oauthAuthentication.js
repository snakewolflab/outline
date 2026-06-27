"use strict";

var _models = require("../models");
var _cancan = require("./cancan");
var _utils = require("./utils");
(0, _cancan.allow)(_models.User, "listOAuthAuthentications", _models.Team, (actor, team) => (0, _utils.isTeamModel)(actor, team));
(0, _cancan.allow)(_models.User, ["read", "delete"], _models.OAuthAuthentication, (actor, oauthAuthentication) => actor?.id === oauthAuthentication?.userId);