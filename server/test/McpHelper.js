"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildOAuthUser = buildOAuthUser;
exports.callMcpTool = callMcpTool;
exports.mcpHeaders = mcpHeaders;
exports.mcpRequest = mcpRequest;
exports.parseMcpResponse = parseMcpResponse;
var _types = require("../../shared/types");
var _factories = require("./factories");
// eslint-disable no-restricted-imports

let nextId = 1;

/**
 * Builds a user and an OAuth access token with read/write/create scopes for
 * use with the MCP test helpers.
 *
 * @param overrides - optional team id and role overrides.
 * @returns the created user and their access token.
 */
async function buildOAuthUser() {
  let overrides = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  const user = overrides.role === "admin" ? await (0, _factories.buildAdmin)(overrides.teamId ? {
    teamId: overrides.teamId
  } : {}) : await (0, _factories.buildUser)(overrides.teamId ? {
    teamId: overrides.teamId
  } : {});
  const auth = await (0, _factories.buildOAuthAuthentication)({
    user,
    scope: [_types.Scope.Read, _types.Scope.Write, _types.Scope.Create]
  });
  return {
    user,
    accessToken: auth.accessToken
  };
}

/**
 * Returns HTTP headers required for MCP requests with OAuth authentication.
 *
 * @param accessToken - the OAuth access token.
 * @returns headers object for use with TestServer.post().
 */
function mcpHeaders(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json, text/event-stream"
  };
}

/**
 * Builds a JSON-RPC request object for MCP.
 *
 * @param method - the JSON-RPC method to call (e.g. "tools/call").
 * @param params - the params object for the method.
 * @returns an object with the JSON-RPC body and its id.
 */
function mcpRequest(method, params) {
  const id = nextId++;
  const body = {
    jsonrpc: "2.0",
    id,
    method,
    ...(params !== undefined ? {
      params
    } : {})
  };
  return {
    body,
    resultId: id
  };
}

/**
 * Parses an MCP HTTP response. The transport responds with
 * `text/event-stream` (SSE). This helper extracts the JSON-RPC response
 * from the SSE data lines.
 *
 * @param res - the node-fetch Response from TestServer.
 * @returns the parsed JSON-RPC result object.
 */
async function parseMcpResponse(res) {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();
  if (contentType.includes("text/event-stream")) {
    for (const line of text.split("\n")) {
      if (line.startsWith("data: ")) {
        const data = line.slice("data: ".length).trim();
        if (data) {
          return JSON.parse(data);
        }
      }
    }
    return undefined;
  }
  return JSON.parse(text);
}

/**
 * Shorthand to call an MCP tool via the test server. Sends a single
 * JSON-RPC `tools/call` request and returns the parsed result.
 *
 * @param server - the TestServer instance.
 * @param accessToken - the OAuth access token.
 * @param toolName - the name of the tool to call.
 * @param args - the arguments to pass to the tool.
 * @returns the parsed tool call result.
 */
async function callMcpTool(server, accessToken, toolName) {
  let args = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  const {
    body
  } = mcpRequest("tools/call", {
    name: toolName,
    arguments: args
  });
  const res = await server.post("/mcp/", {
    headers: mcpHeaders(accessToken),
    body
  });
  const parsed = await parseMcpResponse(res);
  return parsed;
}