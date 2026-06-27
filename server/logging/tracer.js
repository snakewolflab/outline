"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addTags = addTags;
exports.default = void 0;
exports.getRootSpanFromRequestContext = getRootSpanFromRequestContext;
exports.setError = setError;
exports.setResource = setResource;
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/** Whether the error has been explicitly marked as non-reportable. */
function isExplicitlyNonReportable(error) {
  return "isReportable" in error && error.isReportable === false;
}
// dd-trace patches Node internals on require and is comparatively expensive to
// load, so it is kept off the startup path unless APM is actually enabled. When
// disabled we fall back to a no-op tracer that satisfies the surface consumed by
// callers (see tracing.ts) so they don't need to branch.
const noopSpan = {
  addTags: () => noopSpan,
  setTag: () => noopSpan,
  finish: () => undefined
};
let tracer;

// If the DataDog agent is installed and the DD_API_KEY environment variable is
// in the environment then we can safely attempt to start the DD tracer. This
// must happen before any instrumented module is imported.
if (_env.default.DD_API_KEY) {
  const ddTrace = require("dd-trace");
  tracer = ddTrace.default ?? ddTrace;
  tracer.init({
    version: _env.default.VERSION,
    service: _env.default.DD_SERVICE,
    env: _env.default.ENVIRONMENT,
    logInjection: true
  });

  // Disable per-middleware spans so that non-reportable errors are not captured
  // This is also generally excessive noise
  tracer.use("koa", {
    middleware: false
  });
} else {
  tracer = {
    scope: () => ({
      active: () => null,
      activate: (_span, fn) => fn()
    }),
    startSpan: () => noopSpan
  };
}
const getCurrentSpan = () => tracer.scope().active();

/**
 * Add tags to a span to have more context about how and why it was running.
 * If added to the root span, tags are searchable and filterable.
 *
 * @param tags An object with the tags to add to the span
 * @param span An optional span object to add the tags to. If none provided,the current span will be used.
 */
function addTags(tags, span) {
  if (tracer) {
    const currentSpan = span || getCurrentSpan();
    if (!currentSpan) {
      return;
    }
    currentSpan.addTags(tags);
  }
}

/**
 * The root span is an undocumented internal property that DataDog adds to `context.req`.
 * The root span is required in order to add searchable tags.
 * Unfortunately, there is no API to access the root span directly.
 * See: node_modules/dd-trace/src/plugins/util/web.js
 *
 * @param context A Koa context object
 */
function getRootSpanFromRequestContext(context) {
  // oxlint-disable-next-line no-undef
  return context?.req?._datadog?.span ?? null;
}

/**
 * Change the resource of the active APM span. This method wraps addTags to allow
 * safe use in environments where APM is disabled.
 *
 * @param name The name of the resource
 */
function setResource(name) {
  if (tracer) {
    addTags({
      "resource.name": `${name}`
    });
  }
}

/**
 * Mark the current active span as an error. This method wraps addTags to allow
 * safe use in environments where APM is disabled. Errors with isReportable set
 * to false are skipped.
 *
 * @param error The error to add to the current span.
 */
function setError(error, span) {
  if (isExplicitlyNonReportable(error)) {
    return;
  }
  if (tracer) {
    addTags({
      errorMessage: error.message,
      "error.type": error.name,
      "error.msg": error.message,
      "error.stack": error.stack
    }, span);
  }
}
var _default = exports.default = tracer;