"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentCollection;
var _time = require("../../shared/utils/time");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function presentCollection(ctx, collection) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  const asData = !ctx || Number(ctx?.headers["x-api-version"] ?? 0) >= 3;
  const res = {
    id: collection.id,
    url: collection.path,
    urlId: collection.urlId,
    name: collection.name,
    data: asData ? await _DocumentHelper.DocumentHelper.toJSON(collection, options.isPublic ? {
      signedUrls: _time.Hour.seconds,
      teamId: collection.teamId,
      internalUrlBase: `/s/${options.shareId}`
    } : undefined) : undefined,
    description: asData ? undefined : collection.description,
    sort: collection.sort,
    icon: collection.icon,
    color: collection.color,
    createdAt: collection.createdAt,
    updatedAt: collection.updatedAt,
    archivedBy: undefined
  };
  if (options.isPublic && !options.includeUpdatedAt) {
    delete res.updatedAt;
  }
  if (!options.isPublic) {
    res.index = collection.index;
    res.sharing = collection.sharing;
    res.commenting = collection.commenting;
    res.templateManagement = collection.templateManagement;
    res.permission = collection.permission;
    res.deletedAt = collection.deletedAt;
    res.archivedAt = collection.archivedAt;
    res.archivedBy = collection.archivedBy && (0, _user.default)(collection.archivedBy);
    res.sourceMetadata = collection.sourceMetadata ? {
      externalId: collection.sourceMetadata.externalId,
      externalName: collection.sourceMetadata.externalName,
      createdByName: collection.sourceMetadata.createdByName
    } : undefined;
  }
  return res;
}