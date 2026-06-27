"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _invariant = _interopRequireDefault(require("invariant"));
var _compat = require("es-toolkit/compat");
var _pgTsquery = _interopRequireDefault(require("pg-tsquery"));
var _sequelize = require("sequelize");
var _types = require("../../../shared/types");
var _string = require("../../../shared/utils/string");
var _urls = require("../../../shared/utils/urls");
var _errors = require("../../../server/errors");
var _Collection = _interopRequireDefault(require("../../../server/models/Collection"));
var _Document = _interopRequireDefault(require("../../../server/models/Document"));
var _Team = _interopRequireDefault(require("../../../server/models/Team"));
var _User = _interopRequireDefault(require("../../../server/models/User"));
var _DocumentHelper = require("../../../server/models/helpers/DocumentHelper");
var _database = require("../../../server/storage/database");
var _BaseSearchProvider = require("../../../server/utils/BaseSearchProvider");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * Search provider that uses PostgreSQL full-text search via tsvector.
 * Indexing is handled by database triggers, so index/remove/updateMetadata
 * are no-ops.
 */
class PostgresSearchProvider extends _BaseSearchProvider.BaseSearchProvider {
  constructor() {
    super(...arguments);
    _defineProperty(this, "id", "postgres");
  }
  async searchForTeam(team) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query
    } = options;
    const where = await PostgresSearchProvider.buildWhere(team, {
      ...options,
      statusFilter: [...(options.statusFilter || []), _types.StatusFilter.Published]
    });
    if (options.share) {
      let documentIds;
      if (options.share.collectionId) {
        const sharedCollection = options.share.collection ?? (await options.share.$get("collection", {
          scope: "unscoped"
        }));
        (0, _invariant.default)(sharedCollection, "Cannot find collection for share");
        documentIds = sharedCollection.getAllDocumentIds();
      } else if (options.share.documentId && options.share.includeChildDocuments) {
        const sharedDocument = await options.share.$get("document");
        (0, _invariant.default)(sharedDocument, "Cannot find document for share");
        const childDocumentIds = await sharedDocument.findAllChildDocumentIds({
          archivedAt: {
            [_sequelize.Op.is]: null
          }
        });
        documentIds = [sharedDocument.id, ...childDocumentIds];
      }
      where[_sequelize.Op.and].push({
        id: documentIds
      });
    }
    const findOptions = PostgresSearchProvider.buildFindOptions({
      query,
      sort: options.sort,
      direction: options.direction,
      usePopularityBoost: options.usePopularityBoost
    });
    try {
      const resultsQuery = _Document.default.unscoped().findAll({
        ...findOptions,
        where,
        limit,
        offset
      });
      const countQuery = _Document.default.unscoped().count({
        // @ts-expect-error Types are incorrect for count
        replacements: findOptions.replacements,
        where
      });
      const [results, count] = await Promise.all([resultsQuery, countQuery]);

      // Final query to get associated document data
      const documents = await _Document.default.findAll({
        where: {
          id: (0, _compat.map)(results, "id"),
          teamId: team.id
        },
        include: [{
          model: _Collection.default,
          as: "collection"
        }]
      });
      return PostgresSearchProvider.buildResponse({
        query,
        results,
        documents,
        count
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("syntax error in tsquery")) {
        throw (0, _errors.ValidationError)("Invalid search query");
      }
      throw err;
    }
  }
  async searchTitlesForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query,
      ...rest
    } = options;
    const where = await PostgresSearchProvider.buildWhere(user, rest);
    if (query) {
      where[_sequelize.Op.and].push({
        title: {
          [_sequelize.Op.iLike]: `%${query}%`
        }
      });
    }
    const include = [{
      association: "memberships",
      where: {
        userId: user.id
      },
      required: false,
      separate: false
    }, {
      association: "groupMemberships",
      required: false,
      separate: false,
      include: [{
        association: "group",
        required: true,
        include: [{
          association: "groupUsers",
          required: true,
          where: {
            userId: user.id
          }
        }]
      }]
    }, {
      model: _User.default,
      as: "createdBy",
      paranoid: false
    }, {
      model: _User.default,
      as: "updatedBy",
      paranoid: false
    }];
    return _Document.default.withMembershipScope(user.id, {
      includeDrafts: true
    }).findAll({
      where,
      subQuery: false,
      order: [[options.sort ?? _types.SortFilter.UpdatedAt, options.direction ?? _types.DirectionFilter.DESC]],
      include,
      offset,
      limit
    });
  }
  async searchCollectionsForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query
    } = options;
    const collectionIds = await user.collectionIds();
    return _Collection.default.findAll({
      where: {
        [_sequelize.Op.and]: query ? {
          [_sequelize.Op.or]: [_sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
        } : {},
        id: collectionIds,
        teamId: user.teamId
      },
      order: [["name", "ASC"]],
      replacements: {
        query: `%${query}%`
      },
      limit,
      offset
    });
  }
  async searchForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const {
      limit = 15,
      offset = 0,
      query
    } = options;
    const where = await PostgresSearchProvider.buildWhere(user, options);
    const findOptions = PostgresSearchProvider.buildFindOptions({
      query,
      sort: options.sort,
      direction: options.direction
    });
    const include = [{
      association: "memberships",
      where: {
        userId: user.id
      },
      required: false,
      separate: false
    }, {
      association: "groupMemberships",
      required: false,
      separate: false,
      include: [{
        association: "group",
        required: true,
        include: [{
          association: "groupUsers",
          required: true,
          where: {
            userId: user.id
          }
        }]
      }]
    }];
    try {
      const results = await _Document.default.unscoped().findAll({
        ...findOptions,
        subQuery: false,
        include,
        where,
        limit,
        offset
      });
      const countQuery = _Document.default.unscoped().count({
        // @ts-expect-error Types are incorrect for count
        subQuery: false,
        include,
        replacements: findOptions.replacements,
        where
      });

      // Final query to get associated document data
      const [documents, count] = await Promise.all([_Document.default.withMembershipScope(user.id, {
        includeDrafts: true
      }).findAll({
        where: {
          teamId: user.teamId,
          id: (0, _compat.map)(results, "id")
        }
      }), results.length < limit && offset === 0 ? Promise.resolve(results.length) : countQuery]);
      return PostgresSearchProvider.buildResponse({
        query,
        results,
        documents,
        count
      });
    } catch (err) {
      if (err instanceof Error && err.message.includes("syntax error in tsquery")) {
        throw (0, _errors.ValidationError)("Invalid search query");
      }
      throw err;
    }
  }

  /**
   * No-op for PostgreSQL — indexing is handled by database triggers.
   *
   * @param _model - unused.
   * @param _item - unused.
   */
  async index(_model, _item) {
    // PostgreSQL uses tsvector triggers for indexing
  }

  /**
   * No-op for PostgreSQL — removal is handled by database cascades.
   *
   * @param _model - unused.
   * @param _id - unused.
   * @param _teamId - unused.
   */
  async remove(_model, _id, _teamId) {
    // PostgreSQL handles removal via cascading deletes
  }

  /**
   * No-op for PostgreSQL — metadata is stored in the same tables.
   *
   * @param _model - unused.
   * @param _id - unused.
   * @param _metadata - unused.
   */
  async updateMetadata(_model, _id, _metadata) {
    // PostgreSQL metadata lives in the same row as the document
  }
  static buildFindOptions(_ref) {
    let {
      query,
      sort,
      direction,
      usePopularityBoost = true
    } = _ref;
    const attributes = ["id"];
    const replacements = {};
    const order = [];
    if (query) {
      const rankExpression = usePopularityBoost ? `ts_rank("searchVector", to_tsquery('english', :query)) * (1 + 0.25 * LN(1 + COALESCE("popularityScore", 0)))` : `ts_rank("searchVector", to_tsquery('english', :query))`;
      attributes.push([_sequelize.Sequelize.literal(rankExpression), "searchRanking"]);
      replacements["query"] = PostgresSearchProvider.webSearchQuery(query);
    }

    // When searching with a query and no explicit sort, prioritize search
    // ranking as the primary sort criterion. Otherwise, use the specified sort
    // with ranking as a tiebreaker.
    if (query && !sort) {
      order.push(["searchRanking", "DESC"]);
      order.push([_types.SortFilter.UpdatedAt, _types.DirectionFilter.DESC]);
    } else {
      const sortField = sort ?? _types.SortFilter.UpdatedAt;
      const sortDirection = direction ?? _types.DirectionFilter.DESC;
      if (sortField === _types.SortFilter.Title) {
        order.push([_sequelize.Sequelize.fn("LOWER", _sequelize.Sequelize.col("title")), sortDirection]);
      } else {
        order.push([sortField, sortDirection]);
      }
      if (query) {
        order.push(["searchRanking", "DESC"]);
      }
    }
    return {
      attributes,
      replacements,
      order
    };
  }
  static buildResultContext(document, query) {
    // Reset regex lastIndex to avoid state issues with global regex
    PostgresSearchProvider.QUOTED_QUERY_REGEX.lastIndex = 0;
    const quotedQueries = Array.from(query.matchAll(PostgresSearchProvider.QUOTED_QUERY_REGEX));
    const text = _DocumentHelper.DocumentHelper.toPlainText(document);

    // Regex to highlight quoted queries as ts_headline will not do this by default due to stemming.
    const fullMatchRegex = new RegExp((0, _compat.escapeRegExp)(query), "i");
    const highlightRegex = new RegExp([fullMatchRegex.source, ...(quotedQueries.length ? quotedQueries.map(match => (0, _compat.escapeRegExp)(match[1])) : PostgresSearchProvider.removeStopWords(query).trim().split(" ").map(match => `\\b${(0, _compat.escapeRegExp)(match)}\\b`))].join("|"), "gi");

    // Reset regex lastIndex to avoid state issues with global regex
    PostgresSearchProvider.BREAK_CHARS_REGEX.lastIndex = 0;
    const breakCharsRegex = PostgresSearchProvider.BREAK_CHARS_REGEX;

    // chop text around the first match, prefer the first full match if possible.
    const fullMatchIndex = text.search(fullMatchRegex);
    const offsetStartIndex = (fullMatchIndex >= 0 ? fullMatchIndex : text.search(highlightRegex)) - 65;
    const startIndex = Math.max(0, offsetStartIndex <= 0 ? 0 : (0, _string.regexIndexOf)(text, breakCharsRegex, offsetStartIndex));
    const context = text.replace(highlightRegex, "<b>$&</b>");
    const endIndex = (0, _string.regexLastIndexOf)(context, breakCharsRegex, startIndex + 250);
    return context.slice(startIndex, endIndex);
  }
  static async buildWhere(model, options) {
    const teamId = model instanceof _Team.default ? model.id : model.teamId;
    const where = {
      teamId,
      [_sequelize.Op.or]: [],
      [_sequelize.Op.and]: [{
        deletedAt: {
          [_sequelize.Op.eq]: null
        },
        template: false,
        sourceMetadata: {
          trial: {
            [_sequelize.Op.is]: null
          }
        }
      }]
    };
    if (model instanceof _User.default) {
      where[_sequelize.Op.or].push({
        "$memberships.id$": {
          [_sequelize.Op.ne]: null
        }
      }, {
        "$groupMemberships.id$": {
          [_sequelize.Op.ne]: null
        }
      });

      // Allow users to see their own drafts that have no collection, where no
      // membership or collection access applies. Drafts in collections remain
      // gated by the collection/membership checks above.
      if (options.statusFilter?.includes(_types.StatusFilter.Draft)) {
        where[_sequelize.Op.or].push({
          createdById: model.id,
          collectionId: {
            [_sequelize.Op.is]: null
          },
          publishedAt: {
            [_sequelize.Op.eq]: null
          },
          archivedAt: {
            [_sequelize.Op.eq]: null
          }
        });
      }
    }

    // Ensure we're filtering by the users accessible collections. If
    // collectionId is passed as an option it is assumed that the authorization
    // has already been done in the router
    const collectionIds = options.collectionId ? [options.collectionId] : await model.collectionIds();
    if (options.collectionId) {
      where[_sequelize.Op.and].push({
        collectionId: options.collectionId
      });
    }
    if (collectionIds.length) {
      where[_sequelize.Op.or].push({
        collectionId: collectionIds
      });
    }
    if (options.dateFilter) {
      where[_sequelize.Op.and].push({
        updatedAt: {
          [_sequelize.Op.gt]: _database.sequelize.literal(`now() - interval '1 ${options.dateFilter}'`)
        }
      });
    }
    if (options.collaboratorIds) {
      where[_sequelize.Op.and].push({
        collaboratorIds: {
          [_sequelize.Op.contains]: options.collaboratorIds
        }
      });
    }
    if (options.documentIds) {
      where[_sequelize.Op.and].push({
        id: options.documentIds
      });
    }
    const statusQuery = [];
    if (options.statusFilter?.includes(_types.StatusFilter.Published)) {
      statusQuery.push({
        [_sequelize.Op.and]: [{
          publishedAt: {
            [_sequelize.Op.ne]: null
          },
          archivedAt: {
            [_sequelize.Op.eq]: null
          }
        }]
      });
    }
    if (options.statusFilter?.includes(_types.StatusFilter.Draft) &&
    // Only ever include draft results for the user's own documents
    model instanceof _User.default) {
      statusQuery.push({
        [_sequelize.Op.and]: [{
          publishedAt: {
            [_sequelize.Op.eq]: null
          },
          archivedAt: {
            [_sequelize.Op.eq]: null
          },
          [_sequelize.Op.or]: [{
            createdById: model.id
          }, {
            "$memberships.id$": {
              [_sequelize.Op.ne]: null
            }
          }]
        }]
      });
    }
    if (options.statusFilter?.includes(_types.StatusFilter.Archived)) {
      statusQuery.push({
        archivedAt: {
          [_sequelize.Op.ne]: null
        }
      });
    }
    if (statusQuery.length) {
      where[_sequelize.Op.and].push({
        [_sequelize.Op.or]: statusQuery
      });
    }
    if (options.query) {
      // find words that look like urls, these should be treated separately as the postgres full-text
      // index will generally not match them.
      let likelyUrls = (0, _urls.getUrls)(options.query);

      // remove likely urls, and escape the rest of the query.
      let limitedQuery = PostgresSearchProvider.escapeQuery(likelyUrls.reduce((q, url) => q.replace(url, ""), options.query).slice(0, PostgresSearchProvider.maxQueryLength).trim());

      // Escape the URLs
      likelyUrls = likelyUrls.map(url => PostgresSearchProvider.escapeQuery(url));

      // Extract quoted queries and add them to the where clause, up to a maximum of 3 total.
      const quotedQueries = Array.from(limitedQuery.matchAll(/"([^"]*)"/g)).map(match => match[1]);

      // remove quoted queries from the limited query
      limitedQuery = limitedQuery.replace(/"([^"]*)"/g, "");
      const iLikeQueries = [...quotedQueries, ...likelyUrls].slice(0, 3);
      for (const match of iLikeQueries) {
        where[_sequelize.Op.and].push({
          [_sequelize.Op.or]: [{
            title: {
              [_sequelize.Op.iLike]: `%${match}%`
            }
          }, {
            text: {
              [_sequelize.Op.iLike]: `%${match}%`
            }
          }]
        });
      }
      if (limitedQuery || iLikeQueries.length === 0) {
        where[_sequelize.Op.and].push(_sequelize.Sequelize.fn(`"searchVector" @@ to_tsquery`, "english", _sequelize.Sequelize.literal(":query")));
      }
    }
    return where;
  }
  static buildResponse(_ref2) {
    let {
      query,
      results,
      documents,
      count
    } = _ref2;
    return {
      results: (0, _compat.map)(results, result => {
        const document = (0, _compat.find)(documents, {
          id: result.id
        });
        return {
          ranking: result.dataValues.searchRanking,
          context: query ? PostgresSearchProvider.buildResultContext(document, query) : undefined,
          document
        };
      }),
      total: count
    };
  }

  /**
   * Convert a user search query into a format that can be used by Postgres.
   *
   * @param query - the user search query.
   * @returns the query formatted for Postgres ts_query.
   */
  static webSearchQuery(query) {
    // limit length of search queries as we're using regex against untrusted input
    let limitedQuery = PostgresSearchProvider.escapeQuery(query.slice(0, PostgresSearchProvider.maxQueryLength));
    const quotedSearch = limitedQuery.startsWith('"') && limitedQuery.endsWith('"');

    // Replace single quote characters with &.
    // Reset regex lastIndex to avoid state issues with global regex
    PostgresSearchProvider.SINGLE_QUOTE_REGEX.lastIndex = 0;
    const singleQuotes = limitedQuery.matchAll(PostgresSearchProvider.SINGLE_QUOTE_REGEX);
    for (const match of singleQuotes) {
      if (match.index && match.index > 0 && match.index < limitedQuery.length - 1) {
        limitedQuery = limitedQuery.substring(0, match.index) + "&" + limitedQuery.substring(match.index + 1);
      }
    }
    return (0, _pgTsquery.default)()(
    // Although queryParser trims the query, looks like there's a
    // bug for certain cases where it removes other characters in addition to
    // spaces. Ref: https://github.com/caub/pg-tsquery/issues/27
    quotedSearch ? limitedQuery.trim() : `${limitedQuery.trim()}*`)
    // Strip any trailing join (&) or escape (\) characters, in any
    // combination, so we never hand to_tsquery an operator with no
    // operand (e.g. a tail of "&\" would leave a dangling "&").
    .replace(/[&\\]+$/, "");
  }
  static escapeQuery(query) {
    return query
    // replace "\" with escaped "\\" because sequelize.escape doesn't do it
    // see: https://github.com/sequelize/sequelize/issues/2950
    .replace(/\\/g, "\\\\")
    // replace ":" with escaped "\:" because it's a reserved character in tsquery
    // see: https://github.com/outline/outline/issues/6542
    .replace(/:/g, "\\:");
  }
  static removeStopWords(query) {
    return query.split(" ").filter(word => !PostgresSearchProvider.STOP_WORDS.has(word)).join(" ");
  }
}
exports.default = PostgresSearchProvider;
/**
 * The maximum length of a search query.
 */
