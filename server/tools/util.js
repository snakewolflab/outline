"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildAPIContext = buildAPIContext;
exports.buildBreadcrumb = buildBreadcrumb;
exports.buildSiblingIndexMap = buildSiblingIndexMap;
exports.error = error;
exports.getActorFromContext = getActorFromContext;
exports.getBreadcrumbsForDocuments = getBreadcrumbsForDocuments;
exports.getDocumentBreadcrumb = getDocumentBreadcrumb;
exports.optionalString = optionalString;
exports.pathToUrl = pathToUrl;
exports.success = success;
exports.withTracing = withTracing;
var _zod = require("zod");
var _error = require("../../shared/utils/error");
var _models = require("../models");
var _tracer = require("../logging/tracer");
var _tracing = require("../logging/tracing");
var _policies = require("../policies");
var _types = require("../types");
/**
 * Extracts the authenticated user from the MCP request handler extra object.
 *
 * @param context - the extra object passed to MCP tool handlers.
 * @returns the authenticated user.
 */
function getActorFromContext(context) {
  return context.authInfo?.extra?.user;
}

/**
 * Constructs a minimal APIContext from the MCP request context for use with
 * server commands that require a Koa-style context.
 *
 * @param context - the MCP request context.
 * @returns a partial APIContext suitable for command functions.
 */
function buildAPIContext(context) {
  const user = context.authInfo?.extra?.user;
  const token = context.authInfo?.token ?? "";
  const ip = context.authInfo?.extra?.ip;
  const auth = {
    user,
    token,
    type: _types.AuthenticationType.MCP
  };
  return {
    state: {
      auth
    },
    context: {
      auth,
      ip
    },
    cookies: {
      get: () => undefined,
      set: () => undefined
    }
  };
}

/**
 * Builds a zod schema for an optional string MCP tool input that coerces
 * empty strings to `undefined`. MCP clients sometimes send `""` for fields
 * the caller intended to omit. Use this for identifier, query, and similar
 * fields where `""` is not a meaningful value — keep `z.string().optional()`
 * for content/text fields where an empty string is a valid input (e.g.
 * clearing a description).
 *
 * @returns a zod schema accepting `string | undefined`, with `""` treated as `undefined`.
 */
function optionalString() {
  return _zod.z.string().optional().transform(v => v === "" ? undefined : v);
}

/**
 * Helper function to format successful MCP tool responses.
 *
 * @param data - the data to include in the response.
 * @returns a formatted response object for MCP tools.
 */
function success(data) {
  const payload = Array.isArray(data) ? data : [data];
  return {
    content: payload.map(item => ({
      type: "text",
      text: JSON.stringify(item)
    }))
  };
}

/**
 * Helper function to format error MCP tool responses.
 *
 * @param message - the error message or error to include in the response.
 * @returns a formatted error response object for MCP tools.
 */
function error(err) {
  const message = (0, _error.errToString)(err);
  return {
    content: [{
      type: "text",
      text: message
    }],
    isError: true
  };
}

/**
 * Wraps an MCP tool handler with Datadog tracing. Each invocation creates a
 * span under the `outline-mcp` service with the tool name as the resource,
 * and tags it with the acting user and team IDs.
 *
 * @param toolName - the name of the MCP tool being traced.
 * @param handler - the handler function to wrap.
 * @returns the wrapped handler with tracing enabled.
 */
/* oxlint-disable @typescript-eslint/no-explicit-any */
function withTracing(toolName, handler) {
  return (0, _tracing.traceFunction)({
    serviceName: "mcp",
    spanName: "tool",
    resourceName: toolName
  })(function tracedHandler() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    const context = args[args.length - 1];
    const user = getActorFromContext(context);
    if (user) {
      (0, _tracer.addTags)({
        "mcp.tool": toolName,
        "request.userId": user.id,
        "request.teamId": user.teamId
      });
    }
    return handler.apply(this, args);
  });
}
/* oxlint-enable @typescript-eslint/no-explicit-any */

/**
 * Builds a map from document ID to its zero-based index among siblings,
 * derived from a collection's document structure.
 *
 * @param nodes - the top-level navigation nodes from a collection's documentStructure.
 * @returns a map of document ID to sibling index.
 */
