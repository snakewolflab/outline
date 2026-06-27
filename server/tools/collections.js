"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collectionTools = collectionTools;
var _zod = require("zod");
var _sequelize = require("sequelize");
var _models = require("../models");
var _database = require("../storage/database");
var _policies = require("../policies");
var _presenters = require("../presenters");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _UrlHelper = require("../../shared/utils/UrlHelper");
var _util = require("./util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Registers collection-related MCP tools on the given server, filtered by
 * the OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function collectionTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("collections.list", scopes)) {
    server.registerTool("list_collections", {
      title: "List collections",
      description: "Lists all collections the authenticated user has access to. Returns a summary of each collection.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        query: (0, _util.optionalString)().describe("An optional search query to filter collections by name."),
        offset: _zod.z.coerce.number().int().min(0).optional().describe("The pagination offset. Defaults to 0."),
        limit: _zod.z.coerce.number().int().min(1).max(100).optional().describe("The maximum number of results to return. Defaults to 25, max 100.")
      }
    }, (0, _util.withTracing)("list_collections", async (_ref, extra) => {
      let {
        query,
        offset,
        limit
      } = _ref;
      try {
        const user = (0, _util.getActorFromContext)(extra);
        const collectionIds = await user.collectionIds();
        const and = [{
          deletedAt: {
            [_sequelize.Op.eq]: null
          }
        }, {
          archivedAt: {
            [_sequelize.Op.eq]: null
          }
        }, {
          id: collectionIds
        }];
        if (query) {
          and.push(_sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`));
        }
        const where = {
          teamId: user.teamId,
          [_sequelize.Op.and]: and
        };
        const collections = await _models.Collection.scope({
          method: ["withMembership", user.id]
        }).findAll({
          where,
          replacements: {
            query: `%${query}%`
          },
          order: [_sequelize.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
          offset: offset ?? 0,
          limit: limit ?? 25
        });

        // If the query looks like a collection ID or urlId, try direct
        // lookup first so exact matches appear at the top of results.
        let exactMatch = null;
        if (query && _UrlHelper.UrlHelper.SLUG_URL_REGEX.test(query)) {
          exactMatch = await _models.Collection.findByPk(query, {
            userId: user.id
          });
          if (exactMatch && !collectionIds.includes(exactMatch.id)) {
            exactMatch = null;
          }
        }
        const presented = await Promise.all(collections.filter(c => c.id !== exactMatch?.id).map(async collection => (0, _util.pathToUrl)(user.team, await (0, _presenters.presentCollection)(undefined, collection))));
        if (exactMatch) {
          presented.unshift((0, _util.pathToUrl)(user.team, await (0, _presenters.presentCollection)(undefined, exactMatch)));
        }
        return (0, _util.success)(presented);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("collections.create", scopes)) {
    server.registerTool("create_collection", {
      title: "Create collection",
      description: "Creates a new collection. Collections are used to organize documents.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        name: _zod.z.string().describe("The name of the collection."),
        description: _zod.z.string().optional().describe("A markdown description for the collection."),
        icon: (0, _util.optionalString)().describe("An icon for the collection, e.g. an emoji."),
        color: (0, _util.optionalString)().describe("The hex color for the collection icon, e.g. #FF0000.")
      }
    }, (0, _util.withTracing)("create_collection", async (input, context) => {
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const team = await _models.Team.findByPk(user.teamId, {
          rejectOnEmpty: true
        });
        (0, _policies.authorize)(user, "createCollection", team);
        const collection = _models.Collection.build({
          name: input.name,
          description: input.description,
          icon: input.icon,
          color: input.color,
          teamId: user.teamId,
          createdById: user.id,
          permission: null
        });
        await collection.saveWithCtx(ctx);
        const reloaded = await _models.Collection.findByPk(collection.id, {
          userId: user.id,
          rejectOnEmpty: true
        });
        const presented = (0, _util.pathToUrl)(user.team, await (0, _presenters.presentCollection)(undefined, reloaded));
        return (0, _util.success)(presented);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("collections.update", scopes)) {
    server.registerTool("update_collection", {
      title: "Update collection",
      description: "Updates an existing collection by its ID. Only the fields provided will be updated.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the collection to update."),
        name: (0, _util.optionalString)().describe("The new name for the collection."),
        description: _zod.z.string().optional().describe("The new markdown description for the collection."),
        icon: _zod.z.string().nullable().optional().describe("An icon for the collection, e.g. an emoji. Set to null to remove."),
        color: _zod.z.string().nullable().optional().describe("The hex color for the collection icon. Set to null to remove.")
      }
    }, (0, _util.withTracing)("update_collection", async (input, context) => {
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        const collection = await _models.Collection.findByPk(input.id, {
          userId: user.id,
          rejectOnEmpty: true
        });
        (0, _policies.authorize)(user, "update", collection);
        if (input.name !== undefined) {
          collection.name = input.name.trim();
        }
        if (input.description !== undefined) {
          collection.description = input.description;
        }
        if (input.icon !== undefined) {
          collection.icon = input.icon;
        }
        if (input.color !== undefined) {
          collection.color = input.color;
        }
        await collection.saveWithCtx(ctx);
        const presented = (0, _util.pathToUrl)(user.team, await (0, _presenters.presentCollection)(undefined, collection));
        return (0, _util.success)(presented);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
  if (_AuthenticationHelper.default.canAccess("collections.delete", scopes)) {
    server.registerTool("delete_collection", {
      title: "Delete collection",
      description: "Deletes a collection by its ID. Non-archived documents within the collection will also be deleted. Set archive to true to archive the collection instead of deleting it.",
      annotations: {
        idempotentHint: false,
        readOnlyHint: false
      },
      inputSchema: {
        id: _zod.z.string().describe("The unique identifier of the collection to delete."),
        archive: _zod.z.boolean().optional().describe("Set to true to archive the collection instead of deleting it. All documents within the collection will also be archived.")
      }
    }, (0, _util.withTracing)("delete_collection", async (_ref2, context) => {
      let {
        id,
        archive
      } = _ref2;
      try {
        const ctx = (0, _util.buildAPIContext)(context);
        const {
          user
        } = ctx.state.auth;
        await _database.sequelize.transaction(async transaction => {
          ctx.state.transaction = transaction;
          ctx.context.transaction = transaction;
          const collection = await _models.Collection.findByPk(id, {
            userId: user.id,
            rejectOnEmpty: true,
            transaction
          });
          if (archive) {
            (0, _policies.authorize)(user, "archive", collection);
            await collection.archiveWithCtx(ctx);
          } else {
            (0, _policies.authorize)(user, "delete", collection);
            await collection.destroyWithCtx(ctx);
          }
        });
        return (0, _util.success)({
          success: true
        });
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
}