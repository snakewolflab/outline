"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _dateFns = require("date-fns");
var _random = require("../../../../shared/random");
var _types = require("../../../../shared/types");
var _errors = require("../../../errors");
var _ShareSubscriptionConfirmEmail = _interopRequireDefault(require("../../../emails/templates/ShareSubscriptionConfirmEmail"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _ShareSubscriptionHelper = _interopRequireDefault(require("../../../models/helpers/ShareSubscriptionHelper"));
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _passport = require("../../../utils/passport");
var _sitemap = require("../../../utils/sitemap");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
var _shareLoader = require("../../../commands/shareLoader");
var _shareDomains = _interopRequireDefault(require("../../../middlewares/shareDomains"));
var _env = _interopRequireDefault(require("../../../env"));
var _crypto = require("../../../utils/crypto");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("shares.info", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.SharesInfoSchema), async ctx => {
  const {
    id,
    collectionId,
    documentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });

  // only public link loads will send "id".
  if (id) {
    let {
      share,
      sharedTree,
      collection,
      document
    } = await (0, _shareLoader.loadPublicShare)({
      id,
      collectionId,
      documentId,
      teamId: teamFromCtx?.id
    });

    // reload with membership scope if user is authenticated
    if (user) {
      collection = collection ? await _models.Collection.findByPk(collection.id, {
        userId: user.id
      }) : null;
      document = document ? await _models.Document.findByPk(document.id, {
        userId: user.id
      }) : null;
    }
    const team = teamFromCtx?.id === share.teamId ? teamFromCtx : share.team;
    const [serializedCollection, serializedDocument] = await Promise.all([collection ? (0, _presenters.presentCollection)(ctx, collection, {
      isPublic: (0, _policies.cannot)(user, "read", collection),
      shareId: share.id,
      includeUpdatedAt: share.showLastUpdated
    }) : Promise.resolve(null), document ? (0, _presenters.presentDocument)(ctx, document, {
      isPublic: (0, _policies.cannot)(user, "read", document),
      shareId: share.id,
      includeUpdatedAt: share.showLastUpdated
    }) : Promise.resolve(null)]);
    const serializedTeam = (0, _presenters.presentPublicTeam)(team, !!team.getPreference(_types.TeamPreference.PublicBranding));
    ctx.body = {
      data: {
        shares: [(0, _presenters.presentShare)(share, user?.isAdmin ?? false)],
        sharedTree,
        team: serializedTeam,
        collection: serializedCollection,
        document: serializedDocument
      },
      policies: (0, _presenters.presentPolicies)(user, [share])
    };
    return;
  }

  // load share with parent for displaying in the share popovers.

  if (!user) {
    throw (0, _errors.AuthenticationError)("Authentication required");
  }
  try {
    const {
      share,
      parentShare
    } = await (0, _shareLoader.loadShareWithParent)({
      collectionId,
      documentId,
      user
    });
    const shares = [share, parentShare].filter(Boolean);
    if (!shares.length) {
      throw (0, _errors.NotFoundError)();
    }
    ctx.body = {
      data: {
        shares: shares.map(s => (0, _presenters.presentShare)(s, user.isAdmin ?? false))
      },
      policies: (0, _presenters.presentPolicies)(user, shares)
    };
  } catch (err) {
    if (err instanceof Error && "id" in err && err.id === "not_found") {
      ctx.response.status = 204;
      return;
    }
    throw err;
  }
});
router.post("shares.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.SharesListSchema), async ctx => {
  const {
    sort,
    direction,
    query
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "listShares", user.team);
  const collectionIds = await user.collectionIds();
  const collectionWhere = {
    "$collection.id$": collectionIds,
    "$collection.teamId$": user.teamId
  };
  const documentWhere = {
    "$document.teamId$": user.teamId,
    "$document.collectionId$": collectionIds
  };
  if (query) {
    collectionWhere["$collection.name$"] = {
      [_sequelize.Op.iLike]: `%${query}%`
    };
    documentWhere["$document.title$"] = {
      [_sequelize.Op.iLike]: `%${query}%`
    };
  }
  const shareWhere = {
    teamId: user.teamId,
    userId: user.id,
    published: true,
    revokedAt: {
      [_sequelize.Op.is]: null
    }
  };
  if (user.isAdmin) {
    delete shareWhere.userId;
  }
  const options = {
    where: {
      ...shareWhere,
      [_sequelize.Op.or]: [collectionWhere, documentWhere]
    },
    include: [{
      model: _models.Collection.scope({
        method: ["withMembership", user.id]
      }),
      as: "collection",
      required: false
    }, {
      model: _models.Document,
      required: false,
      paranoid: true,
      as: "document",
      include: [{
        model: _models.Collection.scope({
          method: ["withMembership", user.id]
        }),
        as: "collection"
      }]
    }, {
      model: _models.User,
      required: true,
      as: "user"
    }, {
      model: _models.Team,
      required: true,
      as: "team"
    }],
    subQuery: false
  };
  const [shares, total] = await Promise.all([_models.Share.unscoped().findAll({
    ...options,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.Share.count(options)]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: shares.map(share => (0, _presenters.presentShare)(share, user.isAdmin)),
    policies: (0, _presenters.presentPolicies)(user, shares)
  };
});
router.post("shares.create", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.SharesCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    collectionId,
    documentId,
    published,
    urlId,
    includeChildDocuments,
    allowIndexing,
    allowSubscriptions,
    showLastUpdated,
    showTOC
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "createShare", user.team);
  const collection = collectionId ? await _models.Collection.findByPk(collectionId, {
    userId: user.id
  }) : null;
  const document = documentId ? await _models.Document.findByPk(documentId, {
    userId: user.id
  }) : null;
  if (documentId && !document) {
    throw (0, _errors.NotFoundError)();
  }
  if (collectionId && !collection) {
    throw (0, _errors.NotFoundError)();
  }
  if (document) {
    (0, _policies.authorize)(user, "read", document);
  }
  if (collection) {
    (0, _policies.authorize)(user, "read", collection);
  }
  const [share] = await _models.Share.findOrCreateWithCtx(ctx, {
    where: {
      collectionId: collectionId ?? null,
      documentId: documentId ?? null,
      teamId: user.teamId,
      revokedAt: null
    },
    defaults: {
      userId: user.id,
      published,
      includeChildDocuments: published || includeChildDocuments,
      allowIndexing,
      allowSubscriptions,
      showLastUpdated,
      showTOC,
      urlId
    }
  });
  if (share.published) {
    (0, _policies.authorize)(user, "share", user.team);
    if (document) {
      (0, _policies.authorize)(user, "share", document);
    }
    if (collection) {
      (0, _policies.authorize)(user, "share", collection);
    }
  }
  share.team = user.team;
  share.user = user;
  share.collection = collection;
  share.document = document;
  ctx.body = {
    data: (0, _presenters.presentShare)(share),
    policies: (0, _presenters.presentPolicies)(user, [share])
  };
});
router.post("shares.update", (0, _authentication.default)(), (0, _validate.default)(T.SharesUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    includeChildDocuments,
    published,
    urlId,
    allowIndexing,
    allowSubscriptions,
    showLastUpdated,
    showTOC,
    title,
    iconUrl
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "share", user.team);

  // fetch the share with document and collection.
  const share = await _models.Share.scope({
    method: ["withCollectionPermissions", user.id]
  }).findByPk(id);
  (0, _policies.authorize)(user, "update", share);
  if (published !== undefined) {
    share.published = published;
    if (published) {
      share.includeChildDocuments = true;
    }
  }
  if (includeChildDocuments !== undefined) {
    share.includeChildDocuments = includeChildDocuments;
  }
  if (!(0, _compat.isUndefined)(urlId)) {
    share.urlId = urlId;
  }
  if (allowIndexing !== undefined) {
    share.allowIndexing = allowIndexing;
  }
  if (allowSubscriptions !== undefined) {
    share.allowSubscriptions = allowSubscriptions;
  }
  if (showLastUpdated !== undefined) {
    share.showLastUpdated = showLastUpdated;
  }
  if (showTOC !== undefined) {
    share.showTOC = showTOC;
  }
  if (!(0, _compat.isUndefined)(title)) {
    share.title = title || null;
  }
  if (!(0, _compat.isUndefined)(iconUrl)) {
    share.iconUrl = iconUrl || null;
  }
  await share.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentShare)(share, user.isAdmin),
    policies: (0, _presenters.presentPolicies)(user, [share])
  };
});
router.post("shares.revoke", (0, _authentication.default)(), (0, _validate.default)(T.SharesRevokeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const share = await _models.Share.findByPk(id);
  if (!share?.collection && !share?.document) {
    throw (0, _errors.NotFoundError)();
  }
  (0, _policies.authorize)(user, "revoke", share);
  await share.revoke(ctx);
  ctx.body = {
    success: true
  };
});
router.get("shares.sitemap", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _shareDomains.default)(), (0, _validate.default)(T.SharesSitemapSchema), async ctx => {
  const {
    id
  } = ctx.input.query;
  const team = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });
  const {
    share,
    sharedTree
  } = await (0, _shareLoader.loadPublicShare)({
    id,
    teamId: team?.id
  });
  if (!share.allowIndexing) {
    ctx.status = 404;
    return;
  }
  const baseUrl = share.domain ? `https://${share.domain}` : `${share.team.url ?? process.env.URL}/s/${id}`;
  ctx.set("Content-Type", "application/xml");
  ctx.body = (0, _sitemap.navigationNodeToSitemap)(sharedTree, baseUrl);
});
router.post("shares.subscribe", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _validate.default)(T.SharesSubscribeSchema), (0, _transaction.transaction)(), async ctx => {
  if (!_env.default.EMAIL_ENABLED) {
    throw (0, _errors.InvalidRequestError)("Email is not configured");
  }
  const {
    shareId,
    documentId,
    email
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const team = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });

  // Validate the share exists and is published
  const {
    share,
    document
  } = await (0, _shareLoader.loadPublicShare)({
    id: shareId,
    documentId,
    teamId: team?.id
  });
  if (!share.allowSubscriptions) {
    throw (0, _errors.InvalidRequestError)("Subscriptions are not enabled for this share");
  }
  const emailFingerprint = _models.ShareSubscription.normalizeEmailFingerprint(email);
  const existing = await _models.ShareSubscription.findOne({
    where: {
      shareId: share.id,
      documentId,
      emailFingerprint
    },
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  let subscription;
  if (existing) {
    // Already confirmed and active — return success silently
    if (existing.isConfirmed && !existing.isUnsubscribed) {
      ctx.body = {
        success: true
      };
      return;
    }

    // Unsubscribed — allow re-subscribe with new confirmation
    if (existing.isUnsubscribed) {
      existing.unsubscribedAt = null;
      existing.confirmedAt = null;
      existing.lastNotifiedAt = null;
      existing.secret = (0, _random.randomString)(32);
      existing.email = email;
      await existing.save({
        transaction
      });
    } else if (existing.createdAt > (0, _dateFns.subMinutes)(new Date(), 60)) {
      // Recently created, not yet confirmed — don't spam
      ctx.body = {
        success: true
      };
      return;
    } else {
      // Expired or stale unconfirmed — regenerate
      existing.secret = (0, _random.randomString)(32);
      existing.email = email;
      await existing.save({
        transaction
      });
    }
    subscription = existing;
  } else {
    subscription = await _models.ShareSubscription.create({
      shareId: share.id,
      documentId,
      email,
      emailFingerprint,
      secret: (0, _random.randomString)(32),
      ipAddress: ctx.request.ip
    }, {
      transaction
    });
  }
  const confirmUrl = _ShareSubscriptionHelper.default.confirmUrl(subscription);
  const usePublicBranding = share.team?.getPreference(_types.TeamPreference.PublicBranding) ?? false;
  await new _ShareSubscriptionConfirmEmail.default({
    to: email,
    documentTitle: document?.titleWithDefault ?? "",
    confirmUrl,
    teamName: usePublicBranding ? share.team?.name : undefined
  }).schedule();
  ctx.body = {
    success: true
  };
});
router.get("shares.confirmSubscription", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _validate.default)(T.SharesConfirmSubscriptionSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    token,
    follow
  } = ctx.input.query;
  const {
    transaction
  } = ctx.state;

  // Anti-prefetch: prevent email clients from pre-fetching the link
  if (!follow) {
    return ctx.redirectOnClient(ctx.request.href + "&follow=true");
  }
  const subscription = await _models.ShareSubscription.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  if (!subscription || subscription.isUnsubscribed) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  const share = await _models.Share.findByPk(subscription.shareId);
  if (!share?.allowSubscriptions) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  const expectedToken = _models.ShareSubscription.generateConfirmToken(subscription);
  if (!(0, _crypto.safeEqual)(token, expectedToken)) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  if (subscription.isTokenExpired && !subscription.isConfirmed) {
    ctx.redirect(`${_env.default.URL}?notice=expired-token`);
    return;
  }
  subscription.confirmedAt = new Date();
  await subscription.save({
    transaction
  });
  let redirectUrl = share?.canonicalUrl ?? _env.default.URL;
  if (subscription.documentId && subscription.documentId !== share.documentId) {
    const doc = await _models.Document.findByPk(subscription.documentId);
    if (doc?.path) {
      redirectUrl = `${redirectUrl.replace(/\/$/, "")}${doc.path}`;
    }
  }
  ctx.redirect(`${redirectUrl}?notice=${_types.QueryNotices.Subscribed}`);
});
router.get("shares.unsubscribe", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerMinute), (0, _validate.default)(T.SharesUnsubscribeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    token,
    follow
  } = ctx.input.query;
  const {
    transaction
  } = ctx.state;

  // Anti-prefetch: prevent email clients from pre-fetching the link
  if (!follow) {
    return ctx.redirectOnClient(ctx.request.href + "&follow=true");
  }
  const subscription = await _models.ShareSubscription.findByPk(id, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  if (!subscription) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  const expectedToken = _models.ShareSubscription.generateUnsubscribeToken(subscription);
  if (!(0, _crypto.safeEqual)(token, expectedToken)) {
    ctx.redirect(`${_env.default.URL}?notice=invalid-auth`);
    return;
  }
  subscription.unsubscribedAt = new Date();
  await subscription.save({
    transaction
  });
  const share = await _models.Share.findByPk(subscription.shareId);
  const shareUrl = share?.canonicalUrl ?? _env.default.URL;
  ctx.redirect(`${shareUrl}?notice=${_types.QueryNotices.Unsubscribed}`);
});
var _default = exports.default = router;