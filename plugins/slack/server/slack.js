"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.oauthAccess = oauthAccess;
exports.post = post;
exports.request = request;
var _nodeQuerystring = _interopRequireDefault(require("node:querystring"));
var _error = require("../../../shared/utils/error");
var _errors = require("../../../server/errors");
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
var _SlackUtils = require("../shared/SlackUtils");
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const SLACK_API_URL = "https://slack.com/api";

/**
 * Makes a POST request to the Slack API with JSON body.
 *
 * @param endpoint - the Slack API endpoint to call.
 * @param body - the request body containing token and other parameters.
 * @returns the parsed JSON response from Slack.
 */
async function post(endpoint, body) {
  let data;
  const {
    token,
    ...bodyWithoutToken
  } = body;
  try {
    const response = await (0, _fetch.default)(`${SLACK_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyWithoutToken)
    });
    data = await response.json();
  } catch (err) {
    throw (0, _errors.InvalidRequestError)((0, _error.errToString)(err));
  }
  if (!data.ok) {
    throw (0, _errors.InvalidRequestError)(data.error);
  }
  return data;
}

/**
 * Makes a POST request to the Slack API with form-urlencoded body.
 *
 * @param endpoint - the Slack API endpoint to call.
 * @param body - the request parameters.
 * @returns the parsed JSON response from Slack.
 */
async function request(endpoint, body) {
  let data;
  const {
    client_id,
    client_secret,
    ...params
  } = body;
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  };

  // Use HTTP Basic authentication for client credentials as recommended by
  // Slack documentation and OAuth 2.0 RFC 6749 Section 2.3.1.
  // This prevents client_secret from being exposed in URLs and logs.
  if (client_id && client_secret) {
    const credentials = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
    headers["Authorization"] = `Basic ${credentials}`;
  }
  try {
    const response = await (0, _fetch.default)(`${SLACK_API_URL}/${endpoint}`, {
      method: "POST",
      headers,
      body: _nodeQuerystring.default.stringify(params)
    });
    data = await response.json();
  } catch (err) {
    throw (0, _errors.InvalidRequestError)((0, _error.errToString)(err));
  }
  if (!data.ok) {
    throw (0, _errors.InvalidRequestError)(data.error);
  }
  return data;
}

/**
 * Exchanges an OAuth authorization code for an access token.
 *
 * @param code - the authorization code received from Slack.
 * @param redirect_uri - the redirect URI used in the OAuth flow.
 * @returns the OAuth access response containing the access token.
 */
async function oauthAccess(code) {
  let redirect_uri = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _SlackUtils.SlackUtils.callbackUrl();
  return request("oauth.access", {
    client_id: _env.default.SLACK_CLIENT_ID,
    client_secret: _env.default.SLACK_CLIENT_SECRET,
    redirect_uri,
    code
  });
}