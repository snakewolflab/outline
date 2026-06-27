"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.userTools = userTools;
var _zod = require("zod");
var _sequelize = require("sequelize");
var _types = require("../../shared/types");
var _models = require("../models");
var _policies = require("../policies");
var _presenters = require("../presenters");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _util = require("./util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Registers user-related MCP tools on the given server, filtered by the
 * OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function userTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("users.list", scopes)) {
    server.registerTool("list_users", {
      title: "List users",
      description: "Lists users in the workspace.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        query: (0, _util.optionalString)().describe("An optional search query to filter users by name or email."),
        role: _zod.z.enum([_types.UserRole.Admin, _types.UserRole.Member, _types.UserRole.Viewer, _types.UserRole.Guest]).optional().describe("Filter users by role."),
        filter: _zod.z.enum(["active", "suspended", "invited", "all"]).optional().describe("Filter users by status. Defaults to active, non-suspended users. Note filtering by 'suspended' is only available to admins."),
        offset: _zod.z.coerce.number().int().min(0).optional().describe("The pagination offset. Defaults to 0."),
        limit: _zod.z.coerce.number().int().min(1).max(100).optional().describe("The maximum number of results to return. Defaults to 25, max 100.")
      }
    }, (0, _util.withTracing)("list_users", async (_ref, extra) => {
      let {
        query,
        role,
        filter,
        offset,
        limit
      } = _ref;
      try {
        const actor = (0, _util.getActorFromContext)(extra);
        const team = await _models.Team.findByPk(actor.teamId, {
          rejectOnEmpty: true
        });
        (0, _policies.authorize)(actor, "listUsers", team);
        const effectiveOffset = offset ?? 0;
        const effectiveLimit = limit ?? 25;
        let where = {
          teamId: actor.teamId
        };

        // Non-admins cannot see suspended users
        if (!actor.isAdmin) {
          where = {
            ...where,
            suspendedAt: {
              [_sequelize.Op.eq]: null
            }
          };
        }
        switch (filter) {
          case "invited":
            {
              where = {
                ...where,
                lastActiveAt: null
              };
              break;
            }
          case "suspended":
            {
              if (actor.isAdmin) {
                where = {
                  ...where,
                  suspendedAt: {
                    [_sequelize.Op.ne]: null
                  }
                };
              }
              break;
            }
          case "active":
            {
              where = {
                ...where,
                lastActiveAt: {
                  [_sequelize.Op.ne]: null
                },
                suspendedAt: {
                  [_sequelize.Op.is]: null
                }
              };
              break;
            }
          case "all":
            {
              break;
            }
          default:
            {
              where = {
                ...where,
                suspendedAt: {
                  [_sequelize.Op.is]: null
                }
              };
              break;
            }
        }
        if (role) {
          where = {
            ...where,
            role
          };
        }
        if (query) {
          where = {
            ...where,
            [_sequelize.Op.and]: {
              [_sequelize.Op.or]: [_sequelize.Sequelize.literal(`unaccent(LOWER(email)) like unaccent(LOWER(:query))`), _sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
            }
          };
        }
        const replacements = {
          query: `%${query}%`
        };
        const users = await _models.User.findAll({
          where,
          replacements,
          order: [["name", "ASC"]],
          offset: effectiveOffset,
          limit: effectiveLimit
        });
        const presented = users.map(user => (0, _presenters.presentUser)(user, {
          includeEmail: !!(0, _policies.can)(actor, "readEmail", user),
          includeDetails: !!(0, _policies.can)(actor, "readDetails", user)
        }));
        return (0, _util.success)(presented);
      } catch (err) {
        return (0, _util.error)(err);
      }
    }));
  }
}