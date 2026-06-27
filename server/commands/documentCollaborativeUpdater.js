"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = documentCollaborativeUpdater;
var _fastDeepEqual = _interopRequireDefault(require("fast-deep-equal"));
var _compat = require("es-toolkit/compat");
var _prosemirrorModel = require("prosemirror-model");
var _yProsemirror = require("y-prosemirror");
var Y = _interopRequireWildcard(require("yjs"));
var _editor = require("../editor");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
var _database = require("../storage/database");
var _types = require("../types");
var _semver = _interopRequireDefault(require("semver"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function documentCollaborativeUpdater(_ref) {
  let {
    documentId,
    ydoc,
    sessionCollaboratorIds,
    isLastConnection,
    clientVersion
  } = _ref;
  return _database.sequelize.transaction(async transaction => {
    await _database.sequelize.query(`SET LOCAL lock_timeout = '15s';`, {
      transaction
    });
    const document = await _models.Document.unscoped().scope("withoutState").findOne({
      where: {
        id: documentId
      },
      transaction,
      lock: {
        of: _models.Document,
        level: transaction.LOCK.UPDATE
      },
      rejectOnEmpty: true,
      paranoid: false
    });
    const state = Y.encodeStateAsUpdate(ydoc);

    // Round-trip through the schema so the stored JSON is canonical. The raw
    // y-prosemirror output includes empty `attrs: {}` on every mark, and outputs
    // properties in a different order - resulting in spurious "edits"
    const content = _prosemirrorModel.Node.fromJSON(_editor.schema, (0, _yProsemirror.yDocToProsemirrorJSON)(ydoc, "default")).toJSON();
    const isUnchanged = (0, _fastDeepEqual.default)(document.content, content);
    const isDeleted = !!document.deletedAt;
    const lastModifiedById = isDeleted ? document.lastModifiedById : sessionCollaboratorIds[sessionCollaboratorIds.length - 1] ?? document.lastModifiedById;
    if (isUnchanged) {
      return;
    }
    _Logger.default.info("multiplayer", `Persisting ${documentId}, attributed to ${lastModifiedById}`);

    // extract collaborators from doc user data
    const pud = new Y.PermanentUserData(ydoc);
    const pudIds = Array.from(pud.clients.values());
    const collaboratorIds = (0, _compat.uniq)([...(document.collaboratorIds ?? []), ...sessionCollaboratorIds, ...pudIds]);

    // Either the client or server version could be null, or they could both be
    // set. In that case we want to use the greater (newer) version.
    const editorVersion = document.editorVersion && clientVersion ? _semver.default.gt(clientVersion, document.editorVersion) ? clientVersion : document.editorVersion : clientVersion ? clientVersion : document.editorVersion;
    await document.update({
      content,
      state: Buffer.from(state),
      lastModifiedById,
      collaboratorIds,
      editorVersion
    }, {
      transaction,
      // Hooks MUST NOT be called or the AfterUpdate hook in Document model may
      // result in infinite processing.
      hooks: false
    });
    await _models.Event.schedule({
      name: "documents.update",
      documentId: document.id,
      collectionId: document.collectionId,
      teamId: document.teamId,
      actorId: lastModifiedById,
      authType: _types.AuthenticationType.APP,
      data: {
        multiplayer: true,
        title: document.title,
        done: isLastConnection
      }
    });
  });
}