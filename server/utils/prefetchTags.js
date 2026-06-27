"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var React = _interopRequireWildcard(require("react"));
var _server = _interopRequireDefault(require("react-dom/server"));
var _env = _interopRequireDefault(require("../env"));
var _readManifestFile = _interopRequireDefault(require("./readManifestFile"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const prefetchTags = [];
if (_env.default.FILE_STORAGE === "s3") {
  if (_env.default.AWS_S3_ACCELERATE_URL) {
    prefetchTags.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("link", {
      rel: "preconnect",
      href: _env.default.AWS_S3_ACCELERATE_URL
    }, _env.default.AWS_S3_ACCELERATE_URL));
  } else if (_env.default.AWS_S3_UPLOAD_BUCKET_URL) {
    prefetchTags.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("link", {
      rel: "preconnect",
      href: _env.default.AWS_S3_UPLOAD_BUCKET_URL
    }, _env.default.AWS_S3_UPLOAD_BUCKET_URL));
  }
}
if (_env.default.CDN_URL) {
  prefetchTags.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("link", {
    rel: "preconnect",
    href: _env.default.CDN_URL
  }, _env.default.CDN_URL));
}
if (_env.default.isProduction) {
  const manifest = (0, _readManifestFile.default)();
  const returnFileAndImportsFromManifest = (manifestStructure, file) => {
    const chunk = manifestStructure[file];
    if (!chunk) {
      return [];
    }
    return [chunk.file, ...(chunk.imports ?? []).map(entry => manifestStructure[entry]?.file).filter(entry => Boolean(entry))];
  };
  Array.from([...returnFileAndImportsFromManifest(manifest, "app/index.tsx"), ...returnFileAndImportsFromManifest(manifest, "app/editor/index.tsx")]).forEach(file => {
    if (file.endsWith(".js")) {
      prefetchTags.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("link", {
        rel: "prefetch",
        href: `${_env.default.CDN_URL || ""}/static/${file}`,
        as: "script",
        crossOrigin: "anonymous"
      }, file));
    } else if (file.endsWith(".css")) {
      prefetchTags.push(/*#__PURE__*/(0, _jsxRuntime.jsx)("link", {
        rel: "prefetch",
        href: `${_env.default.CDN_URL || ""}/static/${file}`,
        as: "style",
        crossOrigin: "anonymous"
      }, file));
    }
  });
}
var _default = exports.default = _server.default.renderToString(/*#__PURE__*/(0, _jsxRuntime.jsx)(_jsxRuntime.Fragment, {
  children: prefetchTags
}));