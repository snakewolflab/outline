"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTool = fetchTool;
var _zod = require("zod");
var _models = require("../models");
var _policies = require("../policies");
var _errors = require("../errors");
var _presenters = require("../presenters");
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _documents = require("./documents");
var _templates = require("./templates");
var _util = require("./util");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SELF_TOKENS = new Set(["self", "me", "current_user"]);

/**
 * Extracts a resource identifier from a value that may be a URL or a plain ID.
 * When a URL is detected the last non-empty path segment is returned as the
 * slug, which the model's findByPk override can resolve.
 *
 * @param value - a URL string or plain identifier.
 * @returns the extracted identifier.
 */
function extractId(value) {
  if (/^https?:\/\//.test(value)) {
    try {
      const url = new URL(value);
      const queryId = url.searchParams.get("id");
      if (queryId) {
        return queryId;
      }
      const segments = url.pathname.split("/").filter(Boolean);
      return segments[segments.length - 1] ?? value;
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Registers the unified "fetch" MCP tool on the given server. The tool is
 * only registered when at least one of the underlying info scopes is granted.
 *
 * @param server - the MCP server instance to register on.
 * @param scopes - the OAuth scopes granted to the access token.
 */
function fetchTool(server, scopes) {
  const canReadDocuments = _AuthenticationHelper.default.canAccess("documents.info", scopes);
  const canReadCollections = _AuthenticationHelper.default.canAccess("collections.info", scopes);
  const canReadUsers = _AuthenticationHelper.default.canAccess("users.info", scopes);
  const canReadAttachments = _AuthenticationHelper.default.canAccess("attachments.info", scopes);
  const canReadTemplates = _AuthenticationHelper.default.canAccess("templates.info", scopes);
  if (!canReadDocuments && !canReadCollections && !canReadUsers && !canReadAttachments && !canReadTemplates) {
    return;
  }
  const allowedTypes = [...(canReadDocuments ? ["document"] : []), ...(canReadCollections ? ["collection"] : []), ...(canReadUsers ? ["user"] : []), ...(canReadAttachments ? ["attachment"] : []), ...(canReadTemplates ? ["template"] : [])];
  server.registerTool("fetch", {
    title: "Fetch",
    description: 'Fetches a document, collection, user, attachment, or template by type and ID. When fetching a collection the response includes the full hierarchical document tree. For users, "current_user" can be used as the ID to get the authenticated user. For attachments, the response includes a short-lived signed URL that can be used to download the file contents directly. For templates, the response includes the template body as markdown.',
    annotations: {
      idempotentHint: true,
      readOnlyHint: true
    },
    inputSchema: {
      resource: _zod.z.enum(allowedTypes).describe("The resource to fetch."),
      id: _zod.z.string().describe('The unique identifier or URL. For users, "current_user" returns the authenticated user.')
    }
  }, (0, _util.withTracing)("fetch", async (_ref, extra) => {
    let {
      resource,
      id: rawId
    } = _ref;
    try {
      const actor = (0, _util.getActorFromContext)(extra);
      const id = extractId(rawId);
      switch (resource) {
        case "document":
          {
            const document = await _models.Document.findByPk(id, {
              userId: actor.id,
              rejectOnEmpty: true
            });
            (0, _policies.authorize)(actor, "read", document);
            const [{
              text,
              ...attributes
            }, breadcrumb] = await Promise.all([(0, _documents.presentDocument)(document, {
              includeData: false,
              includeText: true,
              includeUpdatedAt: true,
              includeCommentCount: true
            }), (0, _util.getDocumentBreadcrumb)(document, actor)]);
            return {
              content: [{
                type: "text",
                text: JSON.stringify({
                  document: (0, _util.pathToUrl)(actor.team, attributes),
                  ...(breadcrumb !== undefined && {
                    breadcrumb
                  })
                })
              }, {
                type: "text",
                text: typeof text === "string" ? text : ""
              }]
            };
          }
        case "collection":
          {
            const collection = await _models.Collection.findByPk(id, {
              userId: actor.id,
              includeDocumentStructure: true,
              rejectOnEmpty: true
            });
            (0, _policies.authorize)(actor, "read", collection);
            const presented = await (0, _presenters.presentCollection)(undefined, collection);
            return (0, _util.success)([(0, _util.pathToUrl)(actor.team, presented), (collection.documentStructure ?? []).map(node => (0, _presenters.presentNavigationNode)(actor.team, node))]);
          }
        case "user":
          {
            const user = SELF_TOKENS.has(id.toLowerCase()) ? actor : await _models.User.findByPk(id, {
              rejectOnEmpty: true
            });
            (0, _policies.authorize)(actor, "read", user);
            return (0, _util.success)((0, _presenters.presentUser)(user, {
              includeEmail: !!(0, _policies.can)(actor, "readEmail", user),
              includeDetails: !!(0, _policies.can)(actor, "readDetails", user)
            }));
          }
        case "attachment":
          {
            const attachment = await _models.Attachment.findByPk(id, {
              rejectOnEmpty: true
            });

            // Private attachments are accessible to any member of the workspace they
            // belong to. This is intentional and not a permission bypass – attachments
            // are owned by the workspace (team), not by individual documents or users.
            if (attachment.teamId !== actor?.teamId) {
              throw (0, _errors.AuthorizationError)();
            }
            return (0, _util.success)({
              id: attachment.id,
              name: attachment.name,
              contentType: attachment.contentType,
              size: attachment.size,
              signedUrl: await attachment.signedUrl
            });
          }
        case "template":
          {
            const template = await _models.Template.findByPk(id, {
              userId: actor.id,
              rejectOnEmpty: true
            });
            (0, _policies.authorize)(actor, "read", template);
            const {
              text,
              ...attributes
            } = await (0, _templates.presentTemplate)(template);
            return {
              content: [{
                type: "text",
                text: JSON.stringify((0, _util.pathToUrl)(actor.team, attributes))
              }, {
                type: "text",
                text
              }]
            };
          }
        default:
          return (0, _util.error)(`Unknown resource: ${resource}`);
      }
    } catch (message) {
      return (0, _util.error)(message);
    }
  }));
}