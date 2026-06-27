"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _ioredis = _interopRequireDefault(require("ioredis"));
var _compat = require("es-toolkit/compat");
var _error = require("../../shared/utils/error");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _utils = require("./utils");
var _RedisAdapter;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const defaultOptions = {
  maxRetriesPerRequest: 20,
  enableReadyCheck: false,
  showFriendlyErrorStack: _env.default.isDevelopment,
  keepAlive: 10000,
  retryStrategy(times) {
    if (times === 1) {
      _Logger.default.info("lifecycle", `Retrying redis connection: attempt ${times}`);
    } else {
      _Logger.default.warn(`Retrying redis connection: attempt ${times}`);
    }
    return Math.min(times * 500, 3000);
  },
  reconnectOnError(err) {
    return err.message.includes("READONLY");
  },
  // support Heroku Redis, see:
  // https://devcenter.heroku.com/articles/heroku-redis#ioredis-module
  tls: (_env.default.REDIS_URL || "").startsWith("rediss://") ? {
    rejectUnauthorized: false
  } : undefined
};
class RedisAdapter extends _ioredis.default {
  constructor(url) {
    let {
      connectionNameSuffix,
      ...options
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const connectionName = (0, _utils.getConnectionName)(connectionNameSuffix);
    if (!url || !url.startsWith("ioredis://")) {
      super(url || _env.default.REDIS_URL || "", (0, _compat.defaults)(options, {
        connectionName
      }, defaultOptions));
    } else {
      let customOptions = {};
      try {
        const decodedString = Buffer.from(url.slice(10), "base64").toString();
        customOptions = JSON.parse(decodedString);
      } catch (error) {
        const message = (0, _error.errToString)(error);
        throw new Error(`Failed to decode redis adapter options: ${message}`);
      }
      try {
        super((0, _compat.defaults)(options, {
          connectionName
        }, customOptions, defaultOptions));
      } catch (error) {
        const message = (0, _error.errToString)(error);
        throw new Error(`Failed to initialize redis client: ${message}`);
      }
    }

    // More than the default of 10 listeners is expected for the amount of queues
    // we're running. Increase the max here to prevent a warning in the console:
    // https://github.com/OptimalBits/bull/issues/1192
    this.setMaxListeners(100);
    this.on("error", err => {
      if (err.name === "MaxRetriesPerRequestError") {
        _Logger.default.fatal("Redis maximum retries exceeded", err);
      } else {
        _Logger.default.error("Redis error", err);
      }
    });

    // Skip the healthcheck on connections reserved for blocking or pub/sub
    // operations (signalled via maxRetriesPerRequest: null). A PING issued on
    // those connections queues behind the in-flight blocking command and would
    // spuriously time out.
    if (this.options.maxRetriesPerRequest !== null) {
      const healthcheck = setInterval(() => {
        if (this.status !== "ready") {
          return;
        }
        let pingTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          pingTimeout = setTimeout(() => reject(new Error("ping timeout")), _env.default.REDIS_HEALTHCHECK_TIMEOUT);
        });
        Promise.race([this.ping(), timeoutPromise]).catch(err => {
          _Logger.default.warn("Redis healthcheck failed, forcing reconnect", {
            error: err
          });
          this.disconnect(true);
        }).finally(() => {
          if (pingTimeout) {
            clearTimeout(pingTimeout);
          }
        });
      }, _env.default.REDIS_HEALTHCHECK_INTERVAL);

      // Don't keep the Node event loop alive solely for the healthcheck.
      healthcheck.unref();
      this.on("end", () => clearInterval(healthcheck));
    }
  }
  static get defaultClient() {
    return this.client || (this.client = new this(_env.default.REDIS_URL, {
      connectionNameSuffix: "client"
    }));
  }
  static get defaultSubscriber() {
    return this.subscriber || (this.subscriber = new this(_env.default.REDIS_URL, {
      maxRetriesPerRequest: null,
      connectionNameSuffix: "subscriber"
    }));
  }

  /**
   * A Redis adapter for collaboration-related operations.
   */
  static get collaborationClient() {
    if (!_env.default.REDIS_COLLABORATION_URL) {
      return this.defaultClient;
    }
    return this.collabClient || (this.collabClient = new this(_env.default.REDIS_COLLABORATION_URL, {
      connectionNameSuffix: "collab"
    }));
  }
}
exports.default = RedisAdapter;
_RedisAdapter = RedisAdapter;
_defineProperty(RedisAdapter, "client", void 0);
_defineProperty(RedisAdapter, "subscriber", void 0);
_defineProperty(RedisAdapter, "collabClient", void 0);