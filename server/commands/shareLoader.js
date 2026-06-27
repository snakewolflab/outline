"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllIdsInSharedTree = getAllIdsInSharedTree;
exports.loadPublicShare = loadPublicShare;
exports.loadShareWithParent = loadShareWithParent;
var _sequelize = require("sequelize");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _UrlHelper = require("../../shared/utils/UrlHelper");
var _errors = require("../errors");
var _models = require("../models");
var _policies = require("../policies");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function loadPublicShare(_ref) {
  let {
    id,
    collectionId,
    documentId,
    teamId
  } = _ref;
  const urlId = !(0, _isUUID.default)(id) && _UrlHelper.UrlHelper.SHARE_URL_SLUG_REGEX.test(id) ? id : undefined;
  if (urlId && !teamId) {
    throw (0, _errors.InvalidRequestError)("teamId required for fetching share using urlId");
  }
  const where = {
    revokedAt: {
      [_sequelize.Op.is]: null
    },
    published: true
  };
  if (urlId) {
    where.urlId = id;
    where.teamId = teamId;
  } else {
    where.id = id;
  }
  const share = await _models.Share.findOne({
    where,
    include: [{
      model: _models.Document.scope("withDrafts"),
      as: "document",
      include: [{
        model: _models.Collection.scope("withDocumentStructure"),
        as: "collection",
        required: false
      }]
    }, {
      model: _models.Collection.scope("withDocumentStructure"),
      as: "collection"
    }]
  });
  if (!share || !!share.team.suspendedAt || !!share.collection?.archivedAt || !!share.document?.archivedAt) {
    throw (0, _errors.NotFoundError)();
  }
  const isDraftWithoutCollection = !!share.document?.isDraft && !share.document.collectionId;
  const associatedCollection = share.collection ?? share.document?.collection;
  if (!share.team.sharing || !isDraftWithoutCollection && !associatedCollection?.sharing) {
    throw (0, _errors.AuthorizationError)();
  }
  let sharedTree = null;
  let document = null;
  if (share.collection) {
    sharedTree = associatedCollection?.toNavigationNode() ?? null;
  } else if (share.document && share.includeChildDocuments) {
    sharedTree = associatedCollection?.getDocumentTree(share.document.id) ?? null;
  }
  if (sharedTree && share.domain) {
    sharedTree.url = "";
  }
  if (collectionId && collectionId !== share.collectionId) {
    throw (0, _errors.AuthorizationError)();
  }
  if (documentId && documentId !== share.documentId) {
    document = await _models.Document.findByPk(documentId, {
      rejectOnEmpty: true
    });
    let isDocumentAccessible = share.documentId === document.id;
    if (share.includeChildDocuments) {
      const allIdsInSharedTree = getAllIdsInSharedTree(sharedTree);
      isDocumentAccessible = allIdsInSharedTree.includes(document.id);
    }
    if (!isDocumentAccessible) {
      throw (0, _errors.AuthorizationError)();
    }
  } else {
    document = share.document;
  }
  if (document?.isTrialImport) {
    throw (0, _errors.PaymentRequiredError)();
  }
  return {
    share,
    sharedTree,
    collection: share.collection,
    document
  };
}
async function loadShareWithParent(_ref2) {
  let {
    collectionId,
    documentId,
    user
  } = _ref2;
  const where = {
    revokedAt: {
      [_sequelize.Op.is]: null
    },
    teamId: user.teamId
  };
  if (collectionId) {
    where.collectionId = collectionId;
  } else if (documentId) {
    where.documentId = documentId;
  }
  const share = await _models.Share.scope({
    method: ["withCollectionPermissions", user.id]
  }).findOne({
    where
  });
  if (!share) {
    throw (0, _errors.NotFoundError)();
  }
  (0, _policies.authorize)(user, "read", share);
  if (collectionId) {
    (0, _policies.authorize)(user, "read", share.collection);
  }
  let parentShare = null;

  // Load the parent shares and return one (needed for share toggle in UI).
  // Parent share is needed for documents only since collections don't have parents.
  if (documentId) {
    (0, _policies.authorize)(user, "read", share.document);
    const docCollectionId = share.document.collectionId;
    if (!docCollectionId) {
      throw (0, _errors.NotFoundError)("Collection not found for the shared document");
    }
    const docCollection = await _models.Collection.findByPk(docCollectionId, {
      userId: user.id,
      includeDocumentStructure: true,
      rejectOnEmpty: true
    });
    const collectionShare = await _models.Share.scope({
      method: ["withCollectionPermissions", user.id]
    }).findOne({
      where: {
        revokedAt: {
          [_sequelize.Op.is]: null
        },
        published: true,
        teamId: user.teamId,
        collectionId: docCollectionId
      }
    });

    // prefer collection share if it exists and user has read access.
    if (collectionShare && (0, _policies.can)(user, "read", collectionShare)) {
      parentShare = collectionShare;
    } else {
      const parentDocIds = docCollection.getDocumentParents(documentId);
      const allParentShares = parentDocIds ? await _models.Share.scope({
        method: ["withCollectionPermissions", user.id]
      }).findAll({
        where: {
          revokedAt: {
            [_sequelize.Op.is]: null
          },
          published: true,
          teamId: user.teamId,
          includeChildDocuments: true,
          documentId: parentDocIds
        }
      }) : null;
      parentShare = allParentShares?.find(s => (0, _policies.can)(user, "read", s)) ?? null;
    }
  }
  return {
    share,
    parentShare
  };
}

/**
 * Recursively extracts all document IDs from a shared tree navigation node.
 *
 * @param sharedTree The navigation node representing the shared tree.
 * @returns Array of all document IDs in the tree.
 */
function getAllIdsInSharedTree(sharedTree) {
  if (!sharedTree) {
    return [];
  }
  const ids = [sharedTree.id];
  for (const child of sharedTree.children) {
    ids.push(...getAllIdsInSharedTree(child));
  }
  return ids;
}