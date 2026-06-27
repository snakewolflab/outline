"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _error = require("../../../shared/utils/error");
var _types = require("../../../shared/types");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _fetch = _interopRequireDefault(require("../../../server/utils/fetch"));
var _env = _interopRequireDefault(require("./env"));
var _urls = require("../../../shared/utils/urls");
var _Iframely;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class Iframely {
  static async requestResource(url) {
    let type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "iframely";
    const isDefaultHost = _env.default.IFRAMELY_URL === this.defaultUrl;

    // Cloud Iframely requires /api path, while self-hosted does not.
    const apiUrl = isDefaultHost ? `${_env.default.IFRAMELY_URL}/api` : _env.default.IFRAMELY_URL;
    try {
      const res = await (0, _fetch.default)(`${apiUrl}/${type}?url=${encodeURIComponent(url)}&api_key=${_env.default.IFRAMELY_API_KEY}`, {
        timeout: 10000 // 10 second timeout
      });
      return await res.json();
    } catch (err) {
      _Logger.default.error(`Error fetching data from Iframely for url: ${url}`, (0, _error.toError)(err));
      return {
        error: (0, _error.errToString)(err) || "Unknown error"
      };
    }
  }

  /**
   *
   * @param url Resource url
   * @returns An object containing resource details e.g, resource title, description etc.
   */
}
_Iframely = Iframely;
_defineProperty(Iframely, "defaultUrl", "https://iframe.ly");
_defineProperty(Iframely, "unfurl", async url => {
  const data = await _Iframely.requestResource(url);
  if ("error" in data) {
    return {
      error: data.error
    }; // In addition to our custom UnfurlError, sometimes iframely returns error in the response body.
  }
  const parsedData = data;
  return {
    type: _types.UnfurlResourceType.URL,
    url: parsedData.url,
    title: parsedData.meta.title,
    description: parsedData.meta.description,
    thumbnailUrl: (parsedData.links.thumbnail ?? [])[0]?.href ?? "",
    faviconUrl: parsedData.meta.site === "Figma" ? (0, _urls.cdnPath)("/images/figma.png") : (parsedData.links.icon ?? [])[0]?.href ?? "",
    transformedUnfurl: true
  };
});
var _default = exports.default = Iframely;