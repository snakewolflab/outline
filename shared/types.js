"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UserRole = exports.UserPreference = exports.UserCreatableIntegrationService = exports.UnfurlResourceType = exports.TextEditMode = exports.TeamPreference = exports.TOCPosition = exports.SubscriptionType = exports.StatusFilter = exports.SortFilter = exports.SearchableModel = exports.Scope = exports.QueryNotices = exports.NotificationEventType = exports.NotificationEventDefaults = exports.NotificationChannelType = exports.NotificationBadgeType = exports.NavigationNodeType = exports.MentionType = exports.IssueTrackerIntegrationService = exports.IntegrationType = exports.IntegrationService = exports.ImportableIntegrationService = exports.ImportTaskState = exports.ImportTaskPhase = exports.ImportState = exports.IconType = exports.GroupPermission = exports.FileOperationType = exports.FileOperationState = exports.FileOperationFormat = exports.ExportContentType = exports.EmojiSkinTone = exports.EmojiCategory = exports.EmailDisplay = exports.DocumentPermission = exports.DirectionFilter = exports.CommentingAccess = exports.CommentStatusFilter = exports.CollectionStatusFilter = exports.CollectionPermission = exports.Client = exports.AttachmentPreset = void 0;
/** Available user roles. */
let UserRole = exports.UserRole = /*#__PURE__*/function (UserRole) {
  UserRole["Admin"] = "admin";
  UserRole["Member"] = "member";
  UserRole["Viewer"] = "viewer";
  UserRole["Guest"] = "guest";
  return UserRole;
}({});
/** Scopes for OAuth and API keys. */
let Scope = exports.Scope = /*#__PURE__*/function (Scope) {
  Scope["Read"] = "read";
  Scope["Write"] = "write";
  Scope["Create"] = "create";
  return Scope;
}({});
let StatusFilter = exports.StatusFilter = /*#__PURE__*/function (StatusFilter) {
  StatusFilter["Published"] = "published";
  StatusFilter["Archived"] = "archived";
  StatusFilter["Draft"] = "draft";
  return StatusFilter;
}({});
let SortFilter = exports.SortFilter = /*#__PURE__*/function (SortFilter) {
  SortFilter["CreatedAt"] = "createdAt";
  SortFilter["UpdatedAt"] = "updatedAt";
  SortFilter["Title"] = "title";
  return SortFilter;
}({});
let DirectionFilter = exports.DirectionFilter = /*#__PURE__*/function (DirectionFilter) {
  DirectionFilter["ASC"] = "ASC";
  DirectionFilter["DESC"] = "DESC";
  return DirectionFilter;
}({});
/** Model types that support search indexing. */
let SearchableModel = exports.SearchableModel = /*#__PURE__*/function (SearchableModel) {
  SearchableModel["Document"] = "document";
  SearchableModel["Collection"] = "collection";
  SearchableModel["Comment"] = "comment";
  return SearchableModel;
}({});
let CollectionStatusFilter = exports.CollectionStatusFilter = /*#__PURE__*/function (CollectionStatusFilter) {
  CollectionStatusFilter["Archived"] = "archived";
  return CollectionStatusFilter;
}({});
let CommentStatusFilter = exports.CommentStatusFilter = /*#__PURE__*/function (CommentStatusFilter) {
  CommentStatusFilter["Resolved"] = "resolved";
  CommentStatusFilter["Unresolved"] = "unresolved";
  return CommentStatusFilter;
}({});
let Client = exports.Client = /*#__PURE__*/function (Client) {
  Client["Web"] = "web";
  Client["Desktop"] = "desktop";
  return Client;
}({});
let ExportContentType = exports.ExportContentType = /*#__PURE__*/function (ExportContentType) {
  ExportContentType["Markdown"] = "text/markdown";
  ExportContentType["Html"] = "text/html";
  ExportContentType["Pdf"] = "application/pdf";
  return ExportContentType;
}({});
let FileOperationFormat = exports.FileOperationFormat = /*#__PURE__*/function (FileOperationFormat) {
  FileOperationFormat["JSON"] = "json";
  FileOperationFormat["MarkdownZip"] = "outline-markdown";
  FileOperationFormat["HTMLZip"] = "html";
  FileOperationFormat["PDF"] = "pdf";
  FileOperationFormat["Notion"] = "notion";
  return FileOperationFormat;
}({});
let FileOperationType = exports.FileOperationType = /*#__PURE__*/function (FileOperationType) {
  FileOperationType["Import"] = "import";
  FileOperationType["Export"] = "export";
  return FileOperationType;
}({});
let FileOperationState = exports.FileOperationState = /*#__PURE__*/function (FileOperationState) {
  FileOperationState["Creating"] = "creating";
  FileOperationState["Uploading"] = "uploading";
  FileOperationState["Complete"] = "complete";
  FileOperationState["Error"] = "error";
  FileOperationState["Expired"] = "expired";
  return FileOperationState;
}({});
let ImportState = exports.ImportState = /*#__PURE__*/function (ImportState) {
  ImportState["Created"] = "created";
  ImportState["InProgress"] = "in_progress";
  ImportState["Processed"] = "processed";
  ImportState["Completed"] = "completed";
  ImportState["Errored"] = "errored";
  ImportState["Canceled"] = "canceled";
  return ImportState;
}({});
let ImportTaskState = exports.ImportTaskState = /*#__PURE__*/function (ImportTaskState) {
  ImportTaskState["Created"] = "created";
  ImportTaskState["InProgress"] = "in_progress";
  ImportTaskState["Completed"] = "completed";
  ImportTaskState["Errored"] = "errored";
  ImportTaskState["Canceled"] = "canceled";
  return ImportTaskState;
}({});
/**
 * Classifies the work an `ImportTask` row represents. Set when the task is
 * created and used by `APIImportTask` to dispatch to the right handler.
 *
 * - `Bootstrap` runs once per import on a worker that owns the source
 *   artifact (e.g. extracts a zip, discovers structure, schedules child
 *   tasks). Subclasses without a bootstrap step never produce these.
 * - `Page` is the per-document work that the bootstrap (or `ImportsProcessor`
 *   for sources without a bootstrap, like Notion) fans out into.
 */
