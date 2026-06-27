"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koa = _interopRequireDefault(require("koa"));
var _koaBody = _interopRequireDefault(require("koa-body"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _mcp = require("@modelcontextprotocol/sdk/server/mcp.js");
var _streamableHttp = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var _types = require("@modelcontextprotocol/sdk/types.js");
var _error = require("../../../shared/utils/error");
var _types2 = require("../../../shared/types");
var _errors = require("../../errors");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
var _authentication = _interopRequireDefault(require("../../middlewares/authentication"));
var _rateLimiter = require("../../middlewares/rateLimiter");
var _requestTracer = _interopRequireDefault(require("../../middlewares/requestTracer"));
var _User = require("../../models/User");
var _types3 = require("../../types");
var _RateLimiter = require("../../utils/RateLimiter");
var _attachments = require("../../tools/attachments");
var _collections = require("../../tools/collections");
var _comments = require("../../tools/comments");
var _documents = require("../../tools/documents");
var _fetch = require("../../tools/fetch");
var _templates = require("../../tools/templates");
var _users = require("../../tools/users");
var _package = require("../../../package.json");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const app = new _koa.default();
const router = new _koaRouter.default();

// RFC 9728 / MCP auth spec: 401 responses from the /mcp endpoint must include
// a WWW-Authenticate header pointing at the OAuth protected resource metadata
// document so clients can bootstrap the authorization flow via discovery.
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (typeof err === "object" && err !== null && err.status === 401) {
      const headersHost = err;
      const existingHeaders = headersHost.headers ?? {};
      const hasWwwAuth = Object.keys(existingHeaders).some(k => k.toLowerCase() === "www-authenticate");
      if (!hasWwwAuth) {
        const origin = _env.default.isCloudHosted ? ctx.request.URL.origin : new URL(_env.default.URL).origin;
        headersHost.headers = {
          ...existingHeaders,
          "WWW-Authenticate": `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`
        };
      }
    }
    throw err;
  }
});
const defaultInstructions = `Document markdown content must not begin with a top-level heading (H1) — the title is stored as a separate field, so set it via the title parameter and start the content with body text or a lower-level heading instead.

Document and collection markdown support @mentions using the syntax: @[Display Name](mention://user/userId). For example: @[John Doe](mention://user/c9a1b2e3-...). Use the "list_users" tool to find user IDs.

Read images and attachments with the "fetch" tool by setting resource to "attachment" and passing either the attachment ID or an /api/attachments.redirect?id=... URL; the tool will return a signed URL for download.

When asked to create a document that follows a template, use the "list_templates" tool to find a matching template; each result already includes the template body as markdown. To use it unchanged, pass its ID as templateId to "create_document" and the new document is pre-filled from it. To adapt it first, modify the returned body and pass the result as the text parameter to "create_document". Either way no separate fetch is needed.`;

/**
 * Creates a fresh MCP server instance with tools filtered by the OAuth
 * scopes granted to the current token.
 *
 * @param scopes - the OAuth scopes granted to the access token.
 * @param guidance - optional workspace guidance to append to default instructions.
 * @returns a configured McpServer ready to be connected to a transport.
 */
function createMcpServer(scopes, guidance) {
  const instructions = guidance ? `${defaultInstructions}\n\n${guidance}` : defaultInstructions;
  const server = new _mcp.McpServer({
    name: "outline",
    version: _package.version
  }, {
    capabilities: {
      tools: {}
    },
    instructions
  });
  (0, _attachments.attachmentTools)(server, scopes);
  (0, _collections.collectionTools)(server, scopes);
  (0, _comments.commentTools)(server, scopes);
  (0, _documents.documentTools)(server, scopes);
  (0, _fetch.fetchTool)(server, scopes);
  (0, _templates.templateTools)(server, scopes);
  (0, _users.userTools)(server, scopes);
  return server;
}
router.post("/", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneThousandPerHour), (0, _authentication.default)({
  type: [_types3.AuthenticationType.MCP, _types3.AuthenticationType.OAUTH, _types3.AuthenticationType.API]
}), async ctx => {
  const {
    user,
    token,
    scope
  } = ctx.state.auth;
  if (!user.team.getPreference(_types2.TeamPreference.MCP)) {
    throw (0, _errors.NotFoundError)();
  }
  user.setFlag(_User.UserFlag.MCP);
  await user.save({
    hooks: false
  });
  const server = createMcpServer(scope ?? [], user.team.guidanceMCP ?? undefined);
  const transport = new _streamableHttp.StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  // onerror fires for client-side 4xx conditions (bad Accept header, etc)
  // which the transport already answers with an HTTP error — warn keeps
  // visibility without reporting client mistakes to Sentry.
  transport.onerror = error => {
    _Logger.default.warn("MCP transport error", error);
  };
  await server.connect(transport);

  // Attach auth info to the raw request so the MCP transport
  // passes it through as `extra.authInfo` to tool handlers.
  ctx.req.auth = {
    token,
    clientId: "",
    scopes: scope ?? [],
    extra: {
      user,
      scope: scope ?? [],
      ip: ctx.request.ip
    }
  };
  ctx.respond = false;

  // The SDK's handleRequest answers known protocol failures itself (4xx with a
  // JSON-RPC body) via the transport. Anything that escapes here is unexpected.
  try {
    await transport.handleRequest(ctx.req, ctx.res, ctx.request.body);
  } catch (error) {
    _Logger.default.error("MCP request handling failed", (0, _error.toError)(error), undefined, ctx.req);
    if (!ctx.res.headersSent) {
      ctx.res.writeHead(500, {
        "Content-Type": "application/json"
      });
      ctx.res.end(JSON.stringify({
        jsonrpc: "2.0",
        error: {
          code: _types.ErrorCode.InternalError,
          message: "Internal server error"
        },
        id: null
      }));
    } else {
      ctx.res.end();
    }
  }
});
router.get("/", async ctx => {
  ctx.status = 405;
  ctx.set("Allow", "POST");
  ctx.body = {
    error: "Method not allowed. Use POST for MCP requests."
  };
});
router.delete("/", async ctx => {
  ctx.status = 405;
  ctx.set("Allow", "POST");
  ctx.body = {
    error: "Method not allowed. Use POST for MCP requests."
  };
});
app.use((0, _requestTracer.default)());
app.use((0, _koaBody.default)());
app.use(router.routes());
var _default = exports.default = app;