_defineProperty(PostgresSearchProvider, "maxQueryLength", 1000);
/**
 * Cached regex pattern for single quotes to avoid recompilation.
 */
_defineProperty(PostgresSearchProvider, "SINGLE_QUOTE_REGEX", /'+/g);
/**
 * Cached regex pattern for quoted queries.
 */
_defineProperty(PostgresSearchProvider, "QUOTED_QUERY_REGEX", /"([^"]*)"/g);
/**
 * Cached regex pattern for break characters.
 */
_defineProperty(PostgresSearchProvider, "BREAK_CHARS_REGEX", new RegExp(`[ .,"'\n。！？!?…]`, "g"));
/**
 * Cached stop words set for efficient lookup.
 * Based on: https://github.com/postgres/postgres/blob/fc0d0ce978752493868496be6558fa17b7c4c3cf/src/backend/snowball/stopwords/english.stop
 */
_defineProperty(PostgresSearchProvider, "STOP_WORDS", new Set(["i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "of", "at", "by", "for", "with", "about", "against", "into", "through", "during", "before", "after", "above", "below", "from", "down", "off", "over", "under", "again", "then", "once", "here", "there", "when", "where", "why", "any", "both", "each", "few", "other", "some", "such", "nor", "only", "same", "so", "than", "too", "very", "s", "t", "don", "should"]));