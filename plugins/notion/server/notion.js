"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotionClient = void 0;
var _client = require("@notionhq/client");
var _asyncSema = require("async-sema");
var _emojiRegex = _interopRequireDefault(require("emoji-regex"));
var _compat = require("es-toolkit/compat");
var _zod = require("zod");
var _time = require("../../../shared/utils/time");
var _urls = require("../../../shared/utils/urls");
var _validations = require("../../../shared/validations");
var _Logger = _interopRequireDefault(require("../../../server/logging/Logger"));
var _NotionUtils = require("../shared/NotionUtils");
var _types = require("../shared/types");
var _env = _interopRequireDefault(require("./env"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
const Credentials = Buffer.from(`${_env.default.NOTION_CLIENT_ID}:${_env.default.NOTION_CLIENT_SECRET}`).toString("base64");
const AccessTokenResponseSchema = _zod.z.object({
  access_token: _zod.z.string(),
  bot_id: _zod.z.string(),
  workspace_id: _zod.z.string(),
  workspace_name: _zod.z.string().nullish(),
  workspace_icon: _zod.z.string().nullish().transform(val => {
    const emojiRegexp = (0, _emojiRegex.default)();
    if (val && ((0, _urls.isUrl)(val) || emojiRegexp.test(val))) {
      return val;
    }
    return undefined;
  })
});
class NotionClient {
  constructor(accessToken) {
    let rateLimit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      window: _time.Second.ms,
      limit: 3
    };
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    _defineProperty(this, "client", void 0);
    _defineProperty(this, "limiter", void 0);
    _defineProperty(this, "pageSize", 100);
    _defineProperty(this, "maxRetries", 3);
    _defineProperty(this, "maxServerErrorRetries", 8);
    _defineProperty(this, "retryDelay", 1000);
    _defineProperty(this, "skipChildrenForBlock", ["unsupported", "child_page", "child_database"]);
    this.client = new _client.Client({
      auth: accessToken
    });
    this.limiter = (0, _asyncSema.RateLimit)(rateLimit.limit, {
      timeUnit: rateLimit.window,
      uniformDistribution: true
    });
    this.maxRetries = options.maxRetries ?? this.maxRetries;
    this.retryDelay = options.retryDelay ?? this.retryDelay;
  }

  /**
   * Executes an API call with automatic retry on rate limiting errors
   *
   * @param apiCall The async function that makes the Notion API call
   * @returns The result of the API call
   */
  async fetchWithRetry(apiCall) {
    let retries = 0;
    let serverErrorRetries = 0;

    // oxlint-disable-next-line no-constant-condition
    while (true) {
      try {
        await this.limiter();
        return await apiCall();
      } catch (error) {
        // Check if this is a timeout and try again
        if (error instanceof _client.RequestTimeoutError) {
          if (retries < this.maxRetries) {
            retries++;
            const delay = this.retryDelay * retries;
            _Logger.default.info("task", `Notion API timed out, retrying in ${delay}ms (retry ${retries}/${this.maxRetries})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          _Logger.default.warn(`Notion API timed out after ${this.maxRetries} retries`, {
            error: error.message
          });
        }

        // Check if this is a rate limit error
        if (error instanceof _client.APIResponseError && error.code === _client.APIErrorCode.RateLimited) {
          if (retries < this.maxRetries) {
            retries++;
            const headers = error.headers;
            const retryAfter = headers["Retry-After"] ? parseInt(headers["Retry-After"], 10) * 1000 // Convert seconds to milliseconds
            : undefined;
            const delay = retryAfter ?? this.retryDelay * retries;
            _Logger.default.info("task", `Notion API rate limit hit, retrying in ${delay}ms (retry ${retries}/${this.maxRetries})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          _Logger.default.warn(`Notion API rate limit exceeded after ${this.maxRetries} retries`, {
            error: error.message
          });
        }

        // Check if this is a server-side error (5xx) — Notion's API can be
        // unreliable, so retry these for longer with exponential backoff.
        if ((error instanceof _client.APIResponseError || error instanceof _client.UnknownHTTPResponseError) && error.status >= 500) {
          if (serverErrorRetries < this.maxServerErrorRetries) {
            serverErrorRetries++;
            const delay = this.retryDelay * 2 ** (serverErrorRetries - 1);
            _Logger.default.info("task", `Notion API returned ${error.status}, retrying in ${delay}ms (retry ${serverErrorRetries}/${this.maxServerErrorRetries})`);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          _Logger.default.warn(`Notion API returned ${error.status} after ${this.maxServerErrorRetries} retries`, {
            error: error.message
          });
        }

        // Re-throw the error if it's not a rate limit issue or we've exhausted retries
        throw error;
      }
    }
  }
  static async oauthAccess(code) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Credentials}`
    };
    const body = {
      grant_type: "authorization_code",
      code,
      redirect_uri: _NotionUtils.NotionUtils.callbackUrl()
    };
    const res = await fetch(_NotionUtils.NotionUtils.tokenUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    return AccessTokenResponseSchema.parse(await res.json());
  }
  async fetchRootPages() {
    const pages = [];
    let cursor;
    let hasMore = true;
    while (hasMore) {
      const response = await this.fetchWithRetry(() => this.client.search({
        start_cursor: cursor,
        page_size: this.pageSize
      }));
      response.results.forEach(item => {
        if (!(0, _client.isFullPageOrDatabase)(item)) {
          return;
        }
        if (item.parent.type === "workspace") {
          pages.push({
            type: item.object === "page" ? _types.PageType.Page : _types.PageType.Database,
            id: item.id,
            name: this.parseTitle(item, {
              maxLength: _validations.CollectionValidation.maxNameLength
            }),
            emoji: this.parseEmoji(item)
          });
        }
      });
      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;
    }
    return pages;
  }
  async fetchPage(pageId, _ref) {
    let {
      titleMaxLength
    } = _ref;
    const pageInfo = await this.fetchPageInfo(pageId, {
      titleMaxLength
    });
    const blocks = await this.fetchBlockChildren(pageId);
    return {
      ...pageInfo,
      blocks
    };
  }
  async fetchDatabase(databaseId, _ref2) {
    let {
      titleMaxLength
    } = _ref2;
    const databaseInfo = await this.fetchDatabaseInfo(databaseId, {
      titleMaxLength
    });
    const pages = await this.queryDatabase(databaseId);
    return {
      ...databaseInfo,
      pages
    };
  }
  async fetchBlockChildren(blockId) {
    const blocks = [];
    let cursor;
    let hasMore = true;
    try {
      while (hasMore) {
        const response = await this.fetchWithRetry(() => this.client.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
          page_size: this.pageSize
        }));
        blocks.push(...response.results);
        hasMore = response.has_more;
        cursor = response.next_cursor ?? undefined;
      }
      await Promise.all(blocks.map(async block => {
        if (block.has_children && !this.skipChildrenForBlock.includes(block.type)) {
          block.children = await this.fetchBlockChildren(block.id);
        }
      }));
    } catch (error) {
      if (error instanceof _client.APIResponseError && (error.code === _client.APIErrorCode.ObjectNotFound || error.code === _client.APIErrorCode.Unauthorized)) {
        _Logger.default.warn(`Skipping Notion block children for ${blockId} - Error code: ${error.code}`);
        return [];
      }
      throw error;
    }
    return blocks;
  }
  async queryDatabase(databaseId) {
    const pages = [];
    let cursor;
    let hasMore = true;
    try {
      while (hasMore) {
        const response = await this.fetchWithRetry(() => this.client.databases.query({
          database_id: databaseId,
          filter_properties: ["title"],
          start_cursor: cursor,
          page_size: this.pageSize
        }));
        const pagesFromRes = (0, _compat.compact)(response.results.map(item => {
          if (!(0, _client.isFullPage)(item)) {
            return;
          }
          return {
            type: _types.PageType.Page,
            id: item.id,
            name: this.parseTitle(item, {
              maxLength: _validations.DocumentValidation.maxTitleLength
            }),
            emoji: this.parseEmoji(item)
          };
        }));
        pages.push(...pagesFromRes);
        hasMore = response.has_more;
        cursor = response.next_cursor ?? undefined;
      }
    } catch (error) {
      if (error instanceof _client.APIResponseError && (error.code === _client.APIErrorCode.ObjectNotFound || error.code === _client.APIErrorCode.Unauthorized)) {
        _Logger.default.warn(`Skipping Notion database query for ${databaseId} - Error code: ${error.code}`);
        return [];
      }
      throw error;
    }
    return pages;
  }
  async fetchPageInfo(pageId, _ref3) {
    let {
      titleMaxLength
    } = _ref3;
    const page = await this.fetchWithRetry(() => this.client.pages.retrieve({
      page_id: pageId
    }));
    const author = await this.fetchUsername(page.created_by.id);
    return {
      title: this.parseTitle(page, {
        maxLength: titleMaxLength
      }),
      emoji: this.parseEmoji(page),
      author: author ?? undefined,
      createdAt: !page.created_time ? undefined : new Date(page.created_time),
      updatedAt: !page.last_edited_time ? undefined : new Date(page.last_edited_time)
    };
  }
  async fetchDatabaseInfo(databaseId, _ref4) {
    let {
      titleMaxLength
    } = _ref4;
    const database = await this.fetchWithRetry(() => this.client.databases.retrieve({
      database_id: databaseId
    }));
    const author = await this.fetchUsername(database.created_by.id);
    return {
      title: this.parseTitle(database, {
        maxLength: titleMaxLength
      }),
      emoji: this.parseEmoji(database),
      author: author ?? undefined,
      createdAt: !database.created_time ? undefined : new Date(database.created_time),
      updatedAt: !database.last_edited_time ? undefined : new Date(database.last_edited_time)
    };
  }
  async fetchUsername(userId) {
    try {
      const user = await this.fetchWithRetry(() => this.client.users.retrieve({
        user_id: userId
      }));
      if (user.type === "person" || !user.bot.owner) {
        return user.name;
      }

      // bot belongs to a user, get the user's name
      if (user.bot.owner.type === "user" && (0, _client.isFullUser)(user.bot.owner.user)) {
        return user.bot.owner.user.name;
      }

      // bot belongs to a workspace, fallback to bot's name
      return user.name;
    } catch (error) {
      // Handle the case where a user can't be found
      if (error instanceof _client.APIResponseError && error.code === _client.APIErrorCode.ObjectNotFound) {
        return "Unknown";
      }
      throw error;
    }
  }
  parseTitle(item) {
    let {
      maxLength = _validations.DocumentValidation.maxTitleLength
    } = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let richTexts;
    if (item.object === "page") {
      const titleProp = Object.values(item.properties).find(property => property.type === "title");
      richTexts = titleProp?.title ?? [];
    } else {
      richTexts = item.title;
    }
    const title = richTexts.map(richText => richText.plain_text).join("");

    // Truncate title to fit within validation limits
    return (0, _compat.truncate)(title, {
      length: maxLength
    });
  }
  parseEmoji(item) {
    // Other icon types return a url to download from, which we don't support.
    return item.icon?.type === "emoji" ? item.icon.emoji : undefined;
  }
}
exports.NotionClient = NotionClient;