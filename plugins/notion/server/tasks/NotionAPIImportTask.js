"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _client = require("@notionhq/client");
var _ProsemirrorHelper = require("../../../../shared/utils/ProsemirrorHelper");
var _validations = require("../../../../shared/validations");
var _Logger = _interopRequireDefault(require("../../../../server/logging/Logger"));
var _models = require("../../../../server/models");
var _APIImportTask = _interopRequireDefault(require("../../../../server/queues/tasks/APIImportTask"));
var _types = require("../../shared/types");
var _notion = require("../notion");
var _NotionConverter = require("../utils/NotionConverter");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class NotionAPIImportTask extends _APIImportTask.default {
  constructor() {
    super(...arguments);
    _defineProperty(this, "skippableErrorMessages", ["Database retrievals do not support linked databases", "does not contain any data sources accessible by this API bot",
    // error msg for linked database views,
    "Databases with multiple data sources are not supported in this API version" // https://github.com/outline/outline/issues/11573#issuecomment-3993691460
    ]);
  }
  /**
   * Process a Notion page-phase import task.
   * This fetches data from Notion and converts it to task output.
   *
   * @param importTask ImportTask model to process.
   * @returns Promise with output that resolves once processing has completed.
   */
  async processPage(importTask) {
    if (!importTask.import.integrationId) {
      throw new Error("Notion import is missing integrationId");
    }
    const integration = await _models.Integration.scope("withAuthentication").findByPk(importTask.import.integrationId, {
      rejectOnEmpty: true
    });
    const client = new _notion.NotionClient(integration.authentication.token);
    const parsedPages = [];
    for (const item of importTask.input) {
      parsedPages.push(await this.parsePage({
        item,
        client
      }));
    }

    // Filter out any null results (from pages/databases that couldn't be accessed)
    const validParsedPages = parsedPages.filter(Boolean);
    const taskOutput = validParsedPages.map(parsedPage => ({
      externalId: parsedPage.externalId,
      title: parsedPage.title,
      icon: parsedPage.icon,
      content: parsedPage.content,
      author: parsedPage.author,
      createdAt: parsedPage.createdAt,
      updatedAt: parsedPage.updatedAt
    }));
    const childTasksInput = validParsedPages.flatMap(parsedPage => parsedPage.children.map(childPage => ({
      type: childPage.type,
      externalId: childPage.externalId,
      parentExternalId: parsedPage.externalId,
      collectionExternalId: parsedPage.collectionExternalId
    })));
    return {
      taskOutput,
      childTasksInput
    };
  }

  /**
   * Schedule the next `NotionAPIImportTask`.
   *
   * @param importTask ImportTask model associated with the `NotionAPIImportTask`.
   * @returns Promise that resolves when the task is scheduled.
   */
  async scheduleNextTask(importTask) {
    await new NotionAPIImportTask().schedule({
      importTaskId: importTask.id
    });
    return;
  }

  /**
   * Fetch page data from Notion and convert it to expected output.
   *
   * @param item Object containing data about a notion page (or) database.
   * @param client Notion client.
   * @returns Promise of parsed page output that resolves when the task is scheduled.
   */
  async parsePage(_ref) {
    let {
      item,
      client
    } = _ref;
    const collectionExternalId = item.collectionExternalId ?? item.externalId;
    const titleMaxLength = item.externalId === collectionExternalId // This means it's a root page which will be imported as a collection
    ? _validations.CollectionValidation.maxNameLength : _validations.DocumentValidation.maxTitleLength;
    try {
      // Convert Notion database to an empty page with "pages in database" as its children.
      if (item.type === _types.PageType.Database) {
        const {
          pages,
          emoji,
          ...databaseInfo
        } = await client.fetchDatabase(item.externalId, {
          titleMaxLength
        });
        return {
          ...databaseInfo,
          icon: emoji,
          externalId: item.externalId,
          content: _ProsemirrorHelper.ProsemirrorHelper.getEmptyDocument(),
          collectionExternalId,
          children: pages.map(page => ({
            type: page.type,
            externalId: page.id
          }))
        };
      }
      const {
        blocks,
        emoji,
        ...pageInfo
      } = await client.fetchPage(item.externalId, {
        titleMaxLength
      });
      return {
        ...pageInfo,
        icon: emoji,
        externalId: item.externalId,
        content: _NotionConverter.NotionConverter.page({
          children: blocks
        }),
        collectionExternalId,
        children: this.parseChildPages(blocks)
      };
    } catch (error) {
      if (error instanceof _client.APIResponseError) {
        // Skip this page/database if it's not found or not accessible
        if (error.code === _client.APIErrorCode.ObjectNotFound || error.code === _client.APIErrorCode.Unauthorized || this.skippableErrorMessages.some(errorMsg => error.message.includes(errorMsg))) {
          _Logger.default.warn(`Skipping Notion ${item.type === _types.PageType.Database ? "database" : "page"} ${item.externalId} - Error code: ${error.code} - ${error.message}`);
          return null;
        }

        // Rate limit errors should be handled by the fetchWithRetry method in NotionClient
        // If we still get here, it means the maximum retries were exceeded
        if (error.code === _client.APIErrorCode.RateLimited) {
          _Logger.default.error(`Rate limit exceeded for Notion API when processing ${item.type === _types.PageType.Database ? "database" : "page"} ${item.externalId}. Maximum retries reached.`, error);
        }
      }
      // Re-throw other errors to be handled by the parent try/catch
      throw error;
    }
  }

  /**
   * Parse Notion page blocks to get its child pages and databases.
   *
   * @param pageBlocks Array of blocks representing the page's content.
   * @returns Array containing child page and child database info.
   */
  parseChildPages(pageBlocks) {
    const childPages = [];
    pageBlocks.forEach(block => {
      if (block.type === "child_page") {
        childPages.push({
          type: _types.PageType.Page,
          externalId: block.id
        });
      } else if (block.type === "child_database") {
        childPages.push({
          type: _types.PageType.Database,
          externalId: block.id
        });
      } else if (block.children?.length) {
        childPages.push(...this.parseChildPages(block.children));
      }
    });
    return childPages;
  }
}
exports.default = NotionAPIImportTask;