"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "presentAccessRequest", {
  enumerable: true,
  get: function () {
    return _accessRequest.default;
  }
});
Object.defineProperty(exports, "presentApiKey", {
  enumerable: true,
  get: function () {
    return _apiKey.default;
  }
});
Object.defineProperty(exports, "presentAttachment", {
  enumerable: true,
  get: function () {
    return _attachment.default;
  }
});
Object.defineProperty(exports, "presentAuthenticationProvider", {
  enumerable: true,
  get: function () {
    return _authenticationProvider.default;
  }
});
Object.defineProperty(exports, "presentAvailableTeam", {
  enumerable: true,
  get: function () {
    return _availableTeam.default;
  }
});
Object.defineProperty(exports, "presentCollection", {
  enumerable: true,
  get: function () {
    return _collection.default;
  }
});
Object.defineProperty(exports, "presentComment", {
  enumerable: true,
  get: function () {
    return _comment.default;
  }
});
Object.defineProperty(exports, "presentDocument", {
  enumerable: true,
  get: function () {
    return _document.default;
  }
});
Object.defineProperty(exports, "presentDocumentInsight", {
  enumerable: true,
  get: function () {
    return _documentInsight.default;
  }
});
Object.defineProperty(exports, "presentDocuments", {
  enumerable: true,
  get: function () {
    return _document.presentDocuments;
  }
});
Object.defineProperty(exports, "presentEmoji", {
  enumerable: true,
  get: function () {
    return _emoji.default;
  }
});
Object.defineProperty(exports, "presentEvent", {
  enumerable: true,
  get: function () {
    return _event.default;
  }
});
Object.defineProperty(exports, "presentExternalGroup", {
  enumerable: true,
  get: function () {
    return _externalGroup.default;
  }
});
Object.defineProperty(exports, "presentFileOperation", {
  enumerable: true,
  get: function () {
    return _fileOperation.default;
  }
});
Object.defineProperty(exports, "presentGroup", {
  enumerable: true,
  get: function () {
    return _group.default;
  }
});
Object.defineProperty(exports, "presentGroupMembership", {
  enumerable: true,
  get: function () {
    return _groupMembership.default;
  }
});
Object.defineProperty(exports, "presentGroupUser", {
  enumerable: true,
  get: function () {
    return _groupUser.default;
  }
});
Object.defineProperty(exports, "presentImport", {
  enumerable: true,
  get: function () {
    return _import.default;
  }
});
Object.defineProperty(exports, "presentIntegration", {
  enumerable: true,
  get: function () {
    return _integration.default;
  }
});
Object.defineProperty(exports, "presentMembership", {
  enumerable: true,
  get: function () {
    return _membership.default;
  }
});
Object.defineProperty(exports, "presentNavigationNode", {
  enumerable: true,
  get: function () {
    return _navigationNode.default;
  }
});
Object.defineProperty(exports, "presentOAuthClient", {
  enumerable: true,
  get: function () {
    return _oauthClient.default;
  }
});
Object.defineProperty(exports, "presentPin", {
  enumerable: true,
  get: function () {
    return _pin.default;
  }
});
Object.defineProperty(exports, "presentPolicies", {
  enumerable: true,
  get: function () {
    return _policy.default;
  }
});
Object.defineProperty(exports, "presentProviderConfig", {
  enumerable: true,
  get: function () {
    return _providerConfig.default;
  }
});
Object.defineProperty(exports, "presentPublicTeam", {
  enumerable: true,
  get: function () {
    return _publicTeam.default;
  }
});
Object.defineProperty(exports, "presentPublishedOAuthClient", {
  enumerable: true,
  get: function () {
    return _oauthClient.presentPublishedOAuthClient;
  }
});
Object.defineProperty(exports, "presentReaction", {
  enumerable: true,
  get: function () {
    return _reaction.default;
  }
});
Object.defineProperty(exports, "presentRelationship", {
  enumerable: true,
  get: function () {
    return _relationship.default;
  }
});
Object.defineProperty(exports, "presentRevision", {
  enumerable: true,
  get: function () {
    return _revision.default;
  }
});
Object.defineProperty(exports, "presentSearchQuery", {
  enumerable: true,
  get: function () {
    return _searchQuery.default;
  }
});
Object.defineProperty(exports, "presentShare", {
  enumerable: true,
  get: function () {
    return _share.default;
  }
});
Object.defineProperty(exports, "presentStar", {
  enumerable: true,
  get: function () {
    return _star.default;
  }
});
Object.defineProperty(exports, "presentSubscription", {
  enumerable: true,
  get: function () {
    return _subscription.default;
  }
});
Object.defineProperty(exports, "presentTeam", {
  enumerable: true,
  get: function () {
    return _team.default;
  }
});
Object.defineProperty(exports, "presentTemplate", {
  enumerable: true,
  get: function () {
    return _template.default;
  }
});
Object.defineProperty(exports, "presentUser", {
  enumerable: true,
  get: function () {
    return _user.default;
  }
});
Object.defineProperty(exports, "presentView", {
  enumerable: true,
  get: function () {
    return _view.default;
  }
});
var _apiKey = _interopRequireDefault(require("./apiKey"));
var _attachment = _interopRequireDefault(require("./attachment"));
var _authenticationProvider = _interopRequireDefault(require("./authenticationProvider"));
var _availableTeam = _interopRequireDefault(require("./availableTeam"));
var _collection = _interopRequireDefault(require("./collection"));
var _comment = _interopRequireDefault(require("./comment"));
var _document = _interopRequireWildcard(require("./document"));
var _documentInsight = _interopRequireDefault(require("./documentInsight"));
var _event = _interopRequireDefault(require("./event"));
var _externalGroup = _interopRequireDefault(require("./externalGroup"));
var _fileOperation = _interopRequireDefault(require("./fileOperation"));
var _group = _interopRequireDefault(require("./group"));
var _groupMembership = _interopRequireDefault(require("./groupMembership"));
var _groupUser = _interopRequireDefault(require("./groupUser"));
var _import = _interopRequireDefault(require("./import"));
var _integration = _interopRequireDefault(require("./integration"));
var _membership = _interopRequireDefault(require("./membership"));
var _navigationNode = _interopRequireDefault(require("./navigationNode"));
var _oauthClient = _interopRequireWildcard(require("./oauthClient"));
var _pin = _interopRequireDefault(require("./pin"));
var _policy = _interopRequireDefault(require("./policy"));
var _providerConfig = _interopRequireDefault(require("./providerConfig"));
var _publicTeam = _interopRequireDefault(require("./publicTeam"));
var _reaction = _interopRequireDefault(require("./reaction"));
var _relationship = _interopRequireDefault(require("./relationship"));
var _revision = _interopRequireDefault(require("./revision"));
var _searchQuery = _interopRequireDefault(require("./searchQuery"));
var _share = _interopRequireDefault(require("./share"));
var _star = _interopRequireDefault(require("./star"));
var _subscription = _interopRequireDefault(require("./subscription"));
var _team = _interopRequireDefault(require("./team"));
var _template = _interopRequireDefault(require("./template"));
var _user = _interopRequireDefault(require("./user"));
var _view = _interopRequireDefault(require("./view"));
var _emoji = _interopRequireDefault(require("./emoji"));
var _accessRequest = _interopRequireDefault(require("./accessRequest"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }