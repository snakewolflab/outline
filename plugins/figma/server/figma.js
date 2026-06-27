"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Figma = void 0;
var _zod = require("zod");
var _error = require("../../../shared/utils/error");
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
var _env = _interopRequireDefault(require("./env"));
var _FigmaUtils = require("../shared/FigmaUtils");
var _compat = require("es-toolkit/compat");
var _models = require("../../../server/models");
var _types = require("../../../shared/types");
var _urls = require("../../../shared/utils/urls");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _time = require("../../../shared/utils/time");
var _Figma;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const Credentials = Buffer.from(`${_env.default.FIGMA_CLIENT_ID}:${_env.default.FIGMA_CLIENT_SECRET}`).toString("base64");
const AccessTokenResponseSchema = _zod.z.object({
  access_token: _zod.z.string(),
  refresh_token: _zod.z.string(),
  expires_in: _zod.z.number()
});
const RefreshTokenResponseSchema = _zod.z.object({
  access_token: _zod.z.string(),
  expires_in: _zod.z.number()
});
const AccountResponseSchema = _zod.z.object({
  id: _zod.z.string(),
  handle: _zod.z.string(),
  email: _zod.z.string(),
  img_url: _zod.z.string()
});
class Figma {
  /**
   * Exchange an OAuth code for an access token
   *
   * @param code OAuth code to exchange for an access token
   * @returns An object containing the access token and refresh token
   */
  static async oauthAccess(code) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${Credentials}`
    };
    const body = new URLSearchParams();
    body.set("code", code);
    body.set("redirect_uri", _FigmaUtils.FigmaUtils.callbackUrl());
    body.set("grant_type", "authorization_code");
    const res = await (0, _fetch.default)(_FigmaUtils.FigmaUtils.tokenUrl, {
      method: "POST",
      headers,
      body
    });
    if (res.status !== 200) {
      throw new Error(`Error exchanging Figma OAuth code; status: ${res.status}, ${await res.text()}`);
    }
    return AccessTokenResponseSchema.parse(await res.json());
  }
  static async refreshToken(refreshToken) {
    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Authorization: `Basic ${Credentials}`
    };
    const body = new URLSearchParams();
    body.set("refresh_token", refreshToken);
    const res = await (0, _fetch.default)(_FigmaUtils.FigmaUtils.refreshUrl, {
      method: "POST",
      headers,
      body
    });
    if (res.status !== 200) {
      throw new Error(`Error while refreshing access token from Figma; status: ${res.status}, ${await res.text()}`);
    }
    return RefreshTokenResponseSchema.parse(await res.json());
  }
  static async getInstalledAccount(accessToken) {
    const res = await (0, _fetch.default)(_FigmaUtils.FigmaUtils.accountUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });
    if (res.status !== 200) {
      throw new Error(`Error getting Figma current account; status: ${res.status}, ${await res.text()}`);
    }
    return AccountResponseSchema.parse(await res.json());
  }
  static parseUrl(url) {
    const {
      hostname,
      pathname
    } = new URL(url);
    if (!Figma.supportedHosts.includes(hostname)) {
      return;
    }
    const parts = pathname.split("/");
    const type = parts[1];
    const key = parts[2];
    if (!Figma.supportedFileTypes.includes(type) || (0, _compat.isEmpty)(key)) {
      return;
    }
    return {
      type,
      key
    };
  }
  static fileMetadataUrl(key) {
    return `https://api.figma.com/v1/files/${key}/meta`;
  }
}
exports.Figma = Figma;
_Figma = Figma;
_defineProperty(Figma, "supportedHosts", ["www.figma.com", "figma.com"]);
_defineProperty(Figma, "supportedFileTypes", ["design",
// Design files
"board",
// Figjam
"slides", "buzz", "site", "make"]);
_defineProperty(Figma, "unfurl", async (url, actor) => {
  const resource = _Figma.parseUrl(url);
  if (!resource || !actor) {
    return;
  }
  const integrations = await _models.Integration.scope("withAuthentication").findAll({
    where: {
      type: _types.IntegrationType.LinkedAccount,
      service: _types.IntegrationService.Figma,
      userId: actor.id,
      teamId: actor.teamId
    }
  });
  if (integrations.length === 0) {
    return;
  }

  // Try to unfurl with any of the linked accounts
  // Note: We support only one figma account per team for now.
  for (const integration of integrations) {
    try {
      const accessToken = await integration.authentication.refreshTokenIfNeeded(async refreshToken => _Figma.refreshToken(refreshToken), 5 * _time.Minute.ms);
      const res = await (0, _fetch.default)(_Figma.fileMetadataUrl(resource.key), {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      // This connected account has access to the file.
      if (res.status === 200) {
        const data = await res.json();
        return {
          type: _types.UnfurlResourceType.URL,
          url,
          title: data.file.name,
          description: `Created by ${data.file.creator.handle}`,
          thumbnailUrl: data.file.thumbnail_url,
          faviconUrl: (0, _urls.cdnPath)("/images/figma.png"),
          transformedUnfurl: true
        };
      }
    } catch (err) {
      _Logger.default.error(`Error fetching Figma file metadata for integration ${integration.id}`, (0, _error.toError)(err));
    }
  }

  // Either no linked accounts have access to the file, or we faced an error.
  // Fallback to iframely unfurl either way.
  return;
});