"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.requestErrorHandler = requestErrorHandler;
var Sentry = _interopRequireWildcard(require("@sentry/node"));
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
if (_env.default.SENTRY_DSN) {
  Sentry.init({
    dsn: _env.default.SENTRY_DSN,
    environment: _env.default.ENVIRONMENT,
    release: _env.default.RELEASE,
    maxBreadcrumbs: 0,
    ignoreErrors: [
    // These errors are expected in normal running of the application and
    // don't need to be reported.
    // Validation
    "BadRequestError", "SequelizeValidationError", "SequelizeEmptyResultError", "ValidationError", "ForbiddenError",
    // Authentication
    "UnauthorizedError", "TeamDomainRequiredError", "GmailAccountCreationError", "AuthRedirectError", "UserSuspendedError", "TooManyRequestsError",
    // Client disconnects
    "Premature close"],
    beforeSend(event) {
      try {
        switch (event.level) {
          case "warning":
            // Sample warnings to reduce noise
            if (Math.random() < 0.1) {
              return null;
            }
            break;
        }
        return event;
      } catch (_) {
        return event;
      }
    }
  });
}

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
function requestErrorHandler(error, ctx) {
  // we don't need to report every time a request stops to the bug tracker
  if (error.code === "EPIPE" || error.code === "ECONNRESET") {
    return;
  }
  if (_env.default.SENTRY_DSN) {
    Sentry.withScope(function (scope) {
      const requestId = ctx.headers["x-request-id"];
      if (requestId) {
        scope.setTag("request_id", requestId);
      }
      const authType = ctx.state?.auth?.type ?? undefined;
      if (authType) {
        scope.setTag("auth_type", authType);
      }
      const teamId = ctx.state?.auth?.user?.teamId ?? undefined;
      if (teamId) {
        scope.setTag("team_id", teamId);
      }
      const userId = ctx.state?.auth?.user?.id ?? undefined;
      if (userId) {
        scope.setUser({
          id: userId
        });
      }
      scope.setSDKProcessingMetadata({
        request: ctx.req
      });
      Sentry.captureException(error);
    });
  } else if (_env.default.ENVIRONMENT !== "test") {
    // oxlint-disable-next-line no-console
    console.error(error);
  }
}
var _default = exports.default = Sentry;