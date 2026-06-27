"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WebhookSubscriptionValidation = exports.UserValidation = exports.UserPasskeyValidation = exports.TeamValidation = exports.ShareValidation = exports.RevisionValidation = exports.PinValidation = exports.OAuthClientValidation = exports.ImportValidation = exports.GroupValidation = exports.EmojiValidation = exports.DocumentValidation = exports.CommentValidation = exports.CollectionValidation = exports.AttachmentValidation = exports.ApiKeyValidation = void 0;
const AttachmentValidation = exports.AttachmentValidation = {
  /** The limited allowable mime-types for user and team avatars */
  avatarContentTypes: ["image/jpg", "image/jpeg", "image/png"],
  /** The most widely supported mime-types across modern browsers */
  emojiContentTypes: ["image/png", "image/webp", "image/gif", "image/jpeg", "image/jpg"],
  /** The maximum file size for emoji uploads */
  emojiMaxFileSize: 1 * 1000 * 1000,
  /** Image mime-types commonly supported by modern browsers */
  imageContentTypes: ["image/jpg", "image/jpeg", "image/pjpeg", "image/png", "image/apng", "image/avif", "image/gif", "image/webp", "image/svg", "image/svg+xml", "image/bmp", "image/tiff", "image/heic"]
};
const ApiKeyValidation = exports.ApiKeyValidation = {
  /** The minimum length of the API key name */
  minNameLength: 3,
  /** The maximum length of the API key name */
  maxNameLength: 255
};
const CollectionValidation = exports.CollectionValidation = {
  /** The maximum length of the collection description */
  maxDescriptionLength: 100 * 1000,
  /** The maximum length of the collection name */
  maxNameLength: 100
};
const CommentValidation = exports.CommentValidation = {
  /** The maximum length of a comment */
  maxLength: 1000
};
const DocumentValidation = exports.DocumentValidation = {
  /** The maximum length of the document title */
  maxTitleLength: 100,
  /** The maximum length of the document summary */
  maxSummaryLength: 1000,
  /** The maximum size of the collaborative document state */
  maxStateLength: 1500 * 1024,
  /** The maximum recommended size of the document content */
  maxRecommendedLength: 250000
};
const GroupValidation = exports.GroupValidation = {
  /** The maximum length of the group name */
  maxNameLength: 255,
  /** The maximum length of the group description */
  maxDescriptionLength: 2000
};
const ImportValidation = exports.ImportValidation = {
  /** The maximum length of the import name */
  maxNameLength: 100
};
const OAuthClientValidation = exports.OAuthClientValidation = {
  /** The maximum length of the OAuth client name */
  maxNameLength: 100,
  /** The maximum length of the OAuth client description */
  maxDescriptionLength: 255,
  /** The maximum length of the OAuth client developer name */
  maxDeveloperNameLength: 100,
  /** The maximum length of the OAuth client developer URL */
  maxDeveloperUrlLength: 1024,
  /** The maximum length of the OAuth client avatar URL */
  maxAvatarUrlLength: 1024,
  /** The maximum length of an OAuth client redirect URI */
  maxRedirectUriLength: 1024,
  /** The allowed OAuth client types */
  clientTypes: ["confidential", "public"]
};
const ShareValidation = exports.ShareValidation = {
  /** The maximum length of the share title */
  maxTitleLength: 255,
  /** The maximum length of the share iconUrl */
  maxIconUrlLength: 4096
};
const RevisionValidation = exports.RevisionValidation = {
  minNameLength: 1,
  maxNameLength: 255
};
const UserPasskeyValidation = exports.UserPasskeyValidation = {
  minNameLength: 1,
  maxNameLength: 255
};
const PinValidation = exports.PinValidation = {
  /** The maximum number of pinned documents on an individual collection or home screen */
  max: 8
};
const TeamValidation = exports.TeamValidation = {
  /** The maximum number of domains per team on cloud hosted */
  maxDomains: 10,
  /** The maximum length of the team name */
  maxNameLength: 255,
  /** The maximum length of the team description */
  maxDescriptionLength: 1000,
  /** The minimum length of the team subdomain */
  minSubdomainLength: 2,
  /** The maximum length of the team subdomain for cloud */
  maxSubdomainLength: 32,
  /** The maximum length of the team subdomain for self-hosted */
  maxSubdomainSelfHostedLength: 255,
  /** The maximum length of a team domain */
  maxDomainLength: 255,
  /** The maximum length of MCP workspace guidance */
  maxGuidanceMCPLength: 10000,
  /** The recommended length of MCP workspace guidance, beyond which a warning is shown */
  warnGuidanceMCPLength: 2000
};
const UserValidation = exports.UserValidation = {
  /** The maximum number of invites per request */
  maxInvitesPerRequest: 20,
  /** The maximum length of the user name */
  maxNameLength: 255,
  /** The maximum length of the user email */
  maxEmailLength: 255
};
const WebhookSubscriptionValidation = exports.WebhookSubscriptionValidation = {
  /** The maximum number of webhooks per team */
  maxSubscriptions: 10,
  /** The maximum length of the webhook name */
  maxNameLength: 255,
  /** The maximum length of the webhook url */
  maxUrlLength: 1024
};
const EmojiValidation = exports.EmojiValidation = {
  /** The maximum length of the emoji name */
  maxNameLength: 25,
  /* the characters allowed in the name */
  allowedNameCharacters: /^[a-z0-9_]*$/
};