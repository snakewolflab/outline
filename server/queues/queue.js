"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createQueue = createQueue;
var _bull = _interopRequireDefault(require("bull"));
var _compat = require("es-toolkit/compat");
var _error = require("../../shared/utils/error");
var _time = require("../../shared/utils/time");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _Metrics = _interopRequireDefault(require("../logging/Metrics"));
var _redis = _interopRequireDefault(require("../storage/redis"));
var _ShutdownHelper = _interopRequireWildcard(require("../utils/ShutdownHelper"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* oxlint-disable @typescript-eslint/no-misused-promises */

function createQueue(name, defaultJobOptions) {
  const prefix = `queue.${(0, _compat.snakeCase)(name)}`;

  // Notes on reusing Redis connections for Bull:
  // https://github.com/OptimalBits/bull/blob/b6d530f72a774be0fd4936ddb4ad9df3b183f4b6/PATTERNS.md#reusing-redis-connections
  const queue = new _bull.default(name, {
    createClient(type) {
      switch (type) {
        case "client":
          return _redis.default.defaultClient;
        case "subscriber":
          return _redis.default.defaultSubscriber;
        case "bclient":
          return new _redis.default(_env.default.REDIS_URL, {
            maxRetriesPerRequest: null,
            connectionNameSuffix: "bull"
          });
        default:
          throw new Error(`Unexpected connection type: ${String(type)}`);
      }
    },
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: true,
      ...defaultJobOptions
    }
  });
  queue.on("stalled", () => {
    _Metrics.default.increment(`${prefix}.jobs.stalled`);
  });
  queue.on("completed", () => {
    _Metrics.default.increment(`${prefix}.jobs.completed`);
  });
  queue.on("error", () => {
    _Metrics.default.increment(`${prefix}.jobs.errored`);
  });
  queue.on("failed", (job, err) => {
    _Metrics.default.increment(`${prefix}.jobs.failed`);

    // Report on the final attempt to avoid noise from intermediate retries.
    const attempts = job?.opts?.attempts ?? 1;
    if ((job?.attemptsMade ?? 0) + 1 >= attempts) {
      _Logger.default.error(`Job failed in ${name} queue`, (0, _error.toError)(err), {
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        data: job?.data
      });
    }
  });
  if (_env.default.ENVIRONMENT !== "test") {
    setInterval(async () => {
      _Metrics.default.gauge(`${prefix}.count`, await queue.count());
      _Metrics.default.gauge(`${prefix}.delayed_count`, await queue.getDelayedCount());
    }, 5 * _time.Second.ms);
  }
  _ShutdownHelper.default.add(name, _ShutdownHelper.ShutdownOrder.normal, async () => {
    await queue.close();
  });
  return queue;
}