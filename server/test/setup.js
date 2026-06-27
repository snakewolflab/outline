"use strict";

require("reflect-metadata");
var _nodeEvents = require("node:events");
var _vitest = require("vitest");
var _env = _interopRequireDefault(require("../../shared/env"));
var _env2 = _interopRequireDefault(require("../env"));
var _msw = require("./msw");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
(0, _vitest.beforeAll)(() => _msw.server.listen({
  onUnhandledRequest: "error"
}));
(0, _vitest.afterEach)(() => _msw.server.resetHandlers());
(0, _vitest.afterAll)(() => _msw.server.close());

// Increase the default max listeners for EventEmitter to prevent warnings in tests
// This needs to be done before any modules that use EventEmitter are loaded
_nodeEvents.EventEmitter.defaultMaxListeners = 100;

// Mock AWS SDK S3 client and related commands
_vitest.vi.mock("@aws-sdk/client-s3", () => ({
  S3Client: _vitest.vi.fn(() => ({
    send: _vitest.vi.fn()
  })),
  DeleteObjectCommand: _vitest.vi.fn(),
  GetObjectCommand: _vitest.vi.fn(),
  ObjectCannedACL: {}
}));
_vitest.vi.mock("@aws-sdk/lib-storage", () => ({
  Upload: _vitest.vi.fn(() => ({
    done: _vitest.vi.fn()
  }))
}));
_vitest.vi.mock("@aws-sdk/s3-presigned-post", () => ({
  createPresignedPost: _vitest.vi.fn()
}));
_vitest.vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: _vitest.vi.fn()
}));

// Initialize the database models. Loaded dynamically so the
// EventEmitter.defaultMaxListeners assignment above runs first; static imports
// would be hoisted ahead of it.
await Promise.resolve().then(() => _interopRequireWildcard(require("../storage/database")));

// Eagerly load plugin server entry points so that PluginManager.getHooks()
// returns the registered plugins. Vitest does not support require() of TS
// files with bare imports (e.g. `@server/...`), so we use Vite's
// import.meta.glob to load them through the Vite resolver instead.
const {
  PluginManager
} = await Promise.resolve().then(() => _interopRequireWildcard(require("../utils/PluginManager")));
const pluginModules = import.meta.glob(["../../plugins/*/server/*.{js,ts}", "!**/*.test.*", "!**/schema.*"], {
  eager: true
});
void pluginModules;
// Mark as loaded so PluginManager.loadPlugins() (which uses require()) is a
// no-op during tests.
PluginManager.loaded = true;
(0, _vitest.beforeEach)(() => {
  _env2.default.URL = _env.default.URL = "https://app.outline.dev";
});