function buildSiblingIndexMap(nodes) {
  const map = new Map();
  function walk(children) {
    children.forEach((node, idx) => {
      map.set(node.id, idx);
      walk(node.children);
    });
  }
  walk(nodes);
  return map;
}

/**
 * Builds a human-readable breadcrumb string showing a document's location.
 * The path includes only ancestors (collection name plus any parent document
 * titles) — not the document itself, since callers already have the title.
 * Documents at the root of a collection get just the collection name.
 *
 * @param documentId - the ID of the document to locate.
 * @param structure - the collection's documentStructure tree, may be null.
 * @param collectionName - the name of the containing collection.
 * @returns the breadcrumb string, e.g. "Engineering › Onboarding".
 */
function buildBreadcrumb(documentId, structure, collectionName) {
  const ancestors = [];
  if (structure) {
    const findPath = (nodes, chain) => {
      for (const node of nodes) {
        if (node.id === documentId) {
          ancestors.push(...chain);
          return true;
        }
        if (findPath(node.children, [...chain, node.title])) {
          return true;
        }
      }
      return false;
    };
    findPath(structure, []);
  }
  return [collectionName, ...ancestors].join(" › ");
}

/**
 * Resolves a breadcrumb string for a document by loading its collection's
 * cached documentStructure. Returns undefined when the document has no
 * collection, the collection cannot be loaded, or the user lacks read
 * access to the collection — the latter prevents leaking collection and
 * ancestor names to users granted access to a single nested document via
 * direct membership without wider collection access.
 *
 * @param document - the document to build a breadcrumb for.
 * @param user - the user performing the action, used to authorize collection access.
 * @returns the breadcrumb string, or undefined.
 */
async function getDocumentBreadcrumb(document, user) {
  if (!document.collectionId) {
    return undefined;
  }
  const collection = await _models.Collection.findByPk(document.collectionId, {
    userId: user.id
  });
  if (!collection || !(0, _policies.can)(user, "read", collection)) {
    return undefined;
  }
  const structure = await collection.getCachedDocumentStructure();
  return buildBreadcrumb(document.id, structure, collection.name);
}

/**
 * Resolves breadcrumb strings for a batch of documents in a single pass.
 * Loads all referenced collections (with the user's memberships) in one
 * query, filters by collection-level read access, then loads each
 * collection's cached documentStructure once.
 *
 * @param documents - the documents to build breadcrumbs for.
 * @param user - the user performing the action, used to authorize collection access.
 * @returns a map from document ID to breadcrumb string.
 */
async function getBreadcrumbsForDocuments(documents, user) {
  const breadcrumbs = new Map();
  const collectionIds = [...new Set(documents.map(doc => doc.collectionId).filter(id => !!id))];
  if (collectionIds.length === 0) {
    return breadcrumbs;
  }
  const collections = await _models.Collection.scope(["defaultScope", {
    method: ["withMembership", user.id]
  }]).findAll({
    where: {
      id: collectionIds
    }
  });
  const collectionsById = new Map(collections.filter(collection => (0, _policies.can)(user, "read", collection)).map(collection => [collection.id, collection]));
  for (const doc of documents) {
    if (!doc.collectionId) {
      continue;
    }
    const collection = collectionsById.get(doc.collectionId);
    if (!collection) {
      continue;
    }
    const structure = await collection.getCachedDocumentStructure();
    breadcrumbs.set(doc.id, buildBreadcrumb(doc.id, structure, collection.name));
  }
  return breadcrumbs;
}

/**
 * Utility function to construct a URL by joining a team URL with a path segment.
 *
 * @param team - the team object containing the base URL.
 * @param input - an object with attributes keys to be joined with the team URL.
 * @returns the combined URL string.
 */
function pathToUrl(team, input) {
  const baseUrl = team.url;
  for (const [key, value] of Object.entries(input)) {
    if (["url", "path"].includes(key) && typeof value === "string") {
      // check for existing protocol to avoid double joining
      if (/^https?:\/\//.test(value)) {
        input[key] = value;
      } else {
        input[key] = new URL(value, baseUrl).href;
      }
    }
  }
  return input;
}