"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _dateFns = require("date-fns");
var _koa = _interopRequireDefault(require("koa"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _koaSend = _interopRequireDefault(require("koa-send"));
var _i18n = require("../../shared/i18n");
var _types = require("../../shared/types");
var _domains = require("../../shared/utils/domains");
var _time = require("../../shared/utils/time");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _shareDomains = _interopRequireDefault(require("../middlewares/shareDomains"));
var _models = require("../models");
var _opensearch = require("../utils/opensearch");
var _passport = require("../utils/passport");
var _robots = require("../utils/robots");
var _url = require("../utils/url");
var _apexRedirect = _interopRequireDefault(require("../middlewares/apexRedirect"));
var _app = require("./app");
var _embeds = require("./embeds");
var _errors2 = _interopRequireDefault(require("./errors"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const koa = new _koa.default();
const router = new _koaRouter.default();

// serve public assets
router.use(["/images/*", "/email/*", "/fonts/*"], async (ctx, next) => {
  let done;
  if (ctx.method === "HEAD" || ctx.method === "GET") {
    try {
      done = await (0, _koaSend.default)(ctx, ctx.path, {
        root: _nodePath.default.resolve(__dirname, "../../../public"),
        // 7 day expiry, these assets are mostly static but do not contain a hash
        maxAge: _time.Day.ms * 7,
        setHeaders: res => {
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      });
    } catch (err) {
      if (!(err instanceof Error && "status" in err && err.status === 404)) {
        throw err;
      }
    }
  }
  if (!done) {
    await next();
  }
});
router.use(["/share/:shareId", "/share/:shareId/doc/:documentSlug", "/share/:shareId/*"], ctx => {
  const redirectPath = ctx.path.replace(/^\/share/, "/s");
  ctx.redirect(redirectPath + ctx.request.URL.search);
  ctx.status = 301;
});
if (_env.default.isProduction) {
  router.get("/static/*", async ctx => {
    try {
      const pathname = ctx.path.substring(8);
      if (!pathname) {
        throw (0, _errors.NotFoundError)();
      }
      await (0, _koaSend.default)(ctx, pathname, {
        root: _nodePath.default.join(__dirname, "../../app/"),
        // Hashed static assets get 1 year expiry plus immutable flag
        maxAge: _time.Day.ms * 365,
        immutable: true,
        setHeaders: res => {
          res.setHeader("Service-Worker-Allowed", "/");
          res.setHeader("Access-Control-Allow-Origin", "*");
        }
      });
    } catch (err) {
      if (err instanceof Error && "status" in err && err.status === 404) {
        // Serve a bad request instead of not found if the file doesn't exist
        // This prevents CDN's from caching the response, allowing them to continue
        // serving old file versions
        ctx.status = 400;
        return;
      }
      throw err;
    }
  });
}
router.get("/locales/:lng.json", async ctx => {
  const {
    lng
  } = ctx.params;
  if (!_i18n.languages.includes(lng)) {
    ctx.status = 404;
    return;
  }
  await (0, _koaSend.default)(ctx, _nodePath.default.join(lng, "translation.json"), {
    setHeaders: (res, _, stats) => {
      res.setHeader("Last-Modified", (0, _dateFns.formatRFC7231)(stats.mtime));
      res.setHeader("Cache-Control", `public, max-age=${7 * _time.Day.seconds}`);
      res.setHeader("ETag", _nodeCrypto.default.createHash("md5").update(stats.mtime.toISOString()).digest("hex"));
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
    root: _nodePath.default.join(__dirname, "../../shared/i18n/locales")
  });
});
router.get(["/.well-known/oauth-authorization-server", "/.well-known/oauth-authorization-server/mcp"], async ctx => {
  // Use the configured URL for self-hosted deployments to preserve the port when behind
  // a reverse proxy that may strip the port from the Host header.
  const origin = _env.default.isCloudHosted ? ctx.request.URL.origin : new URL(_env.default.URL).origin;
  const team = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });
  const mcpEnabled = team?.getPreference(_types.TeamPreference.MCP) ?? true;
  ctx.body = {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    revocation_endpoint: `${origin}/oauth/revoke`,
    ...(!_env.default.OAUTH_DISABLE_DCR && mcpEnabled && {
      registration_endpoint: `${origin}/oauth/register`
    }),
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
    code_challenge_methods_supported: ["S256"],
    scopes_supported: ["read", "write"]
  };
});
router.get(["/.well-known/oauth-protected-resource", "/.well-known/oauth-protected-resource/mcp"], async ctx => {
  const team = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });
  const mcpEnabled = team?.getPreference(_types.TeamPreference.MCP) ?? true;
  if (!mcpEnabled) {
    ctx.status = 404;
    return;
  }

  // Use the configured URL for self-hosted deployments to preserve the port when behind
  // a reverse proxy that may strip the port from the Host header.
  const origin = _env.default.isCloudHosted ? ctx.request.URL.origin : new URL(_env.default.URL).origin;
  ctx.body = {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    scopes_supported: ["read", "write"],
    bearer_methods_supported: ["header"]
  };
});
router.get("/robots.txt", ctx => {
  ctx.body = (0, _robots.robotsResponse)();
});
router.get("/opensearch.xml", ctx => {
  ctx.type = "text/xml";
  ctx.response.set("Cache-Control", `public, max-age=${7 * _time.Day.seconds}`);
  ctx.body = (0, _opensearch.opensearchResponse)(ctx.request.URL.origin);
});
router.get("/s/:shareId.:format", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId/doc/:documentSlug.:format", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId/doc/:documentSlug", (0, _shareDomains.default)(), _app.renderShare);
router.get("/s/:shareId/*", (0, _shareDomains.default)(), _app.renderShare);
router.get("/embeds/gitlab", _embeds.renderEmbed);
router.get("/embeds/github", _embeds.renderEmbed);
router.get("/embeds/dropbox", _embeds.renderEmbed);
router.get("/embeds/pinterest", _embeds.renderEmbed);
router.use((0, _shareDomains.default)());
router.get("/doc/:documentSlug", async (ctx, next) => {
  if (ctx.state?.rootShare) {
    return (0, _app.renderShare)(ctx, next);
  }
  return next();
});
router.get("/sitemap.xml", async ctx => {
  if (ctx.state?.rootShare) {
    ctx.redirect(`/api/shares.sitemap?id=${ctx.state?.rootShare.id}`);
  } else {
    ctx.status = 404;
  }
});

// catch all for application
router.get("*", async (ctx, next) => {
  if ((0, _url.isInvalidAppPath)(ctx.path)) {
    ctx.status = 404;
    return;
  }
  if (ctx.state?.rootShare) {
    // Only allow root path for root share domains, return 404 for other paths.
    // Valid paths like /doc/:documentSlug and /sitemap.xml are handled above.
    if (ctx.path !== "/") {
      ctx.status = 404;
      return;
    }
    return (0, _app.renderShare)(ctx, next);
  }
  const team = await (0, _passport.getTeamFromContext)(ctx);
  if (_env.default.isCloudHosted) {
    // Redirect to main domain if no team is found
    if (!team || team.isSuspended) {
      if (_env.default.isProduction && ctx.hostname !== (0, _domains.parseDomain)(_env.default.URL).host) {
        ctx.redirect(_env.default.URL);
        return;
      }
    }

    // Redirect all requests to custom domain if one is set
    else if (team?.domain) {
      if (team.domain !== ctx.hostname) {
        ctx.redirect(ctx.href.replace(ctx.hostname, team.domain));
        return;
      }
    }

    // Redirect if subdomain is not the current team's subdomain
    else if (team?.subdomain) {
      const {
        teamSubdomain
      } = (0, _domains.parseDomain)(ctx.href);
      if (team?.subdomain !== teamSubdomain) {
        ctx.redirect(ctx.href.replace(`//${teamSubdomain}.`, `//${team.subdomain}.`));
        return;
      }
    }
  }
  const analytics = team ? await _models.Integration.findAll({
    where: {
      teamId: team.id,
      type: _types.IntegrationType.Analytics
    }
  }) : [];
  const publicBranding = team?.getPreference(_types.TeamPreference.PublicBranding) ?? false;
  return (0, _app.renderApp)(ctx, next, {
    title: publicBranding && team?.name ? team.name : undefined,
    description: publicBranding && team?.description ? team.description : undefined,
    analytics,
    shortcutIcon: publicBranding && team?.avatarUrl ? team.avatarUrl : undefined
  });
});

// In order to report all possible performance metrics to Sentry this header
// must be provided when serving the application, see:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin
const timingOrigins = [_env.default.URL];
if (_env.default.SENTRY_DSN) {
  timingOrigins.push("https://sentry.io");
}
koa.use(async (ctx, next) => {
  ctx.set("Timing-Allow-Origin", timingOrigins.join(", "));
  await next();
});
koa.use((0, _apexRedirect.default)());
if (_env.default.ENVIRONMENT === "test") {
  koa.use(_errors2.default.routes());
}
koa.use(router.routes());
var _default = exports.default = koa;