"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.APIUpdateExtension = void 0;
var Y = _interopRequireWildcard(require("yjs"));
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _Document = _interopRequireDefault(require("../models/Document"));
var _redis = _interopRequireDefault(require("../storage/redis"));
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Redis channel prefix for API update notifications.
 */
const CHANNEL_PREFIX = "collaboration:api-update";

/**
 * Extension that listens for document updates made through the API and syncs
 * them to the collaborative editing state held in memory.
 *
 * When a document is updated via the API (e.g., documents.update endpoint),
 * a message is published to Redis. This extension receives that message and
 * reloads the document state from the database, then broadcasts the update
 * to all connected clients.
 */
let APIUpdateExtension = exports.APIUpdateExtension = (_dec = (0, _tracing.trace)(), _dec(_class = class APIUpdateExtension {
  constructor() {
    /**
     * Map of document names to their Hocuspocus Document instances.
     */
    _defineProperty(this, "documents", new Map());
    /**
     * Redis subscriber client for receiving update notifications.
     */
    _defineProperty(this, "subscriber", null);
    /**
     * Whether the extension has been configured.
     */
    _defineProperty(this, "configured", false);
    /**
     * Handle incoming Redis messages for API updates.
     */
    _defineProperty(this, "handleMessage", async (_pattern, channel, message) => {
      try {
        const documentId = channel.replace(`${CHANNEL_PREFIX}:`, "");
        const document = this.documents.get(documentId);
        if (!document) {
          // Document not loaded in this instance, ignore
          return;
        }
        const data = JSON.parse(message);
        _Logger.default.debug("multiplayer", `Received API update for document`, {
          documentId,
          actorId: data.actorId
        });

        // Fetch the latest state from the database
        const dbDocument = await _Document.default.unscoped().findOne({
          attributes: ["state", "content", "text"],
          where: {
            id: documentId
          }
        });
        if (!dbDocument) {
          _Logger.default.warn(`Document ${documentId} not found in database`);
          return;
        }
        if (!dbDocument.state) {
          _Logger.default.warn(`Document ${documentId} has no state in database`);
          return;
        }

        // Create a Y.Doc from the database state
        const dbYdoc = new Y.Doc();
        Y.applyUpdate(dbYdoc, dbDocument.state);

        // Calculate the diff between the current in-memory state and the database state
        const currentStateVector = Y.encodeStateVector(document);
        const update = Y.encodeStateAsUpdate(dbYdoc, currentStateVector);

        // Apply the update if there are changes
        if (update.length > 0) {
          Y.applyUpdate(document, update);
          _Logger.default.info("multiplayer", `Applied API update to document`, {
            documentId,
            updateSize: update.length
          });
        }
        dbYdoc.destroy();
      } catch (error) {
        _Logger.default.error("Failed to process API update message", error);
      }
    });
  }
  async onConfigure(_data) {
    if (this.configured) {
      return;
    }
    this.configured = true;
    try {
      // Create a dedicated subscriber for API update notifications
      this.subscriber = new _redis.default(_env.default.REDIS_COLLABORATION_URL || _env.default.REDIS_URL, {
        connectionNameSuffix: "collab-api-updates",
        maxRetriesPerRequest: null
      });

      // Handle Redis connection errors
      this.subscriber.on("error", err => {
        _Logger.default.error("Redis subscriber error in APIUpdateExtension", err);
      });

      // Subscribe to the API update channel pattern
      await this.subscriber.psubscribe(`${CHANNEL_PREFIX}:*`, err => {
        if (err) {
          _Logger.default.error("Failed to subscribe to API update channel", err);
          return;
        }
        _Logger.default.debug("multiplayer", `Subscribed to ${CHANNEL_PREFIX}:* for API updates`);
      });

      // Handle incoming messages
      this.subscriber.on("pmessage", this.handleMessage);
    } catch (error) {
      _Logger.default.error("Failed to configure APIUpdateExtension Redis subscriber", error);
      this.subscriber = null;
      this.configured = false;
    }
  }
  async afterLoadDocument(_ref) {
    let {
      documentName,
      document
    } = _ref;
    const [, documentId] = documentName.split(".");
    this.documents.set(documentId, document);
  }
  async onDestroy(_data) {
    if (this.subscriber) {
      await this.subscriber.punsubscribe(`${CHANNEL_PREFIX}:*`);
      await this.subscriber.quit();
      this.subscriber = null;
    }
    this.documents.clear();
  }

  /**
   * Handle a document being disconnected (no more clients).
   */
  async onDisconnect(_ref2) {
    let {
      documentName,
      clientsCount
    } = _ref2;
    if (clientsCount === 0) {
      const [, documentId] = documentName.split(".");
      this.documents.delete(documentId);
    }
  }
  /**
   * Publish a notification that a document was updated via the API.
   * This should be called from the document update command.
   *
   * @param documentId - the id of the document that was updated.
   * @param actorId - the id of the user who made the update.
   */
  static async notifyUpdate(documentId, actorId) {
    const channel = `${CHANNEL_PREFIX}:${documentId}`;
    const message = JSON.stringify({
      actorId,
      timestamp: Date.now()
    });
    await _redis.default.defaultClient.publish(channel, message);
    _Logger.default.debug("multiplayer", `Published API update notification`, {
      documentId,
      actorId
    });
  }
}) || _class);