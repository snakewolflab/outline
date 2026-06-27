"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodePath = _interopRequireDefault(require("node:path"));
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _invariant = _interopRequireDefault(require("invariant"));
var _contentDisposition = _interopRequireDefault(require("content-disposition"));
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _compat = require("es-toolkit/compat");
var _mimeTypes = _interopRequireDefault(require("mime-types"));
var _sequelize = require("sequelize");
var _nodeCrypto = require("node:crypto");
var _error = require("../../../../shared/utils/error");
var _types = require("../../../../shared/types");
var _date = require("../../../../shared/utils/date");
var _slugify = _interopRequireDefault(require("../../../../shared/utils/slugify"));
var _time = require("../../../../shared/utils/time");
var _documentCreator = _interopRequireWildcard(require("../../../commands/documentCreator"));
var _documentDuplicator = _interopRequireDefault(require("../../../commands/documentDuplicator"));
var _documentLoader = _interopRequireDefault(require("../../../commands/documentLoader"));
var _documentMover = _interopRequireDefault(require("../../../commands/documentMover"));
var _documentPermanentDeleter = _interopRequireDefault(require("../../../commands/documentPermanentDeleter"));
var _documentRestorer = _interopRequireDefault(require("../../../commands/documentRestorer"));
var _documentUpdater = _interopRequireDefault(require("../../../commands/documentUpdater"));
var _env = _interopRequireDefault(require("../../../env"));
var _errors = require("../../../errors");
var _Logger = _interopRequireDefault(require("../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _multipart = _interopRequireDefault(require("../../../middlewares/multipart"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _AttachmentHelper = _interopRequireDefault(require("../../../models/helpers/AttachmentHelper"));
var _DocumentHelper = require("../../../models/helpers/DocumentHelper");
var _ProsemirrorHelper = require("../../../models/helpers/ProsemirrorHelper");
var _SearchProviderManager = _interopRequireDefault(require("../../../utils/SearchProviderManager"));
var _TextHelper = require("../../../models/helpers/TextHelper");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _DocumentImportTask = _interopRequireDefault(require("../../../queues/tasks/DocumentImportTask"));
var _EmptyTrashTask = _interopRequireDefault(require("../../../queues/tasks/EmptyTrashTask"));
var _files = _interopRequireDefault(require("../../../storage/files"));
var _RateLimiter = require("../../../utils/RateLimiter");
var _embeds = require("../../../utils/embeds");
var _koa = require("../../../utils/koa");
var _passport = require("../../../utils/passport");
var _pagination = _interopRequireWildcard(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
var _shareLoader = require("../../../commands/shareLoader");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("documents.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsListSchema), async ctx => {
  const {
    sort,
    direction,
    collectionId,
    backlinkDocumentId,
    parentDocumentId,
    userId: createdById,
    statusFilter
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;

  // always filter by the current team
  const {
    user
  } = ctx.state.auth;
  const where = {
    teamId: user.teamId,
    [_sequelize.Op.and]: [{
      deletedAt: {
        [_sequelize.Op.eq]: null
      }
    }]
  };

  // Exclude archived docs by default
  if (!statusFilter) {
    where[_sequelize.Op.and].push({
      archivedAt: {
        [_sequelize.Op.eq]: null
      }
    });
  }

  // if a specific user is passed then add to filters. If the user doesn't
  // exist in the team then nothing will be returned, so no need to check auth
  if (createdById) {
    where[_sequelize.Op.and].push({
      createdById
    });
  }
  let documentIds = [];

  // if a specific collection is passed then we need to check auth to view it
  if (collectionId) {
    where[_sequelize.Op.and].push({
      collectionId: [collectionId]
    });
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      includeDocumentStructure: sort === "index"
    });
    (0, _policies.authorize)(user, "readDocument", collection);

    // index sort is special because it uses the order of the documents in the
    // collection.documentStructure rather than a database column
    if (sort === "index") {
      // Extract all document IDs from the collection structure.
      documentIds = (collection.documentStructure || []).slice(offset, offset + limit).map(node => node.id);
      where[_sequelize.Op.and].push({
        id: documentIds
      });
    } // if it's not a backlink request, filter by all collections the user has access to
  } else if (!backlinkDocumentId) {
    const collectionIds = await user.collectionIds();
    where[_sequelize.Op.and].push({
      collectionId: collectionIds
    });
  }
  if (parentDocumentId) {
    const [groupMembership, membership] = await Promise.all([_models.GroupMembership.findOne({
      where: {
        documentId: parentDocumentId
      },
      include: [{
        model: _models.Group,
        required: true,
        include: [{
          model: _models.GroupUser,
          required: true,
          where: {
            userId: user.id
          }
        }]
      }]
    }), _models.UserMembership.findOne({
      where: {
        userId: user.id,
        documentId: parentDocumentId
      }
    })]);
    if (groupMembership || membership) {
      (0, _compat.remove)(where[_sequelize.Op.and], cond => (0, _compat.has)(cond, "collectionId"));
    }
    where[_sequelize.Op.and].push({
      parentDocumentId
    });
  }

  // Explicitly passing 'null' as the parentDocumentId allows listing documents
  // that have no parent document (aka they are at the root of the collection)
  if (parentDocumentId === null) {
    where[_sequelize.Op.and].push({
      parentDocumentId: {
        [_sequelize.Op.is]: null
      }
    });
  }
  if (backlinkDocumentId) {
    const sourceDocumentIds = await _models.Relationship.findSourceDocumentIdsForUser(backlinkDocumentId, user);
    where[_sequelize.Op.and].push({
      id: sourceDocumentIds
    });

    // For safety, ensure the collectionId is not set in the query.
    (0, _compat.remove)(where[_sequelize.Op.and], cond => (0, _compat.has)(cond, "collectionId"));
  }
  const statusQuery = [];
  if (statusFilter?.includes(_types.StatusFilter.Published)) {
    statusQuery.push({
      [_sequelize.Op.and]: [{
        publishedAt: {
          [_sequelize.Op.ne]: null
        },
        archivedAt: {
          [_sequelize.Op.eq]: null
        }
      }]
    });
  }
  if (statusFilter?.includes(_types.StatusFilter.Draft)) {
    // Pre-fetch document IDs the user has a direct membership on so the
    // filter can be expressed without referencing the (separately-loaded)
    // memberships association, which would otherwise break the COUNT query.
    const membershipDocumentIds = (await _models.UserMembership.findAll({
      attributes: ["documentId"],
      where: {
        userId: user.id,
        documentId: {
          [_sequelize.Op.ne]: null
        }
      }
    })).map(m => m.documentId);
    statusQuery.push({
      [_sequelize.Op.and]: [{
        publishedAt: {
          [_sequelize.Op.eq]: null
        },
        archivedAt: {
          [_sequelize.Op.eq]: null
        },
        [_sequelize.Op.or]: [
        // Only ever include draft results for the user's own documents
        {
          createdById: user.id
        }, {
          id: membershipDocumentIds
        }]
      }]
    });
  }
  if (statusFilter?.includes(_types.StatusFilter.Archived)) {
    statusQuery.push({
      archivedAt: {
        [_sequelize.Op.ne]: null
      }
    });
  }
  if (statusQuery.length) {
    where[_sequelize.Op.and].push({
      [_sequelize.Op.or]: statusQuery
    });
  }

  // When sorting by index, use array_position to sort by the document order
  // in the collection structure directly in SQL, enabling correct pagination
  const orderClause = sort === "index" ? documentIds.length > 0 ? [[_sequelize.Sequelize.literal(`array_position(ARRAY[:documentIds]::uuid[], "document"."id")`), direction]] : undefined : [[sort, direction]];
  const includeDrafts = !!statusFilter?.includes(_types.StatusFilter.Draft);

  // The withDrafts scope drops the defaultScope filters, so re-apply the
  // ones we still want — templates and trial-import documents should never
  // appear in this listing.
  if (includeDrafts) {
    where[_sequelize.Op.and].push({
      template: false,
      sourceMetadata: {
        trial: {
          [_sequelize.Op.is]: null
        }
      }
    });
  }

  // When sorting by index, pagination is already handled by slicing documentIds,
  // so we skip the SQL-level offset to avoid double-pagination
  const {
    results: documents,
    pagination
  } = await (0, _pagination.paginateQuery)(ctx, _ref => {
    let {
      offset: queryOffset,
      limit: queryLimit
    } = _ref;
    return _models.Document.withMembershipScope(user.id, {
      includeDrafts
    }).findAll({
      where,
      order: orderClause,
      offset: sort === "index" ? 0 : queryOffset,
      limit: queryLimit,
      replacements: {
        documentIds
      }
    });
  }, () => _models.Document.withMembershipScope(user.id, {
    includeDrafts
  }).count({
    where
  }));
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination,
    data,
    policies
  };
});
router.post("documents.archived", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsArchivedSchema), async ctx => {
  const {
    sort,
    direction,
    collectionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (sort === "index") {
    throw (0, _errors.ValidationError)("Sorting archived documents by index is not supported");
  }
  let where = {
    teamId: user.teamId,
    archivedAt: {
      [_sequelize.Op.ne]: null
    }
  };

  // if a specific collection is passed then we need to check auth to view it
  if (collectionId) {
    where = {
      ...where,
      collectionId
    };
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "readDocument", collection);

    // otherwise, filter by all collections the user has access to
  } else {
    const collectionIds = await user.collectionIds();
    where = {
      ...where,
      collectionId: collectionIds
    };
  }
  const documents = await _models.Document.withMembershipScope(user.id).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.deleted", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsDeletedSchema), async ctx => {
  const {
    sort,
    direction
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds({
    paranoid: false
  });
  const membershipScope = {
    method: ["withMembership", user.id]
  };
  const viewScope = {
    method: ["withViews", user.id]
  };
  const documents = await _models.Document.scope([membershipScope, viewScope, "withDrafts"]).findAll({
    where: {
      teamId: user.teamId,
      deletedAt: {
        [_sequelize.Op.ne]: null
      },
      [_sequelize.Op.or]: [{
        collectionId: {
          [_sequelize.Op.in]: collectionIds
        }
      }, {
        createdById: user.id,
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }]
    },
    paranoid: false,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.viewed", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsViewedSchema), async ctx => {
  const {
    sort,
    direction
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds();
  const userId = user.id;
  const views = await _models.View.findAll({
    where: {
      userId
    },
    order: [[sort, direction]],
    include: [{
      model: _models.Document.scope(["withDrafts", {
        method: ["withMembership", userId]
      }]),
      required: true,
      where: {
        teamId: user.teamId,
        collectionId: collectionIds
      }
    }],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit,
    subQuery: false
  });
  const documents = views.map(view => {
    const document = view.document;
    document.views = [view];
    return document;
  });
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.drafts", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsDraftsSchema), async ctx => {
  const {
    collectionId,
    dateFilter,
    direction,
    sort
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "readDocument", collection);
  }
  const collectionIds = collectionId ? [collectionId] : await user.collectionIds();
  const where = {
    teamId: user.teamId,
    createdById: user.id,
    collectionId: {
      [_sequelize.Op.or]: [{
        [_sequelize.Op.in]: collectionIds
      }, {
        [_sequelize.Op.is]: null
      }]
    },
    publishedAt: {
      [_sequelize.Op.is]: null
    }
  };
  if (dateFilter) {
    where.updatedAt = {
      [_sequelize.Op.gte]: (0, _date.subtractDate)(new Date(), dateFilter)
    };
  } else {
    delete where.updatedAt;
  }
  const documents = await _models.Document.withMembershipScope(user.id, {
    includeDrafts: true
  }).findAll({
    where,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  });
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  const policies = (0, _presenters.presentPolicies)(user, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.info", (0, _authentication.default)({
  optional: true
}), (0, _validate.default)(T.DocumentsInfoSchema), async ctx => {
  const {
    id,
    shareId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const apiVersion = getAPIVersion(ctx);
  const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx, {
    includeOAuthState: false
  });
  let document;
  let serializedDocument;
  let isPublic = false;
  if (shareId) {
    const result = await (0, _shareLoader.loadPublicShare)({
      id: shareId,
      documentId: id,
      teamId: teamFromCtx?.id
    });
    document = result.document;
    if (!document) {
      throw (0, _errors.NotFoundError)("Document could not be found for shareId");
    }

    // reload with membership scope if user is authenticated
    if (user) {
      document = await _models.Document.findByPk(document.id, {
        userId: user.id,
        rejectOnEmpty: true
      });
    }
    isPublic = (0, _policies.cannot)(user, "read", document);

    // Get backlinks that are within the shared tree
    let backlinkIds;
    if (result.sharedTree) {
      const allowedDocumentIds = (0, _shareLoader.getAllIdsInSharedTree)(result.sharedTree);
      backlinkIds = await _models.Relationship.findSourceDocumentIdsInSharedTree(document.id, allowedDocumentIds);
    }
    serializedDocument = await (0, _presenters.presentDocument)(ctx, document, {
      isPublic,
      shareId,
      includeUpdatedAt: result.share.showLastUpdated,
      backlinkIds
    });
  } else {
    if (!user) {
      throw (0, _errors.AuthenticationError)("Authentication required");
    }
    document = await (0, _documentLoader.default)({
      id: id,
      // validation ensures id will be present here
      user
    });
    serializedDocument = await (0, _presenters.presentDocument)(ctx, document);
  }
  ctx.body = {
    // Passing apiVersion=2 has a single effect, to change the response payload to
    // include top level keys for document.
    data: apiVersion >= 2 ? {
      document: serializedDocument
    } : serializedDocument,
    policies: isPublic ? undefined : (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.insights", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsInsightsSchema), async ctx => {
  const {
    id,
    startDate,
    endDate
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "listViews", document);
  if (!document.insightsEnabled) {
    throw (0, _errors.ValidationError)("Insights are not enabled for this document");
  }
  const end = endDate ?? new Date();
  const start = startDate ?? new Date(end.getTime() - 30 * _time.Day.ms);
  const insights = await _models.DocumentInsight.findAll({
    where: {
      documentId: document.id,
      date: {
        [_sequelize.Op.gte]: start.toISOString().slice(0, 10),
        [_sequelize.Op.lte]: end.toISOString().slice(0, 10)
      }
    },
    order: [["date", "ASC"]]
  });
  ctx.body = {
    data: insights.map(_presenters.presentDocumentInsight)
  };
});
router.post("documents.users", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsUsersSchema), async ctx => {
  const {
    id,
    userId,
    query
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const document = await _models.Document.findByPk(id, {
    userId: actor.id
  });
  (0, _policies.authorize)(actor, "read", document);
  let where = {
    teamId: document.teamId,
    suspendedAt: {
      [_sequelize.Op.is]: null
    }
  };
  const [collection, memberIds, collectionMemberIds] = await Promise.all([document.$get("collection"), _models.Document.membershipUserIds(document.id), document.collectionId ? _models.Collection.membershipUserIds(document.collectionId) : []]);
  where = {
    ...where,
    [_sequelize.Op.or]: [{
      id: {
        [_sequelize.Op.in]: (0, _compat.uniq)([...memberIds, ...collectionMemberIds])
      }
    }, collection?.permission ? {
      role: {
        [_sequelize.Op.ne]: _types.UserRole.Guest
      }
    } : {}]
  };
  if (query) {
    where = {
      ...where,
      [_sequelize.Op.and]: [_sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
    };
  }
  if (userId) {
    where = {
      ...where,
      id: userId
    };
  }
  const replacements = {
    query: `%${query}%`
  };
  const {
    results: users,
    pagination
  } = await (0, _pagination.paginateQuery)(ctx, opts => _models.User.findAll({
    where,
    replacements,
    ...opts
  }), () => _models.User.count({
    where,
    // @ts-expect-error Types are incorrect for count
    replacements
  }));
  ctx.body = {
    pagination,
    data: users.map(user => (0, _presenters.presentUser)(user)),
    policies: (0, _presenters.presentPolicies)(actor, users)
  };
});
router.post("documents.documents", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsChildrenSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "read", document);
  let documentTree;
  if (document.collectionId) {
    const collection = await _models.Collection.findByPk(document.collectionId, {
      includeDocumentStructure: true
    });
    documentTree = collection?.getDocumentTree(document.id) ?? undefined;
  }
  ctx.body = {
    data: documentTree
  };
});
router.post("documents.export", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _authentication.default)(), (0, _validate.default)(T.DocumentsExportSchema), async ctx => {
  const {
    id,
    signedUrls,
    includeChildDocuments
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const accept = ctx.request.headers["accept"];
  const document = await (0, _documentLoader.default)({
    id,
    user,
    // We need the collaborative state to generate HTML.
    includeState: !accept?.includes("text/markdown")
  });
  (0, _policies.authorize)(user, "download", document);
  const format = accept?.includes("text/html") ? _types.FileOperationFormat.HTMLZip : accept?.includes("text/markdown") ? _types.FileOperationFormat.MarkdownZip : accept?.includes("application/pdf") ? _types.FileOperationFormat.PDF : null;
  if (format === _types.FileOperationFormat.PDF) {
    throw (0, _errors.IncorrectEditionError)("PDF export is not available in the community edition");
  }
  if (includeChildDocuments) {
    if (!format) {
      throw (0, _errors.InvalidRequestError)("format needed for exporting nested documents");
    }
    const fileOperation = await _models.FileOperation.createWithCtx(ctx, {
      type: _types.FileOperationType.Export,
      state: _types.FileOperationState.Creating,
      format,
      key: _models.FileOperation.getExportKey({
        name: document.titleWithDefault,
        teamId: document.teamId,
        format
      }),
      url: null,
      size: 0,
      documentId: document.id,
      userId: user.id,
      teamId: document.teamId
    });
    fileOperation.user = user;
    fileOperation.document = document;
    ctx.body = {
      success: true,
      data: {
        fileOperation: (0, _presenters.presentFileOperation)(fileOperation)
      }
    };
    return;
  }
  let contentType;
  let content;
  const toMarkdown = async () => _DocumentHelper.DocumentHelper.toMarkdown(document, {
    signedUrls,
    teamId: user.teamId
  });
  if (format === _types.FileOperationFormat.HTMLZip) {
    contentType = "text/html";
    content = await _DocumentHelper.DocumentHelper.toHTML(document, {
      centered: true,
      includeMermaid: true
    });
  } else if (format === _types.FileOperationFormat.MarkdownZip) {
    contentType = "text/markdown";
    content = await toMarkdown();
  } else {
    ctx.body = {
      data: await toMarkdown()
    };
    return;
  }

  // Override the extension for Markdown as it's incorrect in the mime-types
  // library until a new release > 2.1.35
  const extension = contentType === "text/markdown" ? "md" : _mimeTypes.default.extension(contentType);
  const fileName = (0, _slugify.default)(document.titleWithDefault);
  const attachmentIds = _ProsemirrorHelper.ProsemirrorHelper.parseAttachmentIds(_DocumentHelper.DocumentHelper.toProsemirror(document));
  const attachments = attachmentIds.length ? await _models.Attachment.findAll({
    where: {
      teamId: document.teamId,
      id: attachmentIds
    }
  }) : [];
  if (attachments.length === 0) {
    ctx.set("Content-Type", contentType);
    ctx.set("Content-Disposition", (0, _contentDisposition.default)(`${fileName}.${extension}`, {
      type: "attachment"
    }));
    ctx.body = content;
    return;
  }
  await (0, _koa.streamZipResponse)(ctx, `${fileName}.zip`, async zip => {
    for (const attachment of attachments) {
      const location = _nodePath.default.join("attachments", `${attachment.id}.${_mimeTypes.default.extension(attachment.contentType)}`);
      let buffer;
      try {
        buffer = await attachment.buffer;
      } catch (err) {
        _Logger.default.warn(`Failed to read attachment from storage`, {
          attachmentId: attachment.id,
          teamId: attachment.teamId,
          error: (0, _error.errToString)(err)
        });
        buffer = Buffer.from("");
      }
      zip.addBuffer(buffer, location, {
        mtime: attachment.updatedAt
      });
      content = content.replace(new RegExp((0, _compat.escapeRegExp)(attachment.redirectUrl), "g"), location);
    }
    zip.addBuffer(Buffer.from(content), `${fileName}.${extension}`, {
      mtime: document.updatedAt
    });
  });
});
router.post("documents.restore", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _validate.default)(T.DocumentsRestoreSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    collectionId,
    revisionId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    paranoid: false,
    rejectOnEmpty: true,
    transaction
  });
  await (0, _documentRestorer.default)(ctx, {
    document,
    collectionId,
    revisionId
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.search_titles", (0, _authentication.default)(), (0, _pagination.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerMinute), (0, _validate.default)(T.DocumentsSearchTitlesSchema), async ctx => {
  const {
    query,
    statusFilter,
    dateFilter,
    collectionId,
    userId,
    sort,
    direction
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const {
    user
  } = ctx.state.auth;
  let collaboratorIds = undefined;
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "readDocument", collection);
  }
  if (userId) {
    collaboratorIds = [userId];
  }
  const documents = await _SearchProviderManager.default.getProvider().searchTitlesForUser(user, {
    query,
    dateFilter,
    statusFilter,
    collectionId,
    collaboratorIds,
    offset,
    limit,
    sort: sort,
    direction: direction
  });
  const policies = (0, _presenters.presentPolicies)(user, documents);
  const data = await (0, _presenters.presentDocuments)(ctx, documents);
  ctx.body = {
    pagination: ctx.state.pagination,
    data,
    policies
  };
});
router.post("documents.search", (0, _authentication.default)({
  optional: true
}), (0, _pagination.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerMinute), (0, _validate.default)(T.DocumentsSearchSchema), async ctx => {
  const {
    query,
    collectionId,
    documentId,
    userId,
    dateFilter,
    statusFilter = [],
    shareId,
    snippetMinWords,
    snippetMaxWords,
    sort,
    direction
  } = ctx.input.body;
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const {
    user
  } = ctx.state.auth;
  let teamId;
  let response;
  let share;
  let isPublic = false;
  const searchStartedAt = Date.now();
  if (shareId) {
    const teamFromCtx = await (0, _passport.getTeamFromContext)(ctx, {
      includeOAuthState: false
    });
    const result = await (0, _shareLoader.loadPublicShare)({
      id: shareId,
      teamId: teamFromCtx?.id
    });
    share = result.share;
    let {
      collection,
      document
    } = result; // One of collection or document should be available

    // reload with membership scope if user is authenticated
    if (user) {
      collection = collection ? await _models.Collection.findByPk(collection.id, {
        userId: user.id
      }) : null;
      document = document ? await _models.Document.findByPk(document.id, {
        userId: user.id
      }) : null;
    }
    isPublic = collection ? (0, _policies.cannot)(user, "read", collection) : (0, _policies.cannot)(user, "read", document);
    if (share.documentId && !share?.includeChildDocuments) {
      throw (0, _errors.InvalidRequestError)("Child documents cannot be searched");
    }
    teamId = share.teamId;
    const team = await share.$get("team");
    (0, _invariant.default)(team, "Share must belong to a team");
    response = await _SearchProviderManager.default.getProvider().searchForTeam(team, {
      query,
      collectionId: collection?.id || document?.collectionId,
      share,
      dateFilter,
      statusFilter,
      offset,
      limit,
      snippetMinWords,
      snippetMaxWords,
      sort: sort,
      direction: direction,
      usePopularityBoost: false
    });
  } else {
    if (!user) {
      throw (0, _errors.AuthenticationError)("Authentication error");
    }
    teamId = user.teamId;
    if (collectionId) {
      const collection = await _models.Collection.findByPk(collectionId, {
        userId: user.id
      });
      (0, _policies.authorize)(user, "readDocument", collection);
    }
    let documentIds = undefined;
    if (documentId) {
      const document = await _models.Document.findByPk(documentId, {
        userId: user.id
      });
      (0, _policies.authorize)(user, "read", document);
      documentIds = [documentId, ...(await document.findAllChildDocumentIds())];
    }
    let collaboratorIds = undefined;
    if (userId) {
      collaboratorIds = [userId];
    }
    response = await _SearchProviderManager.default.getProvider().searchForUser(user, {
      query,
      collaboratorIds,
      collectionId,
      documentIds,
      dateFilter,
      statusFilter,
      offset,
      limit,
      snippetMinWords,
      snippetMaxWords,
      sort: sort,
      direction: direction
    });
  }
  const {
    results,
    total
  } = response;
  const documents = results.map(result => result.document);
  const data = await Promise.all(results.map(async result => {
    const document = await (0, _presenters.presentDocument)(ctx, result.document, {
      isPublic,
      shareId
    });
    return {
      ...result,
      document
    };
  }));

  // When requesting subsequent pages of search results we don't want to record
  // duplicate search query records
  if (query && offset === 0) {
    const duration = Date.now() - searchStartedAt;
    await _models.SearchQuery.create({
      userId: user?.id,
      teamId,
      shareId: share?.id,
      source: ctx.state.auth.type || "app",
      // we'll consider anything that isn't "api" to be "app"
      query,
      results: total,
      duration
    });
  }
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data,
    policies: user ? (0, _presenters.presentPolicies)(user, documents) : null
  };
});
router.post("documents.templatize", (0, _authentication.default)({
  role: _types.UserRole.Member
}), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.DocumentsTemplatizeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    collectionId,
    publish
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const original = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "update", original);
  if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "createTemplate", collection);
  } else {
    (0, _policies.authorize)(user, "createTemplate", user.team);
  }
  const template = await _models.Template.createWithCtx(ctx, {
    editorVersion: original.editorVersion,
    collectionId,
    teamId: user.teamId,
    publishedAt: publish ? new Date() : null,
    lastModifiedById: user.id,
    createdById: user.id,
    icon: original.icon,
    color: original.color,
    title: original.title,
    content: original.content
  });

  // reload to get all of the data needed to present (user, collection etc)
  const reloaded = await _models.Template.findByPk(template.id, {
    userId: user.id,
    transaction
  });
  (0, _invariant.default)(reloaded, "template not found");
  ctx.body = {
    data: (0, _presenters.presentTemplate)(reloaded),
    policies: (0, _presenters.presentPolicies)(user, [reloaded])
  };
});
router.post("documents.update", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    insightsEnabled,
    publish,
    collectionId,
    ...input
  } = ctx.input.body;
  const editorVersion = ctx.headers["x-editor-version"];
  const {
    user
  } = ctx.state.auth;
  let collection;
  let document = await _models.Document.findByPk(id, {
    userId: user.id,
    includeState: true,
    transaction
  });
  collection = document?.collection;
  (0, _policies.authorize)(user, "update", document);
  if (collection && insightsEnabled !== undefined) {
    (0, _policies.authorize)(user, "updateInsights", document);
  }
  if (publish) {
    await (0, _documentCreator.authorizeDocumentPublish)(ctx, document, collectionId);
  }
  document = await (0, _documentUpdater.default)(ctx, {
    document,
    ...input,
    publish,
    collectionId,
    insightsEnabled,
    editorVersion
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.duplicate", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsDuplicateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    title,
    publish,
    recursive,
    collectionId,
    parentDocumentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "read", document);
  const collection = collectionId ? await _models.Collection.findByPk(collectionId, {
    userId: user.id,
    transaction
  }) : document?.collection;
  if (collection) {
    (0, _policies.authorize)(user, "updateDocument", collection);
  }
  if (parentDocumentId) {
    const parent = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", parent);
    if (!parent.publishedAt) {
      throw (0, _errors.InvalidRequestError)("Cannot duplicate document inside a draft");
    }
  }
  const response = await (0, _documentDuplicator.default)(ctx, {
    collection,
    document,
    title,
    publish,
    recursive,
    parentDocumentId
  });
  ctx.body = {
    data: {
      documents: await (0, _presenters.presentDocuments)(ctx, response)
    },
    policies: (0, _presenters.presentPolicies)(user, response)
  };
});
router.post("documents.move", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsMoveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    parentDocumentId,
    index
  } = ctx.input.body;
  let collectionId = ctx.input.body.collectionId;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    transaction
  });
  (0, _policies.authorize)(user, "move", document);
  if (parentDocumentId) {
    const parent = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "update", parent);
    collectionId = parent.collectionId;
    if (!parent.publishedAt) {
      throw (0, _errors.InvalidRequestError)("Cannot move document inside a draft");
    }
  } else if (collectionId) {
    const collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "updateDocument", collection);
  } else {
    throw (0, _errors.InvalidRequestError)("collectionId is required to move a document");
  }
  const {
    documents,
    collectionChanged
  } = await (0, _documentMover.default)(ctx, {
    document,
    collectionId: collectionId ?? null,
    parentDocumentId,
    index
  });
  ctx.body = {
    data: {
      documents: await (0, _presenters.presentDocuments)(ctx, documents),
      // Included for backwards compatibility
      collections: []
    },
    policies: collectionChanged ? (0, _presenters.presentPolicies)(user, documents) : []
  };
});
router.post("documents.archive", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsArchiveSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const {
    transaction
  } = ctx.state;
  const document = await _models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  });
  (0, _policies.authorize)(user, "archive", document);
  await document.archiveWithCtx(ctx);
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.delete", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    permanent
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (permanent) {
    const document = await _models.Document.findByPk(id, {
      userId: user.id,
      paranoid: false,
      transaction
    });
    (0, _policies.authorize)(user, "permanentDelete", document);
    await (0, _documentPermanentDeleter.default)([document]);
    await _models.Event.createFromContext(ctx, {
      name: "documents.permanent_delete",
      documentId: document.id,
      collectionId: document.collectionId,
      data: {
        title: document.title
      }
    });
  } else {
    const document = await _models.Document.findByPk(id, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "delete", document);
    await document.destroyWithCtx(ctx);
  }
  ctx.body = {
    success: true
  };
});
router.post("documents.unpublish", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsUnpublishSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    detach
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "unpublish", document);
  await document.unpublishWithCtx(ctx, {
    detach
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.import", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _multipart.default)({
  maximumFileSize: _env.default.FILE_STORAGE_IMPORT_MAX_SIZE,
  optional: true
}), (0, _validate.default)(T.DocumentsImportSchema), async ctx => {
  const {
    collectionId,
    parentDocumentId,
    publish,
    attachmentId
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (!attachmentId && !ctx.input.file) {
    throw (0, _errors.ValidationError)("one of attachmentId or file is required");
  }
  let parentDocument = null;
  let collection = null;
  if (parentDocumentId) {
    parentDocument = await _models.Document.findByPk(parentDocumentId, {
      userId: user.id
    });
    if (parentDocument?.collectionId) {
      collection = await _models.Collection.findByPk(parentDocument.collectionId, {
        userId: user.id
      });
    }
    (0, _policies.authorize)(user, "createChildDocument", parentDocument, {
      collection
    });
  } else if (collectionId) {
    collection = await _models.Collection.findByPk(collectionId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "createDocument", collection);
  }
  let key;
  let fileName;
  let mimeType;
  if (attachmentId) {
    const attachment = await _models.Attachment.findByPk(attachmentId);
    (0, _policies.authorize)(user, "read", attachment);
    key = attachment.key;
    fileName = attachment.name;
    mimeType = attachment.contentType;
  } else {
    const file = ctx.input.file;
    const buffer = await _fsExtra.default.readFile(file.filepath);
    fileName = file.originalFilename ?? file.newFilename;
    mimeType = file.mimetype ?? "";
    key = _AttachmentHelper.default.getKey({
      id: (0, _nodeCrypto.randomUUID)(),
      name: fileName,
      userId: user.id
    });
    await _files.default.store({
      body: buffer,
      contentType: mimeType,
      contentLength: buffer.length,
      key,
      acl: "private"
    });
  }
  const job = await new _DocumentImportTask.default().schedule({
    key,
    sourceMetadata: {
      fileName,
      mimeType
    },
    userId: user.id,
    collectionId: collectionId ?? parentDocument?.collectionId,
    parentDocumentId,
    publish,
    ip: ctx.request.ip
  });
  const response = await job.finished();
  if ("error" in response) {
    throw (0, _errors.InvalidRequestError)(response.error);
  }
  const document = await _models.Document.findByPk(response.documentId, {
    userId: user.id,
    rejectOnEmpty: true
  });
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.create", (0, _authentication.default)(), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TwentyFivePerMinute), (0, _validate.default)(T.DocumentsCreateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    title,
    text,
    icon,
    color,
    publish,
    index,
    collectionId,
    parentDocumentId,
    fullWidth,
    templateId,
    createdAt
  } = ctx.input.body;
  const editorVersion = ctx.headers["x-editor-version"];
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    collection
  } = await (0, _documentCreator.authorizeDocumentCreate)(ctx, {
    collectionId,
    parentDocumentId
  });
  let template;
  if (templateId) {
    template = await _models.Template.findByPk(templateId, {
      userId: user.id,
      transaction
    });
    (0, _policies.authorize)(user, "read", template);
  }

  // Pre-process text to convert bare embed URLs to markdown link format
  const processedText = text ? (0, _embeds.convertBareUrlsToEmbedMarkdown)(text) : text;
  const document = await (0, _documentCreator.default)(ctx, {
    id,
    title,
    text: processedText ? await _TextHelper.TextHelper.replaceImagesWithAttachments(ctx, processedText, user) : processedText,
    icon,
    color,
    createdAt,
    publish,
    index,
    collectionId: collection?.id,
    parentDocumentId,
    template,
    fullWidth,
    editorVersion
  });
  if (collection) {
    document.collection = collection;
  }
  ctx.body = {
    data: await (0, _presenters.presentDocument)(ctx, document),
    policies: (0, _presenters.presentPolicies)(user, [document])
  };
});
router.post("documents.add_user", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsAddUserSchema), (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.OneHundredPerHour), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId,
    permission
  } = ctx.input.body;
  if (userId === actor.id) {
    throw (0, _errors.ValidationError)("You cannot invite yourself");
  }
  const [document, user] = await Promise.all([_models.Document.findByPk(id, {
    userId: actor.id,
    rejectOnEmpty: true,
    transaction
  }), _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(actor, "manageUsers", document);
  (0, _policies.authorize)(actor, "read", user);
  const UserMemberships = await _models.UserMembership.findAll({
    where: {
      userId
    },
    attributes: ["id", "index", "updatedAt"],
    limit: 1,
    order: [
    // using LC_COLLATE:"C" because we need byte order to drive the sorting
    // find only the first star so we can create an index before it
    _sequelize.Sequelize.literal('"user_permission"."index" collate "C"'), ["updatedAt", "DESC"]],
    transaction
  });

  // create membership at the beginning of their "Shared with me" section
  const index = (0, _fractionalIndex.default)(null, UserMemberships.length ? UserMemberships[0].index : null);
  let membership = await _models.UserMembership.findOne({
    where: {
      documentId: id,
      userId
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (membership) {
    if (permission) {
      membership.permission = permission;
      // disconnect from the source if the permission is manually updated
      membership.sourceId = null;
      await membership.save(ctx.context);
    }
  } else {
    membership = await _models.UserMembership.create({
      documentId: id,
      userId,
      index,
      permission: permission || user.defaultDocumentPermission,
      createdById: actor.id
    }, ctx.context);
  }
  ctx.body = {
    data: {
      users: [(0, _presenters.presentUser)(user)],
      memberships: [(0, _presenters.presentMembership)(membership)]
    }
  };
});
router.post("documents.remove_user", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsRemoveUserSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id,
    userId
  } = ctx.input.body;
  const [document, user] = await Promise.all([_models.Document.findByPk(id, {
    userId: actor.id,
    rejectOnEmpty: true,
    transaction
  }), _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction
  })]);
  if (actor.id !== userId) {
    (0, _policies.authorize)(actor, "manageUsers", document);
    (0, _policies.authorize)(actor, "read", user);
  }
  const membership = await _models.UserMembership.findOne({
    where: {
      documentId: id,
      userId
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("documents.add_group", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsAddGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id,
    groupId,
    permission
  } = ctx.input.body;
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const [document, group] = await Promise.all([_models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  }), _models.Group.findByPk(groupId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(user, "manageUsers", document);
  (0, _policies.authorize)(user, "read", group);
  let membership = await _models.GroupMembership.findOne({
    where: {
      documentId: id,
      groupId
    },
    lock: transaction.LOCK.UPDATE,
    ...ctx.context
  });
  if (membership) {
    if (permission) {
      membership.permission = permission;
      // disconnect from the source if the permission is manually updated
      membership.sourceId = null;
      await membership.save(ctx.context);
    }
  } else {
    membership = await _models.GroupMembership.create({
      documentId: id,
      groupId,
      permission: permission || user.defaultDocumentPermission,
      createdById: user.id
    }, ctx.context);
  }
  ctx.body = {
    data: {
      groupMemberships: [(0, _presenters.presentGroupMembership)(membership)]
    }
  };
});
router.post("documents.remove_group", (0, _authentication.default)(), (0, _validate.default)(T.DocumentsRemoveGroupSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    user
  } = ctx.state.auth;
  const {
    id,
    groupId
  } = ctx.input.body;
  const [document, group] = await Promise.all([_models.Document.findByPk(id, {
    userId: user.id,
    rejectOnEmpty: true,
    transaction
  }), _models.Group.findByPk(groupId, {
    rejectOnEmpty: true,
    transaction
  })]);
  (0, _policies.authorize)(user, "manageUsers", document);
  (0, _policies.authorize)(user, "read", group);
  const membership = await _models.GroupMembership.findOne({
    where: {
      documentId: id,
      groupId
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
    rejectOnEmpty: true
  });
  await membership.destroy(ctx.context);
  ctx.body = {
    success: true
  };
});
router.post("documents.memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user: actor
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: actor.id
  });
  (0, _policies.authorize)(actor, "update", document);
  let where = {
    documentId: id
  };
  let userWhere;
  if (query) {
    userWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.User,
      as: "user",
      where: userWhere,
      required: true
    }]
  };
  const {
    results: memberships,
    pagination
  } = await (0, _pagination.paginateQuery)(ctx, opts => _models.UserMembership.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    ...opts
  }), () => _models.UserMembership.count(options));
  ctx.body = {
    pagination,
    data: {
      memberships: memberships.map(_presenters.presentMembership),
      users: memberships.map(membership => (0, _presenters.presentUser)(membership.user))
    }
  };
});
router.post("documents.group_memberships", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.DocumentsMembershipsSchema), async ctx => {
  const {
    id,
    query,
    permission
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const document = await _models.Document.findByPk(id, {
    userId: user.id
  });
  (0, _policies.authorize)(user, "update", document);
  let where = {
    documentId: id
  };
  let groupWhere;
  if (query) {
    groupWhere = {
      name: {
        [_sequelize.Op.iLike]: `%${query}%`
      }
    };
  }
  if (permission) {
    where = {
      ...where,
      permission
    };
  }
  const options = {
    where,
    include: [{
      model: _models.Group,
      as: "group",
      where: groupWhere,
      required: true
    }]
  };
  const {
    results: memberships,
    pagination
  } = await (0, _pagination.paginateQuery)(ctx, opts => _models.GroupMembership.findAll({
    ...options,
    order: [["createdAt", "DESC"]],
    ...opts
  }), () => _models.GroupMembership.count(options));
  const groupMemberships = memberships.map(_presenters.presentGroupMembership);
  ctx.body = {
    pagination,
    data: {
      groupMemberships,
      groups: await Promise.all(memberships.map(membership => (0, _presenters.presentGroup)(membership.group)))
    }
  };
});
router.post("documents.empty_trash", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), async ctx => {
  const {
    user
  } = ctx.state.auth;
  const collectionIds = await user.collectionIds({
    paranoid: false
  });
  const documents = await _models.Document.scope("withDrafts").findAll({
    attributes: ["id"],
    where: {
      deletedAt: {
        [_sequelize.Op.ne]: null
      },
      [_sequelize.Op.or]: [{
        collectionId: {
          [_sequelize.Op.in]: collectionIds
        }
      }, {
        createdById: user.id,
        collectionId: {
          [_sequelize.Op.is]: null
        }
      }]
    },
    paranoid: false
  });
  if (documents.length) {
    await new _EmptyTrashTask.default().schedule({
      documentIds: documents.map(doc => doc.id)
    });
  }
  await _models.Event.createFromContext(ctx, {
    name: "documents.empty_trash"
  });
  ctx.body = {
    success: true
  };
});

// Remove this helper once apiVersion is removed (#6175)
function getAPIVersion(ctx) {
  return Number(ctx.headers["x-api-version"] ?? (typeof ctx.input.body === "object" && ctx.input.body && "apiVersion" in ctx.input.body && ctx.input.body.apiVersion) ?? 0);
}
var _default = exports.default = router;