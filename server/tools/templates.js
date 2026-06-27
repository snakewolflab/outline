"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.presentTemplate = presentTemplate;
exports.templateTools = templateTools;
var _zod = require("zod");
var _sequelize = require("sequelize");
var _models = require("../models");
var _DocumentHelper = require("../models/helpers/DocumentHelper");
var _policies = require("../policies");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _util = require("./util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Presents a template's metadata and rendered markdown body for a tool
 * response. Including the body lets a caller list templates and create a
 * document from one — verbatim or adapted — without a separate fetch call.
 *
 * @param template - the template to present.
 * @returns the presented template with its body as markdown.
 */
async function presentTemplate(template) {
  return {
    id: template.id,
    url: template.path,
    title: template.title,
    collectionId: template.collectionId ?? null,
    updatedAt: template.updatedAt,
    text: template.content ? await _DocumentHelper.DocumentHelper.toMarkdown(template.content, {
      includeTitle: false
    }) : ""
  };
}

/**
 * Registers template-related MCP tools on the given server, filtered by the
 * OAuth scopes granted to the current token.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function templateTools(server, scopes) {
  if (_AuthenticationHelper.default.canAccess("templates.list", scopes)) {
    server.registerTool("list_templates", {
      title: "List templates",
      description: "Lists document templates the user has access to, including workspace-wide templates and templates within accessible collections. Each result includes the template body as markdown. To create a document from a template unchanged, pass its ID as templateId to create_document. To adapt it first, modify the returned text and pass it as the text parameter to create_document — no separate fetch is needed.",
      annotations: {
        idempotentHint: true,
        readOnlyHint: true
      },
      inputSchema: {
        collectionId: (0, _util.optionalString)().describe("A collection ID to filter templates by. Omit to include workspace-wide templates and templates from all accessible collections."),
        offset: _zod.z.coerce.number().int().min(0).optional().describe("The pagination offset. Defaults to 0."),
        limit: _zod.z.coerce.number().int().min(1).max(100).optional().describe("The maximum number of results to return. Defaults to 25, max 100.")
      }
    }, (0, _util.withTracing)("list_templates", async (_ref, extra) => {
      let {
        collectionId,
        offset,
        limit
      } = _ref;
      try {
        const user = (0, _util.getActorFromContext)(extra);
        const effectiveOffset = offset ?? 0;
        const effectiveLimit = limit ?? 25;
        const where = {
          teamId: user.teamId,
          [_sequelize.Op.and]: [{
            deletedAt: {
              [_sequelize.Op.eq]: null
            }
          }]
        };
        if (collectionId) {
          const collection = await _models.Collection.findByPk(collectionId, {
            userId: user.id
          });
          (0, _policies.authorize)(user, "read", collection);
          where[_sequelize.Op.and].push({
            collectionId
          });
        } else {
          where[_sequelize.Op.and].push({
            [_sequelize.Op.or]: [{
              collectionId: {
                [_sequelize.Op.eq]: null
              }
            }, {
              collectionId: await user.collectionIds()
            }]
          });
        }
        const templates = await _models.Template.scope(["defaultScope", {
          method: ["withMembership", user.id]
        }]).findAll({
          where,
          order: [["updatedAt", "DESC"]],
          offset: effectiveOffset,
          limit: effectiveLimit
        });
        const presented = await Promise.all(templates.map(async template => (0, _util.pathToUrl)(user.team, await presentTemplate(template))));
        return (0, _util.success)(presented);
      } catch (message) {
        return (0, _util.error)(message);
      }
    }));
  }
}