"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildAdmin = buildAdmin;
exports.buildApiKey = buildApiKey;
exports.buildAttachment = buildAttachment;
exports.buildCollection = buildCollection;
exports.buildComment = buildComment;
exports.buildCommentMark = buildCommentMark;
exports.buildDocument = buildDocument;
exports.buildDraftDocument = buildDraftDocument;
exports.buildEmoji = buildEmoji;
exports.buildEvent = buildEvent;
exports.buildFileOperation = buildFileOperation;
exports.buildGroup = buildGroup;
exports.buildGroupUser = buildGroupUser;
exports.buildGuestUser = buildGuestUser;
exports.buildImport = buildImport;
exports.buildIntegration = buildIntegration;
exports.buildInvite = buildInvite;
exports.buildMention = buildMention;
exports.buildNotification = buildNotification;
exports.buildOAuthAuthentication = buildOAuthAuthentication;
exports.buildOAuthAuthorizationCode = buildOAuthAuthorizationCode;
exports.buildOAuthClient = buildOAuthClient;
exports.buildPin = buildPin;
exports.buildProseMirrorDoc = buildProseMirrorDoc;
exports.buildRelationship = buildRelationship;
exports.buildResolvedComment = buildResolvedComment;
exports.buildSearchQuery = buildSearchQuery;
exports.buildShare = buildShare;
exports.buildStar = buildStar;
exports.buildSubscription = buildSubscription;
exports.buildTeam = buildTeam;
exports.buildTemplate = buildTemplate;
exports.buildUser = buildUser;
exports.buildUserPasskey = buildUserPasskey;
exports.buildViewer = buildViewer;
exports.buildWebhookDelivery = buildWebhookDelivery;
exports.buildWebhookSubscription = buildWebhookSubscription;
var _faker = require("@faker-js/faker");
var _compat = require("es-toolkit/compat");
var _prosemirrorModel = require("prosemirror-model");
var _nodeCrypto = require("node:crypto");
var _random = require("../../shared/random");
var _types = require("../../shared/types");
var _editor = require("../editor");
var _models = require("../models");
var _Relationship = require("../models/Relationship");
var _AttachmentHelper = _interopRequireDefault(require("../models/helpers/AttachmentHelper"));
var _crypto = require("../utils/crypto");
var _OAuthInterface = require("../utils/oauth/OAuthInterface");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function buildApiKey() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }
  return _models.ApiKey.create({
    name: _faker.faker.lorem.words(3),
    ...overrides
  });
}
async function buildShare() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  if (!overrides.documentId && !overrides.collectionId) {
    const document = await buildDocument({
      createdById: overrides.userId,
      teamId: overrides.teamId
    });
    overrides.documentId = document.id;
  }
  return _models.Share.create({
    published: true,
    ...overrides
  });
}
async function buildStar() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let user;
  if (overrides.userId) {
    user = await _models.User.findByPk(overrides.userId, {
      rejectOnEmpty: true
    });
  } else {
    user = await buildUser();
    overrides.userId = user.id;
  }
  if (!overrides.documentId) {
    const document = await buildDocument({
      createdById: overrides.userId,
      teamId: user.teamId
    });
    overrides.documentId = document.id;
  }
  return _models.Star.create({
    index: "h",
    ...overrides
  });
}
async function buildSubscription() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let user;
  if (overrides.userId) {
    user = await _models.User.findByPk(overrides.userId, {
      rejectOnEmpty: true
    });
  } else {
    user = await buildUser();
    overrides.userId = user.id;
  }
  if (!overrides.documentId && !overrides.collectionId) {
    const document = await buildDocument({
      createdById: overrides.userId,
      teamId: user.teamId
    });
    overrides.documentId = document.id;
  }
  return _models.Subscription.create({
    event: _types.SubscriptionType.Document,
    ...overrides
  });
}
function buildTeam() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return _models.Team.create({
    name: _faker.faker.company.name(),
    passkeysEnabled: false,
    authenticationProviders: [{
      name: "slack",
      providerId: (0, _random.randomString)(32)
    }],
    ...overrides
  }, {
    include: "authenticationProviders"
  });
}
function buildEvent() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return _models.Event.create({
    name: "documents.publish",
    ip: "127.0.0.1",
    ...overrides
  });
}
async function buildGuestUser() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  return _models.User.create({
    email: _faker.faker.internet.email().toLowerCase(),
    name: _faker.faker.person.fullName(),
    createdAt: new Date("2018-01-01T00:00:00.000Z"),
    lastActiveAt: new Date("2018-01-01T00:00:00.000Z"),
    role: _types.UserRole.Guest,
    ...overrides
  });
}
async function buildUser() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let team;
  if (!overrides.teamId) {
    team = await buildTeam();
    overrides.teamId = team.id;
  } else {
    team = await _models.Team.findByPk(overrides.teamId, {
      include: "authenticationProviders",
      rejectOnEmpty: true,
      paranoid: false
    });
  }
  const authenticationProvider = team.authenticationProviders[0];
  const user = await _models.User.create({
    email: _faker.faker.internet.email().toLowerCase(),
    name: _faker.faker.person.fullName(),
    createdAt: new Date("2018-01-01T00:00:00.000Z"),
    updatedAt: new Date("2018-01-02T00:00:00.000Z"),
    lastActiveAt: new Date("2018-01-03T00:00:00.000Z"),
    authentications: authenticationProvider ? [{
      authenticationProviderId: authenticationProvider.id,
      providerId: (0, _random.randomString)(32)
    }] : [],
    ...overrides
  }, {
    include: "authentications"
  });
  if (team) {
    user.team = team;
  }
  return user;
}
async function buildAdmin() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return buildUser({
    ...overrides,
    role: _types.UserRole.Admin
  });
}
async function buildViewer() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return buildUser({
    ...overrides,
    role: _types.UserRole.Viewer
  });
}
async function buildInvite() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  const actor = await buildUser({
    teamId: overrides.teamId
  });
  return _models.User.create({
    email: _faker.faker.internet.email().toLowerCase(),
    name: _faker.faker.person.fullName(),
    createdAt: new Date("2018-01-01T00:00:00.000Z"),
    invitedById: actor.id,
    authentications: [],
    ...overrides,
    lastActiveAt: null
  });
}
async function buildIntegration() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  const user = await buildUser({
    teamId: overrides.teamId
  });
  const authentication = await _models.IntegrationAuthentication.create({
    service: _types.IntegrationService.Slack,
    userId: user.id,
    teamId: user.teamId,
    token: (0, _random.randomString)(32),
    scopes: ["example", "scopes", "here"]
  });
  return _models.Integration.create({
    service: _types.IntegrationService.Slack,
    type: _types.IntegrationType.Post,
    events: ["documents.update", "documents.publish"],
    settings: {
      serviceTeamId: (0, _nodeCrypto.randomUUID)()
    },
    authenticationId: authentication.id,
    ...overrides
  });
}
async function buildCollection() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  if (overrides.archivedAt && !overrides.archivedById) {
    overrides.archivedById = overrides.userId;
  }
  if (overrides.permission === undefined) {
    overrides.permission = _types.CollectionPermission.ReadWrite;
  }
  return _models.Collection.scope("withDocumentStructure").create({
    name: _faker.faker.lorem.words(2),
    description: _faker.faker.lorem.words(4),
    createdById: overrides.userId,
    ...overrides
  });
}
async function buildGroup() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  return _models.Group.create({
    name: _faker.faker.lorem.words(2),
    createdById: overrides.userId,
    ...overrides
  });
}
async function buildGroupUser() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  return _models.GroupUser.create({
    createdById: overrides.userId,
    ...overrides
  });
}
async function buildDraftDocument() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return buildDocument({
    ...overrides,
    publishedAt: null
  });
}
async function buildDocument() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }
  let collection;
  if (overrides.collectionId === undefined) {
    collection = await buildCollection({
      teamId: overrides.teamId,
      userId: overrides.userId
    });
    overrides.collectionId = collection.id;
  }
  const text = overrides.text ?? "This is the text in an example document";
  const document = await _models.Document.create({
    title: _faker.faker.lorem.words(4),
    content: overrides.content ?? _editor.parser.parse(text)?.toJSON(),
    text,
    publishedAt: (0, _compat.isNull)(overrides.collectionId) ? null : new Date(),
    lastModifiedById: overrides.userId,
    createdById: overrides.userId,
    editorVersion: "12.0.0",
    ...overrides
  }, {
    silent: overrides.createdAt || overrides.updatedAt ? true : false
  });
  if (overrides.collectionId && overrides.publishedAt !== null) {
    collection = collection ? await _models.Collection.findByPk(overrides.collectionId, {
      includeDocumentStructure: true
    }) : undefined;
    await collection?.addDocumentToStructure(document, 0);
  }
  return document;
}
async function buildTemplate() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  let collection;
  if (overrides.collectionId === undefined) {
    collection = await buildCollection({
      teamId: overrides.teamId,
      userId: overrides.userId
    });
    overrides.collectionId = collection.id;
  }
  const text = overrides.text ?? "This is the text in an example template";
  const template = await _models.Template.create({
    title: _faker.faker.lorem.words(4),
    content: overrides.content ?? _editor.parser.parse(text)?.toJSON(),
    lastModifiedById: overrides.userId,
    createdById: overrides.userId,
    editorVersion: "12.0.0",
    ...overrides
  }, {
    silent: overrides.createdAt || overrides.updatedAt ? true : false
  });
  return template;
}
async function buildComment(overrides) {
  const comment = await _models.Comment.create({
    resolvedById: overrides.resolvedById,
    parentCommentId: overrides.parentCommentId,
    documentId: overrides.documentId,
    data: {
      type: "doc",
      content: [{
        type: "paragraph",
        content: [{
          content: [],
          type: "text",
          text: "test"
        }]
      }]
    },
    createdById: overrides.userId,
    reactions: overrides.reactions,
    createdAt: overrides.createdAt,
    updatedAt: overrides.createdAt
  }, {
    silent: overrides.createdAt ? true : false
  });
  return comment;
}
async function buildResolvedComment(user, overrides) {
  const comment = await buildComment(overrides);
  comment.resolve(user);
  await comment.save();
  return comment;
}
async function buildFileOperation() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildAdmin({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  return _models.FileOperation.create({
    state: _types.FileOperationState.Creating,
    type: _types.FileOperationType.Export,
    size: 0,
    key: "uploads/key/to/file.zip",
    collectionId: null,
    url: "https://www.urltos3file.com/file.zip",
    ...overrides
  });
}

// oxlint-disable-next-line @typescript-eslint/no-explicit-any
async function buildImport() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.createdById) {
    const user = await buildAdmin({
      teamId: overrides.teamId
    });
    overrides.createdById = user.id;
  }
  if (!overrides.integrationId) {
    const integration = await buildIntegration({
      service: _types.IntegrationService.Notion,
      userId: overrides.createdById,
      teamId: overrides.teamId
    });
    overrides.integrationId = integration.id;
  }

  // Skip BeforeCreate hooks so tests can seed multiple imports per team. The
  // production "one in-progress import per team" rule is enforced by the
  // Import.checkInProgress hook; tests don't need to abide by it.
  // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  return _models.Import.create({
    name: "testImport",
    service: _types.IntegrationService.Notion,
    state: _types.ImportState.Created,
    input: [{
      permission: _types.CollectionPermission.Read
    }],
    ...overrides
    // oxlint-disable-next-line @typescript-eslint/no-explicit-any
  }, {
    hooks: false
  });
}
async function buildAttachment() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let fileName = arguments.length > 1 ? arguments[1] : undefined;
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  if (!overrides.documentId) {
    const document = await buildDocument({
      teamId: overrides.teamId,
      userId: overrides.userId
    });
    overrides.documentId = document.id;
  }
  const id = (0, _nodeCrypto.randomUUID)();
  const acl = overrides.acl || "public-read";
  const name = fileName || _faker.faker.system.fileName();
  return _models.Attachment.create({
    id,
    key: _AttachmentHelper.default.getKey({
      id,
      name,
      userId: overrides.userId
    }),
    contentType: "image/png",
    size: 1_000_000,
    acl,
    name,
    createdAt: new Date("2018-01-02T00:00:00.000Z"),
    updatedAt: new Date("2018-01-02T00:00:00.000Z"),
    ...overrides
  });
}
async function buildEmoji() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.createdById) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.createdById = user.id;
  }
  if (!overrides.attachmentId) {
    const attachment = await buildAttachment({
      teamId: overrides.teamId,
      userId: overrides.createdById,
      contentType: "image/png"
    });
    overrides.attachmentId = attachment.id;
  }
  return _models.Emoji.create({
    name: _faker.faker.word.adjective().toLowerCase().replace(/[^a-z0-9_]/g, "_"),
    ...overrides
  });
}
async function buildWebhookSubscription() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.createdById) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.createdById = user.id;
  }
  if (!overrides.name) {
    overrides.name = "Test Webhook Subscription";
  }
  if (!overrides.url) {
    overrides.url = "https://www.example.com/webhook";
  }
  if (!overrides.events) {
    overrides.events = ["*"];
  }
  if (!overrides.enabled) {
    overrides.enabled = true;
  }
  return _models.WebhookSubscription.create(overrides);
}
async function buildWebhookDelivery() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.status) {
    overrides.status = "success";
  }
  if (!overrides.statusCode) {
    overrides.statusCode = 200;
  }
  if (!overrides.requestBody) {
    overrides.requestBody = "{}";
  }
  if (!overrides.requestHeaders) {
    overrides.requestHeaders = {};
  }
  if (!overrides.webhookSubscriptionId) {
    const webhookSubscription = await buildWebhookSubscription();
    overrides.webhookSubscriptionId = webhookSubscription.id;
  }
  if (!overrides.createdAt) {
    overrides.createdAt = new Date();
  }
  return _models.WebhookDelivery.create(overrides);
}
async function buildNotification() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.event) {
    overrides.event = _types.NotificationEventType.UpdateDocument;
  }
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  return _models.Notification.create(overrides);
}
async function buildSearchQuery() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.userId) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.userId = user.id;
  }
  if (!overrides.source) {
    overrides.source = "app";
  }
  if ((0, _compat.isNil)(overrides.query)) {
    overrides.query = "query";
  }
  if ((0, _compat.isNil)(overrides.results)) {
    overrides.results = 1;
  }
  return _models.SearchQuery.create(overrides);
}
async function buildPin() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.createdById) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.createdById = user.id;
  }
  if (!overrides.documentId) {
    const document = await buildDocument({
      teamId: overrides.teamId
    });
    overrides.documentId = document.id;
  }
  return _models.Pin.create(overrides);
}
async function buildOAuthClient() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.teamId) {
    const team = await buildTeam();
    overrides.teamId = team.id;
  }
  if (!overrides.createdById && overrides.createdById !== null) {
    const user = await buildUser({
      teamId: overrides.teamId
    });
    overrides.createdById = user.id;
  }
  return _models.OAuthClient.create({
    name: _faker.faker.company.name(),
    description: _faker.faker.lorem.sentence(),
    redirectUris: ["https://example.com/oauth/callback"],
    published: true,
    ...(overrides.createdAt && !overrides.updatedAt ? {
      updatedAt: overrides.createdAt
    } : {}),
    ...overrides
  }, {
    silent: overrides.createdAt || overrides.updatedAt ? true : false
  });
}
async function buildOAuthAuthorizationCode() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }
  if (!overrides.expiresAt) {
    overrides.expiresAt = new Date();
  }
  const code = (0, _random.randomString)(32);
  let client;
  if (overrides.oauthClientId) {
    client = await _models.OAuthClient.findByPk(overrides.oauthClientId, {
      rejectOnEmpty: true
    });
  } else {
    client = await buildOAuthClient();
    overrides.oauthClientId = client.id;
  }
  return _models.OAuthAuthorizationCode.create({
    authorizationCodeHash: (0, _crypto.hash)(code),
    scope: ["read"],
    redirectUri: client.redirectUris[0],
    ...overrides
  });
}
async function buildOAuthAuthentication(_ref) {
  let {
    oauthClientId,
    user,
    scope,
    grantId
  } = _ref;
  const oauthClient = oauthClientId ? await _models.OAuthClient.findByPk(oauthClientId, {
    rejectOnEmpty: true
  }) : await buildOAuthClient({
    teamId: user.teamId
  });
  const oauthInterfaceClient = {
    id: oauthClient.clientId,
    grants: ["authorization_code"],
    redirectUris: ["https://example.com/oauth/callback"]
  };
  const oauthInterfaceUser = {
    id: user.id
  };
  const accessToken = await _OAuthInterface.OAuthInterface.generateAccessToken(oauthInterfaceClient, oauthInterfaceUser, scope);
  const refreshToken = await _OAuthInterface.OAuthInterface.generateRefreshToken(oauthInterfaceClient, oauthInterfaceUser, scope);
  return _models.OAuthAuthentication.create({
    userId: user.id,
    oauthClientId: oauthClient.id,
    accessToken,
    accessTokenHash: (0, _crypto.hash)(accessToken),
    accessTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60),
    refreshToken,
    refreshTokenHash: (0, _crypto.hash)(refreshToken),
    refreshTokenExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    scope,
    grantId
  });
}
function buildProseMirrorDoc(content) {
  return _prosemirrorModel.Node.fromJSON(_editor.schema, {
    type: "doc",
    content
  });
}
function buildMention(overrides) {
  return {
    type: "mention",
    attrs: {
      id: overrides.id ?? (0, _nodeCrypto.randomUUID)(),
      type: overrides.type ?? _types.MentionType.User,
      label: overrides.label ?? _faker.faker.name.fullName(),
      modelId: overrides.modelId,
      actorId: overrides.actorId
    }
  };
}
function buildCommentMark(overrides) {
  if (!overrides.id) {
    overrides.id = (0, _random.randomString)(10);
  }
  if (!overrides.userId) {
    overrides.userId = (0, _random.randomString)(10);
  }
  return {
    type: "comment",
    attrs: overrides
  };
}
async function buildRelationship() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }
  if (!overrides.documentId) {
    const document = await buildDocument({
      createdById: overrides.userId
    });
    overrides.documentId = document.id;
  }
  if (!overrides.reverseDocumentId) {
    const reverseDocument = await buildDocument({
      createdById: overrides.userId
    });
    overrides.reverseDocumentId = reverseDocument.id;
  }
  return _models.Relationship.create({
    type: _Relationship.RelationshipType.Backlink,
    ...overrides
  });
}
async function buildUserPasskey() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  if (!overrides.userId) {
    const user = await buildUser();
    overrides.userId = user.id;
  }
  return _models.UserPasskey.create({
    credentialId: (0, _random.randomString)(32),
    credentialPublicKey: Buffer.from((0, _random.randomString)(64)),
    counter: 0,
    transports: ["internal"],
    name: _faker.faker.word.noun(),
    ...overrides
  });
}