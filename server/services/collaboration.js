"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = init;
var _nodeUrl = _interopRequireDefault(require("node:url"));
var _extensionRedis = require("@hocuspocus/extension-redis");
var _extensionThrottle = require("@hocuspocus/extension-throttle");
var _server = require("@hocuspocus/server");
var _ws = _interopRequireDefault(require("ws"));
var _validations = require("../../shared/validations");
var _APIUpdateExtension = require("../collaboration/APIUpdateExtension");
var _ConnectionLimitExtension = require("../collaboration/ConnectionLimitExtension");
var _ViewsExtension = require("../collaboration/ViewsExtension");
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _redis = _interopRequireDefault(require("../storage/redis"));
var _ShutdownHelper = _interopRequireWildcard(require("../utils/ShutdownHelper"));
var _AuthenticationExtension = _interopRequireDefault(require("../collaboration/AuthenticationExtension"));
var _EditorVersionExtension = require("../collaboration/EditorVersionExtension");
var _LoggerExtension = _interopRequireDefault(require("../collaboration/LoggerExtension"));
var _MetricsExtension = _interopRequireDefault(require("../collaboration/MetricsExtension"));
var _PersistenceExtension = _interopRequireDefault(require("../collaboration/PersistenceExtension"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function init(app, server, serviceNames) {
  const path = "/collaboration";
  const wss = new _ws.default.Server({
    noServer: true,
    maxPayload: _validations.DocumentValidation.maxStateLength
  });

  // Handle WebSocket server errors to prevent crashes when maxPayload is exceeded
  wss.on("error", error => {
    if (error?.message?.includes("Max payload size exceeded")) {
      _Logger.default.warn("WebSocket server error", {
        message: error.message
      });
      return;
    }
    _Logger.default.error("WebSocket server error", error);
  });
  const hocuspocus = _server.Server.configure({
    debounce: 3000,
    timeout: 30000,
    maxDebounce: 10000,
    extensions: [...(_env.default.REDIS_COLLABORATION_URL ? [new _extensionRedis.Redis({
      redis: _redis.default.collaborationClient
    })] : []), new _extensionThrottle.Throttle({
      throttle: _env.default.RATE_LIMITER_COLLABORATION_REQUESTS,
      consideredSeconds: _env.default.RATE_LIMITER_DURATION_WINDOW,
      // Ban time is defined in minutes
      banTime: 5
    }), new _ConnectionLimitExtension.ConnectionLimitExtension(), new _EditorVersionExtension.EditorVersionExtension(), new _AuthenticationExtension.default(), new _PersistenceExtension.default(), new _APIUpdateExtension.APIUpdateExtension(), new _ViewsExtension.ViewsExtension(), new _LoggerExtension.default(), new _MetricsExtension.default()]
  });
  server.on("upgrade", function (req, socket, head) {
    if (req.url?.startsWith(path)) {
      // parse document id and close connection if not present in request
      const documentId = _nodeUrl.default.parse(req.url).pathname?.replace(path, "").split("/").pop();
      if (documentId) {
        // Handle socket errors that may occur during upgrade (e.g., maxPayload exceeded)
        socket.on("error", error => {
          // ECONNRESET is common when clients disconnect abruptly, no need to log
          if (error.code === "ECONNRESET") {
            return;
          }
          _Logger.default.error("Socket error during WebSocket upgrade", error, {
            documentId
          }, req);
        });
        wss.handleUpgrade(req, socket, head, client => {
          // Handle websocket connection errors as soon as the client is upgraded
          client.on("error", error => {
            if (error?.message?.includes("Max payload size exceeded")) {
              _Logger.default.warn("Websocket error", {
                message: error.message,
                documentId
              });
              return;
            }
            _Logger.default.error(`Websocket error`, error, {
              documentId
            }, req);
          });
          hocuspocus.handleConnection(client, req, documentId);
        });
        return;
      }
    }
    if (req.url?.startsWith("/realtime") && serviceNames.includes("websockets")) {
      // Nothing to do, the websockets service will handle this request
      return;
    }

    // If the collaboration service is running it will close the connection
    socket.end(`HTTP/1.1 400 Bad Request\r\n`);
  });
  _ShutdownHelper.default.add("collaboration", _ShutdownHelper.ShutdownOrder.normal, () => hocuspocus.destroy());
}