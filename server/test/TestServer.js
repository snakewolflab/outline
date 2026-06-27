"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeHttp = _interopRequireDefault(require("node:http"));
var _nodeFetch = _interopRequireDefault(require("node-fetch"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } // oxlint-disable-next-line no-restricted-imports
// oxlint-disable-next-line no-restricted-imports

const tokenCache = new WeakMap();
function getCachedSessionToken(user) {
  let token = tokenCache.get(user);
  if (!token) {
    token = user.getSessionToken();
    tokenCache.set(user, token);
  }
  return token;
}
function normalizeArgs(userOrOpts, maybeOpts) {
  if (userOrOpts && typeof userOrOpts.getSessionToken === "function") {
    return {
      user: userOrOpts,
      opts: maybeOpts ?? {}
    };
  }
  return {
    opts: userOrOpts ?? {}
  };
}
class TestServer {
  constructor(app) {
    _defineProperty(this, "server", void 0);
    _defineProperty(this, "listener", void 0);
    this.server = _nodeHttp.default.createServer(app.callback());
  }
  get address() {
    const {
      port
    } = this.server.address();
    return `http://localhost:${port}`;
  }
  listen() {
    if (!this.listener) {
      this.listener = new Promise((resolve, reject) => {
        this.server.listen(0, () => resolve()).on("error", err => reject(err));
      });
    }
    return this.listener;
  }
  fetch(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return this.listen().then(() => {
      const url = `${this.address}${path}`;
      const headers = {
        ...opts.headers
      };
      if (user && !headers.Authorization && !headers.authorization) {
        headers.Authorization = `Bearer ${getCachedSessionToken(user)}`;
      }
      let body = opts.body;
      const contentType = headers["Content-Type"] ?? headers["content-type"];
      // automatic JSON encoding
      if (!contentType && typeof body === "object" && body !== null) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(body);
      }
      return (0, _nodeFetch.default)(url, {
        ...opts,
        headers,
        body: body
      });
    });
  }
  close() {
    this.listener = null;
    this.server.closeAllConnections();
    this.server.close();
  }
  delete(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "DELETE"
    }) : this.fetch(path, {
      ...opts,
      method: "DELETE"
    });
  }
  get(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "GET"
    }) : this.fetch(path, {
      ...opts,
      method: "GET"
    });
  }
  head(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "HEAD"
    }) : this.fetch(path, {
      ...opts,
      method: "HEAD"
    });
  }
  options(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "OPTIONS"
    }) : this.fetch(path, {
      ...opts,
      method: "OPTIONS"
    });
  }
  patch(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "PATCH"
    }) : this.fetch(path, {
      ...opts,
      method: "PATCH"
    });
  }
  post(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "POST"
    }) : this.fetch(path, {
      ...opts,
      method: "POST"
    });
  }
  put(path, userOrOpts, maybeOpts) {
    const {
      user,
      opts
    } = normalizeArgs(userOrOpts, maybeOpts);
    return user ? this.fetch(path, user, {
      ...opts,
      method: "PUT"
    }) : this.fetch(path, {
      ...opts,
      method: "PUT"
    });
  }
}
var _default = exports.default = TestServer;