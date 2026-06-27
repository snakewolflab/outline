"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _parseTitle = _interopRequireDefault(require("../../shared/utils/parseTitle"));
var _tracing = require("../logging/tracing");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentRevision(revision) {
  // TODO: Remove this fallback once all revisions have been migrated
  const {
    emoji,
    strippedTitle
  } = (0, _parseTitle.default)(revision.title);
  const [data, text, collaborators] = await Promise.all([_DocumentHelper.DocumentHelper.toJSON(revision), _DocumentHelper.DocumentHelper.toMarkdown(revision), revision.collaborators]);
  return {
    id: revision.id,
    documentId: revision.documentId,
    title: strippedTitle,
    name: revision.name,
    data,
    text,
    icon: revision.icon ?? emoji,
    color: revision.color,
    collaborators: collaborators.map(user => (0, _user.default)(user)),
    createdAt: revision.createdAt,
    createdBy: (0, _user.default)(revision.user),
    createdById: revision.userId,
    deletedAt: revision.deletedAt
  };
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "presenters"
})(presentRevision);