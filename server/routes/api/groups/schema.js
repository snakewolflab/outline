"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GroupsUpdateUserSchema = exports.GroupsUpdateSchema = exports.GroupsRemoveUserSchema = exports.GroupsMembershipsSchema = exports.GroupsListSchema = exports.GroupsInfoSchema = exports.GroupsDeleteSchema = exports.GroupsDeleteAllSchema = exports.GroupsCreateSchema = exports.GroupsAddUserSchema = void 0;
var _zod = require("zod");
var _types = require("../../../../shared/types");
var _validations = require("../../../../shared/validations");
var _models = require("../../../models");
const BaseIdSchema = _zod.z.object({
  /** Group Id */
  id: _zod.z.uuid()
});
const GroupsListSchema = exports.GroupsListSchema = _zod.z.object({
  body: _zod.z.object({
    /** Groups sorting direction */
    direction: _zod.z.string().optional().transform(val => val !== "ASC" ? "DESC" : val),
    /** Groups sorting column */
    sort: _zod.z.string().refine(val => Object.keys(_models.Group.getAttributes()).includes(val) || val === "source", {
      error: "Invalid sort parameter"
    }).prefault("updatedAt"),
    /** Only list groups where this user is a member */
    userId: _zod.z.uuid().optional(),
    /** Find group matching externalId */
    externalId: _zod.z.string().optional(),
    /** @deprecated Find group with matching name */
    name: _zod.z.string().optional(),
    /** Filter groups by source: "manual" for non-synced, or a provider name */
    source: _zod.z.string().optional(),
    /** Find group matching query */
    query: _zod.z.string().optional()
  })
});
const GroupsInfoSchema = exports.GroupsInfoSchema = _zod.z.object({
  body: _zod.z.object({
    /** Group Id */
    id: _zod.z.uuid().optional(),
    /** External source. */
    externalId: _zod.z.string().optional()
  })
});
const GroupsCreateSchema = exports.GroupsCreateSchema = _zod.z.object({
  body: _zod.z.object({
    /** Group name */
    name: _zod.z.string().max(_validations.GroupValidation.maxNameLength),
    /** Group description */
    description: _zod.z.string().max(_validations.GroupValidation.maxDescriptionLength).optional(),
    /** Optionally link this group to an external source. */
    externalId: _zod.z.string().optional(),
    /** Whether mentions are disabled for this group */
    disableMentions: _zod.z.boolean().optional().prefault(false)
  })
});
const GroupsUpdateSchema = exports.GroupsUpdateSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** Group name */
    name: _zod.z.string().max(_validations.GroupValidation.maxNameLength).optional(),
    /** Group description */
    description: _zod.z.string().max(_validations.GroupValidation.maxDescriptionLength).optional(),
    /** Optionally link this group to an external source. */
    externalId: _zod.z.string().optional(),
    /** Whether mentions are disabled for this group */
    disableMentions: _zod.z.boolean().optional()
  })
});
const GroupsDeleteSchema = exports.GroupsDeleteSchema = _zod.z.object({
  body: BaseIdSchema
});
const GroupsDeleteAllSchema = exports.GroupsDeleteAllSchema = _zod.z.object({
  body: _zod.z.object({
    /** The authentication provider whose synced groups should be deleted. */
    authenticationProviderId: _zod.z.uuid()
  })
});
const GroupsMembershipsSchema = exports.GroupsMembershipsSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** Group name search query */
    query: _zod.z.string().optional(),
    /** Filter by group permission */
    permission: _zod.z.nativeEnum(_types.GroupPermission).optional()
  })
});
const GroupsAddUserSchema = exports.GroupsAddUserSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** User Id */
    userId: _zod.z.uuid(),
    /** The permission of the user in the group */
    permission: _zod.z.enum(_types.GroupPermission).optional().prefault(_types.GroupPermission.Member)
  })
});
const GroupsRemoveUserSchema = exports.GroupsRemoveUserSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** User Id */
    userId: _zod.z.uuid()
  })
});
const GroupsUpdateUserSchema = exports.GroupsUpdateUserSchema = _zod.z.object({
  body: BaseIdSchema.extend({
    /** User Id */
    userId: _zod.z.uuid(),
    /** The permission of the user in the group */
    permission: _zod.z.enum(_types.GroupPermission)
  })
});