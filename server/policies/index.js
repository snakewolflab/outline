"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _cancan = require("./cancan");
Object.keys(_cancan).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _cancan[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _cancan[key];
    }
  });
});
require("./apiKey");
require("./attachment");
require("./authenticationProvider");
require("./collection");
require("./comment");
require("./document");
require("./externalGroup");
require("./fileOperation");
require("./import");
require("./integration");
require("./notification");
require("./oauthClient");
require("./oauthAuthentication");
require("./pins");
require("./reaction");
require("./revision");
require("./searchQuery");
require("./share");
require("./star");
require("./subscription");
require("./user");
require("./team");
require("./template");
require("./group");
require("./webhookSubscription");
require("./userMembership");
require("./userPasskey");
require("./emoji");
require("./accessRequest");