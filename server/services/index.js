"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Services are lazily imported so that only the modules for the services
 * actually being run are loaded into memory. For example, a worker-only
 * process does not need to import the web or collaboration services and their
 * (often heavy) dependency trees.
 */
const services = {
  websockets: () => Promise.resolve().then(() => _interopRequireWildcard(require("./websockets"))),
  collaboration: () => Promise.resolve().then(() => _interopRequireWildcard(require("./collaboration"))),
  admin: () => Promise.resolve().then(() => _interopRequireWildcard(require("./admin"))),
  web: () => Promise.resolve().then(() => _interopRequireWildcard(require("./web"))),
  worker: () => Promise.resolve().then(() => _interopRequireWildcard(require("./worker"))),
  cron: () => Promise.resolve().then(() => _interopRequireWildcard(require("./cron")))
};
var _default = exports.default = services;