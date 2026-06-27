"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var Y = _interopRequireWildcard(require("yjs"));
var _error = require("../../shared/utils/error");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _tracing = require("../logging/tracing");
var _Document = _interopRequireDefault(require("../models/Document"));
var _ProsemirrorHelper = require("../models/helpers/ProsemirrorHelper");
var _database = require("../storage/database");
var _redis = _interopRequireDefault(require("../storage/redis"));
var _documentCollaborativeUpdater = _interopRequireDefault(require("../commands/documentCollaborativeUpdater"));
var _dec, _class;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
let PersistenceExtension = exports.default = (_dec = (0, _tracing.trace)(), _dec(_class = class PersistenceExtension {
  async onLoadDocument(_ref) {
    let {
      documentName,
      ...data
    } = _ref;
    const [, documentId] = documentName.split(".");
    const fieldName = "default";

    // Check if the given field already exists in the given y-doc. This is import
    // so we don't import a document fresh if it exists already.
    if (!data.document.isEmpty(fieldName)) {
      return;
    }

    // First, try to find the document without a lock to check if it has state
    const documentWithoutLock = await _Document.default.unscoped().findOne({
      attributes: ["state"],
      rejectOnEmpty: true,
      where: {
        id: documentId
      }
    });

    // If the document already has state, we can return it without needing a transaction
    if (documentWithoutLock.state) {
      const ydoc = new Y.Doc();
      _Logger.default.info("database", `Document ${documentId} is in database state`);
      Y.applyUpdate(ydoc, documentWithoutLock.state);
      return ydoc;
    }

    // If the document doesn't have state yet, we need to acquire a lock and create it
    return await _database.sequelize.transaction(async transaction => {
      const document = await _Document.default.unscoped().findOne({
        attributes: ["id", "state", "content", "text"],
        transaction,
        lock: transaction.LOCK.UPDATE,
        rejectOnEmpty: true,
        where: {
          id: documentId
        }
      });
      let ydoc;

      // Double-check the state in case another process created it
      if (document.state) {
        ydoc = new Y.Doc();
        _Logger.default.info("database", `Document ${documentId} is in database state`);
        Y.applyUpdate(ydoc, document.state);
        return ydoc;
      }
      if (document.content) {
        _Logger.default.info("database", `Document ${documentId} is not in state, creating from content`);
        ydoc = _ProsemirrorHelper.ProsemirrorHelper.toYDoc(document.content, fieldName);
      } else {
        _Logger.default.info("database", `Document ${documentId} is not in state, creating from text`);
        ydoc = _ProsemirrorHelper.ProsemirrorHelper.toYDoc(document.text, fieldName);
      }
      const state = _ProsemirrorHelper.ProsemirrorHelper.toState(ydoc);
      await document.update({
        state
      }, {
        silent: true,
        hooks: false,
        transaction
      });
      return ydoc;
    });
  }
  async onChange(_ref2) {
    let {
      context,
      documentName
    } = _ref2;
    const [, documentId] = documentName.split(".");
    if (context.user) {
      _Logger.default.debug("multiplayer", `${context.user.name} changed ${documentName}`);
      const key = _Document.default.getCollaboratorKey(documentId);
      await _redis.default.defaultClient.sadd(key, context.user.id);
    }
  }
  async onStoreDocument(_ref3) {
    let {
      document,
      context,
      documentName,
      clientsCount,
      requestParameters
    } = _ref3;
    const [, documentId] = documentName.split(".");
    const clientVersion = requestParameters.get("editorVersion");
    const key = _Document.default.getCollaboratorKey(documentId);
    const sessionCollaboratorIds = await _redis.default.defaultClient.smembers(key);
    if (!sessionCollaboratorIds || sessionCollaboratorIds.length === 0) {
      _Logger.default.debug("multiplayer", `No changes for ${documentName}`);
      return;
    }
    try {
      await (0, _documentCollaborativeUpdater.default)({
        documentId,
        ydoc: document,
        sessionCollaboratorIds,
        isLastConnection: clientsCount === 0,
        clientVersion
      });
    } catch (err) {
      _Logger.default.error("Unable to persist document", (0, _error.toError)(err), {
        documentId,
        userId: context.user?.id
      });
    }
  }
}) || _class);