"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserPreferenceDefaults = exports.TeamPreferenceDefaults = exports.Pagination = exports.MAX_AVATAR_DISPLAY = exports.CSRF = void 0;
var _types = require("./types");
const MAX_AVATAR_DISPLAY = exports.MAX_AVATAR_DISPLAY = 6;
const Pagination = exports.Pagination = {
  defaultLimit: 25,
  defaultOffset: 0,
  maxLimit: 100,
  sidebarLimit: 10
};
const CSRF = exports.CSRF = {
  cookieName: "csrfToken",
  headerName: "x-csrf-token",
  fieldName: "_csrf"
};
const TeamPreferenceDefaults = exports.TeamPreferenceDefaults = {
  [_types.TeamPreference.SeamlessEdit]: true,
  [_types.TeamPreference.ViewersCanExport]: true,
  [_types.TeamPreference.MembersCanInvite]: false,
  [_types.TeamPreference.MembersCanCreateApiKey]: true,
  [_types.TeamPreference.MembersCanDeleteAccount]: true,
  [_types.TeamPreference.PreviewsInEmails]: true,
  [_types.TeamPreference.PublicBranding]: false,
  [_types.TeamPreference.Commenting]: _types.CommentingAccess.Members,
  [_types.TeamPreference.CustomTheme]: undefined,
  [_types.TeamPreference.TocPosition]: _types.TOCPosition.Left,
  [_types.TeamPreference.PreventDocumentEmbedding]: false,
  [_types.TeamPreference.EmailDisplay]: _types.EmailDisplay.Members,
  [_types.TeamPreference.MCP]: true,
  [_types.TeamPreference.DisabledEmbeds]: []
};
const UserPreferenceDefaults = exports.UserPreferenceDefaults = {
  [_types.UserPreference.RememberLastPath]: true,
  [_types.UserPreference.UseCursorPointer]: true,
  [_types.UserPreference.CodeBlockLineNumers]: true,
  [_types.UserPreference.SortCommentsByOrderInDocument]: true,
  [_types.UserPreference.EnableSmartText]: true,
  [_types.UserPreference.NotificationBadge]: _types.NotificationBadgeType.Count
};