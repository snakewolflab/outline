"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isElevatedPermission = exports.getDocumentPermission = exports.canUserAccessDocument = exports.DocumentPermissionPriority = exports.CollectionPermissionPriority = void 0;
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _types = require("../../shared/types");
var _models = require("../models");
var _policies = require("../policies");
// Higher value takes precedence
const CollectionPermissionPriority = exports.CollectionPermissionPriority = {
  [_types.CollectionPermission.Admin]: 2,
  [_types.CollectionPermission.ReadWrite]: 1,
  [_types.CollectionPermission.Read]: 0
};

// Higher value takes precedence
const DocumentPermissionPriority = exports.DocumentPermissionPriority = {
  [_types.DocumentPermission.Admin]: 2,
  [_types.DocumentPermission.ReadWrite]: 1,
  [_types.DocumentPermission.Read]: 0
};

/**
 * Check if the given user can access a document
 *
 * @param user - The user to check
 * @param documentId - The document to check
 * @returns Boolean whether the user can access the document
 */
const canUserAccessDocument = async (user, documentId) => {
  try {
    const document = await _models.Document.findByPk(documentId, {
      userId: user.id
    });
    (0, _policies.authorize)(user, "read", document);
    return true;
  } catch (_err) {
    return false;
  }
};

/**
 * Determines whether the user's access to a document is being elevated with the new permission.
 *
 * @param {Object} params Input parameters.
 * @param {string} params.userId The user to check.
 * @param {string} params.documentId The document to check.
 * @param {DocumentPermission} params.permission The new permission given to the user.
 * @param {string} params.skipMembershipId The membership to skip when comparing the existing permissions.
 * @returns {boolean} Whether the user has a higher access level
 */
exports.canUserAccessDocument = canUserAccessDocument;
const isElevatedPermission = async _ref => {
  let {
    userId,
    documentId,
    permission,
    skipMembershipId
  } = _ref;
  const existingPermission = await getDocumentPermission({
    userId,
    documentId,
    skipMembershipId
  });
  if (!existingPermission) {
    return true;
  }
  return DocumentPermissionPriority[existingPermission] < DocumentPermissionPriority[permission];
};

/**
 * Returns the user's permission to a document.
 *
 * @param {Object} params Input parameters.
 * @param {string} params.userId The user to check.
 * @param {string} params.documentId The document to check.
 * @param {string} params.skipMembershipId The membership to skip when comparing the existing permissions.
 * @returns {DocumentPermission | undefined} Highest permission, if it exists.
 */
exports.isElevatedPermission = isElevatedPermission;
const getDocumentPermission = async _ref2 => {
  let {
    userId,
    documentId,
    skipMembershipId
  } = _ref2;
  const document = await _models.Document.findByPk(documentId, {
    userId
  });
  const permissions = [];
  const collection = document?.collection;
  if (collection) {
    const collectionPermissions = (0, _compat.orderBy)((0, _compat.compact)([collection.permission, ...(0, _compat.compact)(collection.memberships?.map(m => m.permission)), ...(0, _compat.compact)(collection.groupMemberships?.map(m => m.permission))]), permission => CollectionPermissionPriority[permission], "desc");
    if (collectionPermissions[0]) {
      permissions.push(collectionPermissions[0] === _types.CollectionPermission.Read ? _types.DocumentPermission.Read : _types.DocumentPermission.ReadWrite);
    }
  }
  const userMembershipWhere = {
    userId,
    documentId
  };
  const groupMembershipWhere = {
    documentId
  };
  if (skipMembershipId) {
    userMembershipWhere.id = {
      [_sequelize.Op.ne]: skipMembershipId
    };
    groupMembershipWhere.id = {
      [_sequelize.Op.ne]: skipMembershipId
    };
  }
  const [userMemberships, groupMemberships] = await Promise.all([_models.UserMembership.findAll({
    where: userMembershipWhere
  }), _models.GroupMembership.findAll({
    where: groupMembershipWhere,
    include: [{
      model: _models.Group.filterByMember(userId),
      as: "group",
      required: true
    }]
  })]);
  permissions.push(...userMemberships.map(m => m.permission), ...groupMemberships.map(m => m.permission));
  const orderedPermissions = (0, _compat.orderBy)(permissions, permission => DocumentPermissionPriority[permission], "desc");
  return orderedPermissions[0];
};
exports.getDocumentPermission = getDocumentPermission;