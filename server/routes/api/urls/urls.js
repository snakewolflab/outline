"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeDns = _interopRequireDefault(require("node:dns"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _tracing = require("../../../logging/tracing");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("../../../../shared/types");
var _domains = require("../../../../shared/utils/domains");
var _parseDocumentSlug = _interopRequireDefault(require("../../../../shared/utils/parseDocumentSlug"));
var _parseMentionUrl = _interopRequireDefault(require("../../../../shared/utils/parseMentionUrl"));
var _urls = require("../../../../shared/utils/urls");
var _errors = require("../../../errors");
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _policies = require("../../../policies");
var _shareLoader = require("../../../commands/shareLoader");
var _unfurl = _interopRequireDefault(require("../../../presenters/unfurl"));
var _CacheHelper = require("../../../utils/CacheHelper");
var _RedisPrefixHelper = require("../../../utils/RedisPrefixHelper");
var _PluginManager = require("../../../utils/PluginManager");
var _RateLimiter = require("../../../utils/RateLimiter");
var _embeds = require("../../../utils/embeds");
var _passport = require("../../../utils/passport");
var T = _interopRequireWildcard(require("./schema"));
var _constants = require("../../../../shared/constants");
var _time = require("../../../../shared/utils/time");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
const plugins = _PluginManager.PluginManager.getHooks(_PluginManager.Hook.UnfurlProvider);
router.post("urls.unfurl", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneThousandPerHour), (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.UrlsUnfurlSchema), async ctx => {
  const {
    url,
    documentId
  } = ctx.input.body;
  const urlObj = new URL(url);

  // Public share URLs – does not require authentication
  if ((0, _urls.isInternalUrl)(url)) {
    const shareId = (0, _urls.parseShareIdFromUrl)(url);
    if (shareId) {
      const actor = ctx.state.auth.user;
      // teamId is only needed when the share identifier is a slug, not a UUID
      let teamId = actor?.teamId;
      if (!teamId && !(0, _isUUID.default)(shareId)) {
        const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx, {
          includeOAuthState: false
        });
        teamId = teamFromCtx?.id;
      }
      const previewDocumentId = (0, _parseDocumentSlug.default)(url);
      const {
        share,
        document
      } = await (0, _shareLoader.loadPublicShare)({
        id: shareId,
        documentId: previewDocumentId,
        teamId
      });
      if (!document) {
        ctx.response.status = 204;
        return;
      }
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Document,
        document,
        viewer: actor,
        url: `${share.canonicalUrl}/doc/${document.url.replace("/doc/", "")}`
      });
      return;
    }
  }

  // Everything below requires authentication
  const {
    user: actor
  } = ctx.state.auth;
  if (!actor) {
    throw (0, _errors.AuthenticationError)();
  }

  // Mentions
  if (urlObj.protocol === "mention:") {
    if (!documentId) {
      throw (0, _errors.ValidationError)("Document ID is required to unfurl a mention");
    }
    const {
      modelId,
      mentionType
    } = (0, _parseMentionUrl.default)(url);
    if (mentionType === _types.MentionType.User) {
      const [user, document] = await Promise.all([_models.User.findByPk(modelId), _models.Document.findByPk(documentId, {
        userId: actor.id
      })]);
      if (!user) {
        throw (0, _errors.NotFoundError)("Mentioned user does not exist");
      }
      if (!document) {
        throw (0, _errors.NotFoundError)("Document does not exist");
      }
      (0, _policies.authorize)(actor, "read", user);
      (0, _policies.authorize)(actor, "read", document);
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Mention,
        user,
        document
      }, {
        includeEmail: !!(0, _policies.can)(actor, "readEmail", user)
      });
    } else if (mentionType === _types.MentionType.Group) {
      const [group, document] = await Promise.all([_models.Group.findByPk(modelId), _models.Document.findByPk(documentId, {
        userId: actor.id
      })]);
      if (!group) {
        throw (0, _errors.NotFoundError)("Mentioned group does not exist");
      }
      if (!document) {
        throw (0, _errors.NotFoundError)("Document does not exist");
      }
      (0, _policies.authorize)(actor, "read", group);
      (0, _policies.authorize)(actor, "read", document);

      // Get group members for display
      const groupUsers = await _models.GroupUser.findAll({
        where: {
          groupId: group.id
        },
        include: [{
          model: _models.User,
          as: "user"
        }],
        limit: _constants.MAX_AVATAR_DISPLAY
      });
      const users = groupUsers.map(gu => gu.user).filter(Boolean);
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Group,
        group,
        users
      });
    }
    return;
  }

  // Internal resources
  if ((0, _urls.isInternalUrl)(url) || (0, _domains.parseDomain)(url).host === actor.team.domain) {
    const previewDocumentId = (0, _parseDocumentSlug.default)(url);
    if (previewDocumentId) {
      const document = await _models.Document.findByPk(previewDocumentId, {
        userId: actor.id
      });
      if (!document || !(0, _policies.can)(actor, "read", document)) {
        ctx.response.status = 204;
        return;
      }
      ctx.body = await (0, _unfurl.default)({
        type: _types.UnfurlResourceType.Document,
        document,
        viewer: actor
      });
      return;
    }
    ctx.response.status = 204;
    return;
  }

  // External resources
  // Use getDataOrSet which handles distributed locking to prevent thundering herd
  // when multiple clients request the same URL simultaneously
  const cacheKey = _RedisPrefixHelper.RedisPrefixHelper.getUnfurlKey(actor.teamId, url);
  const defaultCacheExpiry = 3600;
  const unfurlResult = await _CacheHelper.CacheHelper.getDataOrSet(cacheKey, async () => {
    for (const plugin of plugins) {
      const pluginName = plugin.name ?? "unknown";
      const unfurl = await (0, _tracing.traceFunction)({
        spanName: "unfurl.plugin",
        resourceName: pluginName,
        tags: {
          "unfurl.plugin": pluginName,
          "unfurl.url_host": urlObj.hostname
        }
      })(() => plugin.value.unfurl(url, actor))();
      if (unfurl) {
        if ("error" in unfurl) {
          return {
            data: {
              error: true
            },
            expiry: 60
          };
        }
        return {
          data: unfurl,
          expiry: plugin.value.cacheExpiry
        };
      }
    }
    return undefined;
  }, defaultCacheExpiry);
  if (!unfurlResult || "error" in unfurlResult) {
    ctx.response.status = 204;
    return;
  }
  ctx.body = await (0, _unfurl.default)(unfurlResult);
  return;
});
router.post("urls.checkEmbed", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UrlsCheckEmbedSchema), async ctx => {
  const {
    url
  } = ctx.input.body;
  const result = await _CacheHelper.CacheHelper.getDataOrSet(_RedisPrefixHelper.RedisPrefixHelper.getEmbedCheckKey(url), () => (0, _embeds.checkEmbeddability)(url), _time.Day.seconds);
  ctx.body = result ? {
    embeddable: result.embeddable,
    reason: result.reason
  } : {
    embeddable: false,
    reason: "error"
  };
});
router.post("urls.validateCustomDomain", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UrlsCheckCnameSchema), async ctx => {
  const {
    hostname
  } = ctx.input.body;
  const [team, share] = await Promise.all([_models.Team.findByDomain(hostname), _models.Share.findOne({
    where: {
      domain: hostname
    }
  })]);
  if (team || share) {
    throw (0, _errors.ValidationError)("Domain is already in use");
  }
  let addresses;
  try {
    addresses = await new Promise((resolve, reject) => {
      _nodeDns.default.resolveCname(hostname, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "ENOTFOUND") {
      throw (0, _errors.NotFoundError)("No CNAME record found");
    }
    throw (0, _errors.ValidationError)("Invalid domain");
  }
  if (addresses.length === 0) {
    throw (0, _errors.ValidationError)("No CNAME record found");
  }
  const address = addresses[0];
  const likelyValid = address.endsWith((0, _domains.getBaseDomain)());
  if (!likelyValid) {
    throw (0, _errors.ValidationError)("CNAME is not configured correctly");
  }
  ctx.body = {
    success: true
  };
});
var _default = exports.default = router;