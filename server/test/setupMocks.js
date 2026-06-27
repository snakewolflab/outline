"use strict";

var _vitest = require("vitest");
var _fs = require("../utils/fs");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); } // This file runs before the test environment is set up to ensure mocks are registered early.
// It prevents real Redis clients from being initialized during module imports.
// Pre-populate the requireDirectory cache used by @server/utils/fs so that
// tasks/processors/email-templates can be looked up via their pre-loaded
// modules instead of via Node's require(), which cannot resolve TypeScript
// files with aliased imports under Vitest. The eager globs intentionally
// exclude index.ts files (which call requireDirectory themselves and would
// recurse) and any files whose imports would themselves load the directory
// they live in.
(0, _fs.__setRequireDirectoryCache)("emails/templates", import.meta.glob(["../emails/templates/*.{js,ts,tsx}", "!**/index.*", "!**/*.test.*"], {
  eager: true
}));
(0, _fs.__setRequireDirectoryCache)("queues/processors", import.meta.glob(["../queues/processors/*.{js,ts,tsx}", "!**/index.*", "!**/*.test.*"], {
  eager: true
}));
(0, _fs.__setRequireDirectoryCache)("queues/tasks", import.meta.glob(["../queues/tasks/*.{js,ts,tsx}", "!**/index.*", "!**/*.test.*"], {
  eager: true
}));
_vitest.vi.mock("ioredis", async () => {
  const mod = await _vitest.vi.importActual("ioredis-mock");
  return mod;
});
_vitest.vi.mock("@server/utils/MutexLock");
_vitest.vi.mock("@aws-sdk/signature-v4-crt", () => ({}));

// Auto-mock these modules using the corresponding files under server/__mocks__/.
// Vitest requires an explicit vi.mock() call to wire them up.
_vitest.vi.mock("bull", () => Promise.resolve().then(() => _interopRequireWildcard(require("../__mocks__/bull"))));
_vitest.vi.mock("dd-trace", async () => {
  const mod = await Promise.resolve().then(() => _interopRequireWildcard(require("../__mocks__/dd-trace")));
  return {
    default: mod.mockTracer,
    ...mod
  };
});
_vitest.vi.mock("franc", () => Promise.resolve().then(() => _interopRequireWildcard(require("../__mocks__/franc"))));
_vitest.vi.mock("iso-639-3", () => Promise.resolve().then(() => _interopRequireWildcard(require("../__mocks__/iso-639-3"))));
_vitest.vi.mock("request-filtering-agent", () => Promise.resolve().then(() => _interopRequireWildcard(require("../__mocks__/request-filtering-agent"))));