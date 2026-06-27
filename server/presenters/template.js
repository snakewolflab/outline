"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _user = _interopRequireDefault(require("./user"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function presentTemplate(template) {
  return {
    id: template.id,
    url: template.path,
    urlId: template.urlId,
    title: template.title,
    data: template.content,
    icon: template.icon,
    color: template.color,
    createdAt: template.createdAt,
    createdBy: (0, _user.default)(template.createdBy),
    updatedAt: template.updatedAt,
    updatedBy: (0, _user.default)(template.updatedBy),
    deletedAt: template.deletedAt,
    publishedAt: template.publishedAt,
    fullWidth: template.fullWidth,
    collectionId: template.collectionId
  };
}
var _default = exports.default = presentTemplate;