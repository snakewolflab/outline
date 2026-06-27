"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _types = require("../types");
var _AuthenticationHelper;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class AuthenticationHelper {}
exports.default = AuthenticationHelper;
_AuthenticationHelper = AuthenticationHelper;
/**
 * The mapping of method names to their scopes, anything not listed here
 * defaults to `Scope.Write`.
 *
 * - `documents.create` -> `Scope.Create`
 * - `documents.list` -> `Scope.Read`
 * - `documents.info` -> `Scope.Read`
 */
_defineProperty(AuthenticationHelper, "methodToScope", {
  create: _types.Scope.Create,
  config: _types.Scope.Read,
  list: _types.Scope.Read,
  info: _types.Scope.Read,
  search: _types.Scope.Read,
  documents: _types.Scope.Read,
  drafts: _types.Scope.Read,
  viewed: _types.Scope.Read,
  export: _types.Scope.Read
});
/**
 * Matches exactly one of the supported scope grammars:
 *
 * - `*` — full wildcard
 * - `read` | `write` | `create` — global access scope
 * - `<namespace>:(read|write|create)` — namespaced access scope
 * - `/api/<namespace>.<method>` — route scope, namespace and method may be `*`
 */
_defineProperty(AuthenticationHelper, "scopeGrammarRegex", /^(\*|read|write|create|\w+:(read|write|create)|\/api\/(\*|\w+)\.(\*|\w+))$/);
/**
 * Returns whether the given string is a well-formed scope. Scopes that mix
 * route and namespaced forms (e.g. `/api/documents.list:read`) are rejected
 * to avoid ambiguity between validation and enforcement.
 *
 * @param scope The scope to validate
 * @param options.allowRootWildcard Whether scopes that grant access to every
 *   route (`*` and `/api/*.*`) should be considered valid. Defaults to true.
 * @returns true if the scope conforms to the supported grammar
 */
_defineProperty(AuthenticationHelper, "isValidScope", function (scope) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    allowRootWildcard = true
  } = options;
  if (!_AuthenticationHelper.scopeGrammarRegex.test(scope)) {
    return false;
  }
  if (!allowRootWildcard && (scope === "*" || scope === "/api/*.*")) {
    return false;
  }
  return true;
});
/**
 * Returns whether the given path can be accessed with any of the scopes. We
 * support scopes in the formats of:
 *
 * - `/api/namespace.method`
 * - `namespace:scope`
 * - `scope`
 *
 * Malformed scopes that do not match the supported grammar are ignored.
 *
 * @param path The path to check
 * @param scopes The scopes to check
 * @returns True if the path can be accessed
 */
_defineProperty(AuthenticationHelper, "canAccess", (path, scopes) => {
  // A wildcard scope grants full access (e.g. API key with no restrictions)
  if (scopes.includes("*")) {
    return true;
  }

  // strip any query string or fragment, these are never used as part of scope matching
  path = path.split("?")[0].split("#")[0];
  const resource = path.split("/").pop() ?? "";
  const [namespace, method] = resource.split(".");
  return scopes.some(scope => {
    if (!_AuthenticationHelper.isValidScope(scope)) {
      return false;
    }
    const [scopeNamespace, scopeMethod] = scope.match(/[:.]/g) ? scope.replace("/api/", "").split(/[:.]/g) : ["*", scope];
    const isRouteScope = scope.startsWith("/api/");
    if (isRouteScope) {
      return (namespace === scopeNamespace || scopeNamespace === "*") && (method === scopeMethod || scopeMethod === "*");
    }
    return (namespace === scopeNamespace || scopeNamespace === "*") && (scopeMethod === _types.Scope.Write || _AuthenticationHelper.methodToScope[method] === scopeMethod);
  });
});