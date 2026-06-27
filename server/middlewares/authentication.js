"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = auth;
exports.parseAuthentication = parseAuthentication;
var _compat = require("es-toolkit/compat");
var _UserRoleHelper = require("../../shared/utils/UserRoleHelper");
var _tracer = _interopRequireWildcard(require("../logging/tracer"));
var _models = require("../models");
var _types = require("../types");
var _jwt = require("../utils/jwt");
var _errors = require("../errors");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function auth() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return async function authMiddleware(ctx, next) {
    try {
      const {
        type,
        token,
        user,
        service,
        scope
      } = await validateAuthentication(ctx, options);
      await Promise.all([user.updateActiveAt(ctx), user.team?.updateActiveAt()]);
      ctx.state.auth = {
        user,
        token,
        type,
        service,
        scope
      };
      if (_tracer.default) {
        (0, _tracer.addTags)({
          "request.userId": user.id,
          "request.teamId": user.teamId,
          "request.authType": type
        }, (0, _tracer.getRootSpanFromRequestContext)(ctx));
      }
    } catch (err) {
      if (options.optional) {
        ctx.state.auth = {};
      } else {
        throw err;
      }
    }
    return next();
  };
}

/**
 * Parses the authentication token from the request context.
 *
 * @param ctx The application context containing the request information.
 * @returns An object containing the token and its transport method.
 */
function parseAuthentication(ctx) {
  const authorizationHeader = ctx.request.get("authorization");
  if (authorizationHeader) {
    const parts = authorizationHeader.split(" ");
    if (parts.length === 2) {
      const scheme = parts[0];
      const credentials = parts[1];
      if (/^Bearer$/i.test(scheme)) {
        return {
          token: credentials,
          transport: "header"
        };
      }
    } else {
      throw (0, _errors.AuthenticationError)(`Bad Authorization header format. Format is "Authorization: Bearer <token>"`);
    }
  } else if (ctx.request.body && typeof ctx.request.body === "object" && "token" in ctx.request.body) {
    return {
      token: String(ctx.request.body.token),
      transport: "body"
    };
  } else if (ctx.request.query?.token) {
    return {
      token: String(ctx.request.query.token),
      transport: "query"
    };
  } else {
    const accessToken = ctx.cookies.get("accessToken");
    if (accessToken) {
      return {
        token: accessToken,
        transport: "cookie"
      };
    }
  }
  return {
    token: undefined,
    transport: undefined
  };
}
async function validateAuthentication(ctx, options) {
  const {
    token,
    transport
  } = parseAuthentication(ctx);
  if (!token) {
    throw (0, _errors.AuthenticationError)("Authentication required");
  }
  let user;
  let type;
  let service;
  let scope;
  if (_models.OAuthAuthentication.match(token)) {
    if (transport !== "header") {
      throw (0, _errors.AuthenticationError)("OAuth access token must be passed in the Authorization header");
    }
    type = _types.AuthenticationType.OAUTH;
    let authentication;
    try {
      authentication = await _models.OAuthAuthentication.findByAccessToken(token, {
        rejectOnEmpty: true
      });
    } catch (_err) {
      throw (0, _errors.AuthenticationError)("Invalid access token");
    }
    if (!authentication) {
      throw (0, _errors.AuthenticationError)("Invalid access token");
    }
    if (authentication.accessTokenExpiresAt < new Date()) {
      throw (0, _errors.AuthenticationError)("Access token is expired");
    }
    if (!authentication.canAccess(ctx.originalUrl)) {
      throw (0, _errors.AuthorizationError)("Access token does not have access to this resource");
    }
    user = await _models.User.findByPk(authentication.userId, {
      include: [{
        model: _models.Team,
        as: "team",
        required: true
      }]
    });
    if (!user) {
      throw (0, _errors.AuthenticationError)("Invalid access token");
    }
    scope = authentication.scope;
    await authentication.updateActiveAt();
  } else if (_models.ApiKey.match(token)) {
    if (transport === "cookie") {
      throw (0, _errors.AuthenticationError)("API key must not be passed in the cookie");
    }
    type = _types.AuthenticationType.API;
    let apiKey;
    try {
      apiKey = await _models.ApiKey.findByToken(token);
    } catch (_err) {
      throw (0, _errors.AuthenticationError)("Invalid API key");
    }
    if (!apiKey) {
      throw (0, _errors.AuthenticationError)("Invalid API key");
    }
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw (0, _errors.AuthenticationError)("API key is expired");
    }
    if (!apiKey.canAccess(ctx.originalUrl)) {
      throw (0, _errors.AuthorizationError)("API key does not have access to this resource");
    }
    user = await _models.User.findByPk(apiKey.userId, {
      include: [{
        model: _models.Team,
        as: "team",
        required: true
      }]
    });
    if (!user) {
      throw (0, _errors.AuthenticationError)("Invalid API key");
    }
    scope = apiKey.scope ?? ["*"];
    await apiKey.updateActiveAt();
  } else {
    type = _types.AuthenticationType.APP;
    const result = await (0, _jwt.getUserForJWT)(token);
    user = result.user;
    service = result.service;
  }
  if (user.isSuspended) {
    const suspendingAdmin = user.suspendedById ? await _models.User.findByPk(user.suspendedById) : undefined;
    throw (0, _errors.UserSuspendedError)({
      adminEmail: suspendingAdmin?.email || undefined
    });
  }
  if (options.role && _UserRoleHelper.UserRoleHelper.isRoleLower(user.role, options.role)) {
    throw (0, _errors.AuthorizationError)(`${(0, _compat.capitalize)(options.role)} role required`);
  }
  if (options.type && (Array.isArray(options.type) ? !options.type.includes(type) : type !== options.type)) {
    throw (0, _errors.AuthorizationError)(`Invalid authentication type`);
  }
  return {
    user,
    type,
    token,
    service,
    scope
  };
}