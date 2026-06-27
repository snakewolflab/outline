"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderShare = exports.renderApp = void 0;
var _nodeFs = _interopRequireDefault(require("node:fs"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _nodeUtil = _interopRequireDefault(require("node:util"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("../../shared/types");
var _date = require("../../shared/utils/date");
var _env = _interopRequireDefault(require("../env"));
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _env2 = _interopRequireDefault(require("../presenters/env"));
var _passport = require("../utils/passport");
var _prefetchTags = _interopRequireDefault(require("../utils/prefetchTags"));
var _readManifestFile = _interopRequireDefault(require("../utils/readManifestFile"));
var _shareLoader = require("../commands/shareLoader");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const readFile = _nodeUtil.default.promisify(_nodeFs.default.readFile);
const entry = "app/index.tsx";
const viteHost = _env.default.URL.replace(`:${_env.default.PORT}`, ":3001");
let indexHtmlCache;

/**
 * Formats navigation tree children as markdown list items.
 *
 * @param children Array of navigation nodes
 * @param baseUrl Base URL for generating links
 * @returns Formatted markdown string
 */
function formatChildDocumentsAsMarkdown(children, baseUrl) {
  if (!children || children.length === 0) {
    return "";
  }
  const lines = children.map(child => {
    const url = baseUrl + child.url;
    return `- [${child.title}](${url})`;
  });
  return `\n\n---\n\n**Documents**\n\n${lines.join("\n")}`;
}
const readIndexFile = async () => {
  if (_env.default.isProduction || _env.default.isTest) {
    if (indexHtmlCache) {
      return indexHtmlCache;
    }
  }
  if (_env.default.isTest) {
    return await readFile(_nodePath.default.join(__dirname, "../static/index.html"));
  }
  if (_env.default.isDevelopment) {
    return await readFile(_nodePath.default.join(__dirname, "../../../server/static/index.html"));
  }
  return indexHtmlCache = await readFile(_nodePath.default.join(__dirname, "../../app/index.html"));
};
const renderApp = async function (ctx, next) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const {
    title = _env.default.APP_NAME,
    description = "A modern team knowledge base for your internal documentation, product specs, support answers, meeting notes, onboarding, &amp; more…",
    canonical = "",
    content = "",
    shortcutIcon = `${_env.default.CDN_URL || ""}/images/favicon-32.png`,
    allowIndexing = true
  } = options;
  if (ctx.request.path === "/realtime/") {
    return next();
  }
  if (!_env.default.isCloudHosted) {
    options.analytics?.forEach(integration => {
      if (integration.settings?.instanceUrl) {
        const parsed = new URL(integration.settings?.instanceUrl);
        const csp = ctx.response.get("Content-Security-Policy");
        ctx.set("Content-Security-Policy", csp.replace("script-src", `script-src ${parsed.host}`));
      }
    });
  }
  const {
    shareId
  } = ctx.params;
  const page = await readIndexFile();
  const environment = `
    <script nonce="${ctx.state.cspNonce}">
      window.env = ${JSON.stringify((0, _env2.default)(_env.default, options)).replace(/</g, "\\u003c")};
    </script>
  `;
  const scriptTags = _env.default.isProduction ? `<script type="module" nonce="${ctx.state.cspNonce}" src="${_env.default.CDN_URL || ""}/static/${(0, _readManifestFile.default)()[entry]["file"]}"></script>` : `<script type="module" nonce="${ctx.state.cspNonce}">
        import RefreshRuntime from "${viteHost}/static/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => { }
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <script type="module" nonce="${ctx.state.cspNonce}" src="${viteHost}/static/@vite/client"></script>
      <script type="module" nonce="${ctx.state.cspNonce}" src="${viteHost}/static/${entry}"></script>
    `;
  let headTags = `
    <meta name="robots" content="${allowIndexing ? "index, follow" : "noindex, nofollow"}" />
    <link rel="canonical" href="${(0, _compat.escape)(canonical)}" />
    <link
      rel="shortcut icon"
      type="image/png"
      href="${(0, _compat.escape)(shortcutIcon)}"
      sizes="32x32"
    />
    `;
  if (options.isShare) {
    headTags += `
    <link rel="sitemap" type="application/xml" href="/api/shares.sitemap?id=${(0, _compat.escape)(options.rootShareId || shareId)}">
    `;
  } else {
    headTags += _prefetchTags.default;
    headTags += `
    <link rel="manifest" href="/static/manifest.webmanifest" />
    <link
      rel="apple-touch-icon"
      type="image/png"
      href="${_env.default.CDN_URL ?? ""}/images/icon-maskable-192.png"
      sizes="192x192"
    />
    <link
      rel="apple-touch-icon"
      type="image/png"
      href="${_env.default.CDN_URL ?? ""}/images/icon-maskable-512.png"
      sizes="512x512"
    />
    <link
      rel="apple-touch-icon"
      type="image/png"
      href="${_env.default.CDN_URL ?? ""}/images/icon-maskable-1024.png"
      sizes="1024x1024"
    />
    <link
      rel="search"
      type="application/opensearchdescription+xml"
      href="/opensearch.xml"
      title="Outline"
    />
    `;
  }

  // Ensure no caching is performed
  ctx.response.set("Cache-Control", "no-cache, must-revalidate");
  ctx.response.set("Expires", "-1");
  ctx.body = page.toString().replace(/\{env\}/g, environment).replace(/\{lang\}/g, (0, _date.unicodeCLDRtoISO639)(_env.default.DEFAULT_LANGUAGE)).replace(/\{title\}/g, (0, _compat.escape)(title)).replace(/\{description\}/g, (0, _compat.escape)(description)).replace(/\{content\}/g, content).replace(/\{cdn-url\}/g, _env.default.CDN_URL || "").replace(/\{head-tags\}/g, headTags).replace(/\{slack-app-id\}/g, _env.default.public.SLACK_APP_ID || "").replace(/\{script-tags\}/g, scriptTags).replace(/\{csp-nonce\}/g, ctx.state.cspNonce);
};
exports.renderApp = renderApp;
const renderShare = async (ctx, next) => {
  const rootShareId = ctx.state?.rootShare?.id;
  const shareId = rootShareId ?? ctx.params.shareId;
  const collectionSlug = ctx.params.collectionSlug;
  const documentSlug = ctx.params.documentSlug;

  // Find the share record if published so that the document title can be returned
  // in the server-rendered HTML. This allows it to appear in unfurls more reliably.
  let share, collection, document, team;
  let analytics = [];
  let sharedTree;
  try {
    team = await (0, _passport.getTeamFromContext)(ctx, {
      includeOAuthState: false
    });
    const result = await (0, _shareLoader.loadPublicShare)({
      id: shareId,
      collectionId: collectionSlug,
      documentId: documentSlug,
      teamId: team?.id
    });
    share = result.share;
    collection = result.collection;
    document = result.document;
    sharedTree = result.sharedTree;
    if ((0, _isUUID.default)(shareId) && share?.urlId) {
      // Redirect temporarily because the url slug
      // can be modified by the user at any time
      ctx.redirect(share.canonicalUrl);
      ctx.status = 307;
      return;
    }
    analytics = await _models.Integration.findAll({
      where: {
        teamId: share.teamId,
        type: _types.IntegrationType.Analytics
      }
    });
    if (share && !ctx.userAgent.isBot) {
      await share.update({
        lastAccessedAt: new Date(),
        views: _sequelize.Sequelize.literal("views + 1")
      }, {
        hooks: false
      });
    }
  } catch (_err) {
    // If the share or document does not exist, return a 404.
    ctx.status = 404;
  }

  // If the client explicitly requests markdown and prefers it over HTML,
  // or the URL path ends with .md, return the document as markdown. This is
  // useful for LLMs and API clients.
  const acceptHeader = ctx.request.headers.accept || "";
  const prefersMarkdown = ctx.params.format === "md" || acceptHeader.includes("text/markdown") && ctx.accepts("text/markdown", "text/html") === "text/markdown";
  if (prefersMarkdown && (document || collection)) {
    let markdown = await _DocumentHelper.DocumentHelper.toMarkdown(document || collection, {
      includeTitle: true,
      signedUrls: 86400,
      // 24 hours
      teamId: team?.id
    });

    // Append child documents list if the share includes them
    if (share?.includeChildDocuments && sharedTree) {
      const node = document ? collection?.getDocumentTree(document.id) ?? sharedTree : sharedTree;
      if (node?.children?.length) {
        markdown += formatChildDocumentsAsMarkdown(node.children, share.canonicalUrl);
      }
    }
    ctx.type = "text/markdown";
    ctx.body = markdown;
    return;
  }

  // Allow shares to be embedded in iframes on other websites unless prevented by team preference
  const preventEmbedding = team?.getPreference(_types.TeamPreference.PreventDocumentEmbedding) ?? false;
  if (!preventEmbedding) {
    ctx.remove("X-Frame-Options");
  }
  const publicBranding = team?.getPreference(_types.TeamPreference.PublicBranding) ?? false;
  const title = document ? document.title : collection ? collection.name : publicBranding && team?.name ? team.name : undefined;
  const content = document || collection ? await _DocumentHelper.DocumentHelper.toHTML(document || collection, {
    includeStyles: false,
    includeHead: false,
    includeTitle: true,
    signedUrls: true
  }) : undefined;
  const canonicalUrl = share && share.canonicalUrl !== ctx.request.origin + ctx.request.url ? `${share.canonicalUrl}${documentSlug && document ? document.path : collectionSlug && collection ? collection.path : ""}` : undefined;

  // Inject share information in SSR HTML
  return renderApp(ctx, next, {
    title,
    description: document?.getSummary() || (publicBranding && team?.description ? team.description : undefined),
    content,
    shortcutIcon: publicBranding && team?.avatarUrl ? (await team.publicAvatarUrl()) ?? undefined : undefined,
    analytics,
    isShare: true,
    rootShareId,
    canonical: canonicalUrl,
    allowIndexing: share?.allowIndexing
  });
};
exports.renderShare = renderShare;