let ImportTaskPhase = exports.ImportTaskPhase = /*#__PURE__*/function (ImportTaskPhase) {
  ImportTaskPhase["Bootstrap"] = "bootstrap";
  ImportTaskPhase["Page"] = "page";
  return ImportTaskPhase;
}({});
let MentionType = exports.MentionType = /*#__PURE__*/function (MentionType) {
  MentionType["User"] = "user";
  MentionType["Document"] = "document";
  MentionType["Collection"] = "collection";
  MentionType["Group"] = "group";
  MentionType["Issue"] = "issue";
  MentionType["PullRequest"] = "pull_request";
  MentionType["Project"] = "project";
  MentionType["URL"] = "url";
  MentionType["Date"] = "date";
  return MentionType;
}({});
let AttachmentPreset = exports.AttachmentPreset = /*#__PURE__*/function (AttachmentPreset) {
  AttachmentPreset["DocumentAttachment"] = "documentAttachment";
  AttachmentPreset["WorkspaceImport"] = "workspaceImport";
  AttachmentPreset["Import"] = "import";
  AttachmentPreset["Avatar"] = "avatar";
  AttachmentPreset["Emoji"] = "emoji";
  return AttachmentPreset;
}({});
let IntegrationType = exports.IntegrationType = /*#__PURE__*/function (IntegrationType) {
  /** An integration that posts updates to an external system. */
  IntegrationType["Post"] = "post";
  /** An integration that listens for commands from an external system. */
  IntegrationType["Command"] = "command";
  /** An integration that embeds content from an external system. */
  IntegrationType["Embed"] = "embed";
  /** An integration that captures analytics data. */
  IntegrationType["Analytics"] = "analytics";
  /** An integration that maps an Outline user to an external service. */
  IntegrationType["LinkedAccount"] = "linkedAccount";
  /** An integration that imports documents into Outline. */
  IntegrationType["Import"] = "import";
  return IntegrationType;
}({});
let IntegrationService = exports.IntegrationService = /*#__PURE__*/function (IntegrationService) {
  IntegrationService["Diagrams"] = "diagrams";
  IntegrationService["Grist"] = "grist";
  IntegrationService["Slack"] = "slack";
  IntegrationService["GoogleAnalytics"] = "google-analytics";
  IntegrationService["Matomo"] = "matomo";
  IntegrationService["Umami"] = "umami";
  IntegrationService["GitHub"] = "github";
  IntegrationService["GitLab"] = "gitlab";
  IntegrationService["Linear"] = "linear";
  IntegrationService["Figma"] = "figma";
  IntegrationService["Notion"] = "notion";
  IntegrationService["Markdown"] = "markdown";
  IntegrationService["JSON"] = "json";
  return IntegrationService;
}({});
const ImportableIntegrationService = exports.ImportableIntegrationService = {
  Notion: IntegrationService.Notion,
  Markdown: IntegrationService.Markdown,
  JSON: IntegrationService.JSON
};
const IssueTrackerIntegrationService = exports.IssueTrackerIntegrationService = {
  GitHub: IntegrationService.GitHub,
  GitLab: IntegrationService.GitLab,
  Linear: IntegrationService.Linear
};
const UserCreatableIntegrationService = exports.UserCreatableIntegrationService = {
  Diagrams: IntegrationService.Diagrams,
  Grist: IntegrationService.Grist,
  GoogleAnalytics: IntegrationService.GoogleAnalytics,
  Matomo: IntegrationService.Matomo,
  Umami: IntegrationService.Umami,
  GitLab: IntegrationService.GitLab
};
let CollectionPermission = exports.CollectionPermission = /*#__PURE__*/function (CollectionPermission) {
  CollectionPermission["Read"] = "read";
  CollectionPermission["ReadWrite"] = "read_write";
  CollectionPermission["Admin"] = "admin";
  return CollectionPermission;
}({});
let DocumentPermission = exports.DocumentPermission = /*#__PURE__*/function (DocumentPermission) {
  DocumentPermission["Read"] = "read";
  DocumentPermission["ReadWrite"] = "read_write";
  DocumentPermission["Admin"] = "admin";
  return DocumentPermission;
}({});
let GroupPermission = exports.GroupPermission = /*#__PURE__*/function (GroupPermission) {
  GroupPermission["Member"] = "member";
  GroupPermission["Admin"] = "admin";
  return GroupPermission;
}({});
/** Settings stored on an AuthenticationProvider for group synchronization. */
let UserPreference = exports.UserPreference = /*#__PURE__*/function (UserPreference) {
  /** Whether reopening the app should redirect to the last viewed document. */
  UserPreference["RememberLastPath"] = "rememberLastPath";
  /** If web-style hand pointer should be used on interactive elements. */
  UserPreference["UseCursorPointer"] = "useCursorPointer";
  /** Whether code blocks should show line numbers. */
  UserPreference["CodeBlockLineNumers"] = "codeBlockLineNumbers";
  /** Whether documents have a separate edit mode instead of always editing. */
  UserPreference["SeamlessEdit"] = "seamlessEdit";
  /** Whether documents should start in full-width mode. */
  UserPreference["FullWidthDocuments"] = "fullWidthDocuments";
  /** Whether to sort the comments by their order in the document. */
  UserPreference["SortCommentsByOrderInDocument"] = "sortCommentsByOrderInDocument";
  /** Whether smart text replacements should be enabled. */
  UserPreference["EnableSmartText"] = "enableSmartText";
  /** The style of notification badge to display. */
  UserPreference["NotificationBadge"] = "notificationBadge";
  return UserPreference;
}({});
let NotificationBadgeType = exports.NotificationBadgeType = /*#__PURE__*/function (NotificationBadgeType) {
  /** Do not show a notification badge. */
  NotificationBadgeType["Disabled"] = "disabled";
  /** Show the unread notification count. */
  NotificationBadgeType["Count"] = "count";
  /** Show an unread indicator dot. */
  NotificationBadgeType["Indicator"] = "indicator";
  return NotificationBadgeType;
}({});
let TOCPosition = exports.TOCPosition = /*#__PURE__*/function (TOCPosition) {
  TOCPosition["Left"] = "left";
  TOCPosition["Right"] = "right";
  return TOCPosition;
}({});
let EmailDisplay = exports.EmailDisplay = /*#__PURE__*/function (EmailDisplay) {
  EmailDisplay["None"] = "none";
  EmailDisplay["Members"] = "members";
  EmailDisplay["Everyone"] = "everyone";
  return EmailDisplay;
}({});
let CommentingAccess = exports.CommentingAccess = /*#__PURE__*/function (CommentingAccess) {
  /** No one can comment. */
  CommentingAccess["None"] = "none";
  /** Only members can comment. */
  CommentingAccess["Members"] = "members";
  /** Members and guests can comment. */
  CommentingAccess["Everyone"] = "everyone";
  return CommentingAccess;
}({});
let TeamPreference = exports.TeamPreference = /*#__PURE__*/function (TeamPreference) {
  /** Whether documents have a separate edit mode instead of always editing. */
  TeamPreference["SeamlessEdit"] = "seamlessEdit";
  /** Whether to use team logo across the app for branding. */
  TeamPreference["PublicBranding"] = "publicBranding";
  /** Whether viewers should see download options. */
  TeamPreference["ViewersCanExport"] = "viewersCanExport";
  /** Whether members can invite new users. */
  TeamPreference["MembersCanInvite"] = "membersCanInvite";
  /** Whether members can create API keys. */
  TeamPreference["MembersCanCreateApiKey"] = "membersCanCreateApiKey";
  /** Whether members can delete their user account. */
  TeamPreference["MembersCanDeleteAccount"] = "membersCanDeleteAccount";
  /** Whether notification emails include document and comment content. */
  TeamPreference["PreviewsInEmails"] = "previewsInEmails";
  /** Who can comment on documents. */
  TeamPreference["Commenting"] = "commenting";
  /** The custom theme for the team. */
  TeamPreference["CustomTheme"] = "customTheme";
  /** Side to display the document's table of contents in relation to the main content. */
  TeamPreference["TocPosition"] = "tocPosition";
  /** Whether to prevent shared documents from being embedded in iframes on external websites. */
  TeamPreference["PreventDocumentEmbedding"] = "preventDocumentEmbedding";
  /** Who can see user email addresses. */
  TeamPreference["EmailDisplay"] = "emailDisplay";
  /** Whether external MCP clients can connect to the workspace. */
  TeamPreference["MCP"] = "mcp";
  /** List of disabled embed provider titles. */
  TeamPreference["DisabledEmbeds"] = "disabledEmbeds";
  return TeamPreference;
}({});
let NavigationNodeType = exports.NavigationNodeType = /*#__PURE__*/function (NavigationNodeType) {
  NavigationNodeType["Collection"] = "collection";
  NavigationNodeType["Document"] = "document";
  NavigationNodeType["UserMembership"] = "userMembership";
  NavigationNodeType["GroupMembership"] = "groupMembership";
  return NavigationNodeType;
}({});
let SubscriptionType = exports.SubscriptionType = /*#__PURE__*/function (SubscriptionType) {
  SubscriptionType["Document"] = "documents.update";
  return SubscriptionType;
}({});
let NotificationEventType = exports.NotificationEventType = /*#__PURE__*/function (NotificationEventType) {
  NotificationEventType["PublishDocument"] = "documents.publish";
  NotificationEventType["UpdateDocument"] = "documents.update";
  NotificationEventType["AddUserToDocument"] = "documents.add_user";
  NotificationEventType["AddUserToCollection"] = "collections.add_user";
  NotificationEventType["CreateRevision"] = "revisions.create";
  NotificationEventType["CreateCollection"] = "collections.create";
  NotificationEventType["CreateComment"] = "comments.create";
  NotificationEventType["ResolveComment"] = "comments.resolve";
  NotificationEventType["ReactionsCreate"] = "reactions.create";
  NotificationEventType["MentionedInDocument"] = "documents.mentioned";
  NotificationEventType["MentionedInComment"] = "comments.mentioned";
  NotificationEventType["GroupMentionedInDocument"] = "documents.group_mentioned";
  NotificationEventType["GroupMentionedInComment"] = "comments.group_mentioned";
  NotificationEventType["InviteAccepted"] = "emails.invite_accepted";
  NotificationEventType["Onboarding"] = "emails.onboarding";
  NotificationEventType["Features"] = "emails.features";
  NotificationEventType["ExportCompleted"] = "emails.export_completed";
  NotificationEventType["RequestDocumentAccess"] = "access_requests.create";
  return NotificationEventType;
}({});
let NotificationChannelType = exports.NotificationChannelType = /*#__PURE__*/function (NotificationChannelType) {
  NotificationChannelType["App"] = "app";
  NotificationChannelType["Email"] = "email";
  NotificationChannelType["Chat"] = "chat";
  return NotificationChannelType;
}({});
const NotificationEventDefaults = exports.NotificationEventDefaults = {
  [NotificationEventType.PublishDocument]: false,
  [NotificationEventType.UpdateDocument]: true,
  [NotificationEventType.CreateCollection]: false,
  [NotificationEventType.CreateComment]: true,
  [NotificationEventType.ResolveComment]: true,
  [NotificationEventType.ReactionsCreate]: true,
  [NotificationEventType.CreateRevision]: false,
  [NotificationEventType.MentionedInDocument]: true,
  [NotificationEventType.MentionedInComment]: true,
  [NotificationEventType.GroupMentionedInDocument]: true,
  [NotificationEventType.GroupMentionedInComment]: true,
  [NotificationEventType.InviteAccepted]: true,
  [NotificationEventType.Onboarding]: true,
  [NotificationEventType.Features]: true,
  [NotificationEventType.ExportCompleted]: true,
  [NotificationEventType.AddUserToDocument]: true,
  [NotificationEventType.AddUserToCollection]: true,
  [NotificationEventType.RequestDocumentAccess]: true
};
let UnfurlResourceType = exports.UnfurlResourceType = /*#__PURE__*/function (UnfurlResourceType) {
  UnfurlResourceType["URL"] = "url";
  UnfurlResourceType["Mention"] = "mention";
  UnfurlResourceType["Group"] = "group";
  UnfurlResourceType["Document"] = "document";
  UnfurlResourceType["Issue"] = "issue";
  UnfurlResourceType["PR"] = "pull";
  UnfurlResourceType["Project"] = "project";
  return UnfurlResourceType;
}({});
let QueryNotices = exports.QueryNotices = /*#__PURE__*/function (QueryNotices) {
  QueryNotices["UnsubscribeDocument"] = "unsubscribe-document";
  QueryNotices["UnsubscribeCollection"] = "unsubscribe-collection";
  QueryNotices["Subscribed"] = "subscribed";
  QueryNotices["Unsubscribed"] = "unsubscribed";
  return QueryNotices;
}({});
let IconType = exports.IconType = /*#__PURE__*/function (IconType) {
  IconType["SVG"] = "svg";
  IconType["Emoji"] = "emoji";
  IconType["Custom"] = "custom";
  return IconType;
}({});
/** Edit modes for document text updates. */
let TextEditMode = exports.TextEditMode = /*#__PURE__*/function (TextEditMode) {
  /** Replace existing content with new content (default). */
  TextEditMode["Replace"] = "replace";
  /** Append new content to the end of the document. */
  TextEditMode["Append"] = "append";
  /** Prepend new content to the beginning of the document. */
  TextEditMode["Prepend"] = "prepend";
  /** Patch specific content within the document by finding and replacing text. */
  TextEditMode["Patch"] = "patch";
  return TextEditMode;
}({});
let EmojiCategory = exports.EmojiCategory = /*#__PURE__*/function (EmojiCategory) {
  EmojiCategory["People"] = "People";
  EmojiCategory["Nature"] = "Nature";
  EmojiCategory["Foods"] = "Foods";
  EmojiCategory["Activity"] = "Activity";
  EmojiCategory["Places"] = "Places";
  EmojiCategory["Objects"] = "Objects";
  EmojiCategory["Symbols"] = "Symbols";
  EmojiCategory["Flags"] = "Flags";
  return EmojiCategory;
}({});
let EmojiSkinTone = exports.EmojiSkinTone = /*#__PURE__*/function (EmojiSkinTone) {
  EmojiSkinTone["Default"] = "Default";
  EmojiSkinTone["Light"] = "Light";
  EmojiSkinTone["MediumLight"] = "MediumLight";
  EmojiSkinTone["Medium"] = "Medium";
  EmojiSkinTone["MediumDark"] = "MediumDark";
  EmojiSkinTone["Dark"] = "Dark";
  return EmojiSkinTone;
}({});