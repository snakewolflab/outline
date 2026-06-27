"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _koa = _interopRequireDefault(require("koa"));
var _koaCompress = _interopRequireDefault(require("koa-compress"));
var _koaHelmet = require("koa-helmet");
var _koaMount = _interopRequireDefault(require("koa-mount"));
var _koaSslify = _interopRequireWildcard(require("koa-sslify"));
var _time = require("../../shared/utils/time");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _Metrics = _interopRequireDefault(require("../logging/Metrics"));
var _csp = _interopRequireDefault(require("../middlewares/csp"));
var _csrf = require("../middlewares/csrf");
var _ShutdownHelper = _interopRequireWildcard(require("../utils/ShutdownHelper"));
var _i18n = require("../utils/i18n");
var _routes = _interopRequireDefault(require("../routes"));
var _api = _interopRequireDefault(require("../routes/api"));
var _auth = _interopRequireDefault(require("../routes/auth"));
var _mcp = _interopRequireDefault(require("../routes/mcp"));
var _oauth = _interopRequireDefault(require("../routes/oauth"));
var _koaUseragent = _interopRequireDefault(require("koa-useragent"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* oxlint-disable @typescript-eslint/no-var-requires */

function init() {
  let app = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new _koa.default();
  let server = arguments.length > 1 ? arguments[1] : undefined;
  void (0, _i18n.initI18n)();
  if (_env.default.isProduction) {
    // Trust the X-Forwarded-* headers set by an upstream proxy, eg
    // X-Forwarded-For. Defaults to true, but can be disabled with
    // PROXY_HEADERS_TRUSTED when the app is reachable directly.
    if (_env.default.PROXY_HEADERS_TRUSTED) {
      app.proxy = true;
      if (_env.default.PROXY_IP_HEADER) {
        app.proxyIpHeader = _env.default.PROXY_IP_HEADER;
      }
    }

    // Force redirect to HTTPS protocol unless explicitly disabled
    if (_env.default.FORCE_HTTPS) {
      app.use((0, _koaSslify.default)({
        resolver: ctx => {
          if ((0, _koaSslify.httpsResolver)(ctx)) {
            return true;
          }
          // Only honor X-Forwarded-Proto when proxy headers are trusted
          return _env.default.PROXY_HEADERS_TRUSTED ? (0, _koaSslify.xForwardedProtoResolver)(ctx) : false;
        }
      }));
    } else {
      _Logger.default.warn("Enforced https was disabled with FORCE_HTTPS env variable");
    }
  }

  // Make `ctx.userAgent` available
  app.use(_koaUseragent.default);
  app.use((0, _koaCompress.default)());

  // Monitor server connections
  if (server) {
    setInterval(() => {
      server.getConnections((err, count) => {
        if (err) {
          return;
        }
        _Metrics.default.gaugePerInstance("connections.count", count);
      });
    }, 5 * _time.Second.ms);
  }
  _ShutdownHelper.default.add("connections", _ShutdownHelper.ShutdownOrder.normal, async () => {
    _Metrics.default.gaugePerInstance("connections.count", 0);
  });
  app.use((0, _koaMount.default)("/api", _api.default));
  app.use((0, _koaMount.default)("/mcp", _mcp.default));

  // Generate and attach a CSRF token to the session on non-API requests
  app.use((0, _csrf.attachCSRFToken)());

  // Apply CSP middleware after API as these responses are rendered in the browser
  app.use((0, _csp.default)());

  // Allow DNS prefetching for performance, we do not care about leaking requests
  // to our own CDN's
  app.use((0, _koaHelmet.dnsPrefetchControl)({
    allow: true
  }));
  app.use((0, _koaHelmet.referrerPolicy)({
    policy: "no-referrer"
  }));
  app.use((0, _koaMount.default)("/auth", _auth.default));
  app.use((0, _koaMount.default)("/oauth", _oauth.default));
  app.use((0, _koaMount.default)(_routes.default));
  return app;
}