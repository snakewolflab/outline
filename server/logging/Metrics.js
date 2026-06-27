"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _hotShots = require("hot-shots");
var _env = _interopRequireDefault(require("../env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Metrics {
  constructor() {
    _defineProperty(this, "client", void 0);
    this.client = new _hotShots.StatsD({
      prefix: "outline.",
      globalTags: {
        env: process.env.DD_ENV ?? _env.default.ENVIRONMENT
      },
      errorHandler: () => {
        // Silently ignore StatsD errors to avoid crashing the server
      }
    });
  }
  gauge(key, value, tags) {
    this.client.gauge(key, value, tags);
  }
  gaugePerInstance(key, value) {
    let tags = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    const instanceId = process.env.INSTANCE_ID || process.env.HEROKU_DYNO_ID || process.pid;
    this.client.gauge(key, value, [...tags, `instance:${instanceId}`]);
  }
  increment(key, tags) {
    const tagList = tags ? Object.entries(tags).map(_ref => {
      let [k, v] = _ref;
      return `${k}:${v}`;
    }) : undefined;
    this.client.increment(key, 1, tagList);
  }
  flush() {
    return new Promise(resolve => {
      this.client.close(() => {
        resolve();
      });
    });
  }
}
var _default = exports.default = new Metrics();