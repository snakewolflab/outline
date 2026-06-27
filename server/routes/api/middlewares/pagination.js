"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = pagination;
exports.paginateQuery = paginateQuery;
var _nodeQuerystring = _interopRequireDefault(require("node:querystring"));
var _constants = require("../../../../shared/constants");
var _errors = require("../../../errors");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Execute a paginated query, skipping the COUNT query for client requests by
 * fetching one extra row to determine if a next page exists.
 *
 * For client requests (identified by x-client-version header), the find
 * function receives `limit + 1` so it can detect the presence of a next page
 * without a separate COUNT query. For non-client requests, find and count run
 * in parallel and the exact total is returned.
 *
 * @param ctx - the Koa application context.
 * @param find - function that fetches rows given offset and limit.
 * @param count - function that returns the total count. Only called for non-client requests.
 * @returns the rows for the current page and pagination metadata with total.
 */
async function paginateQuery(ctx, find, count) {
  const {
    offset,
    limit
  } = ctx.state.pagination;
  const isClientRequest = !!ctx.headers["x-client-version"];
  if (isClientRequest) {
    const results = await find({
      offset,
      limit: limit + 1
    });
    const hasNextPage = results.length > limit;
    if (hasNextPage) {
      results.pop();
    }
    return {
      results,
      pagination: {
        ...ctx.state.pagination,
        total: hasNextPage ? offset + limit + 1 : offset + results.length
      }
    };
  }
  const [results, total] = await Promise.all([find({
    offset,
    limit
  }), count()]);
  return {
    results,
    pagination: {
      ...ctx.state.pagination,
      total
    }
  };
}
function pagination() {
  return async function paginationMiddleware(ctx, next) {
    const opts = {
      defaultLimit: _constants.Pagination.defaultLimit,
      defaultOffset: _constants.Pagination.defaultOffset,
      maxLimit: _constants.Pagination.maxLimit
    };
    const query = ctx.request.query;
    const body = ctx.request.body;
    let limit = query.limit || body.limit;
    let offset = query.offset || body.offset;
    if (limit && isNaN(limit)) {
      throw (0, _errors.InvalidRequestError)(`Pagination limit must be a valid number`);
    }
    if (offset && isNaN(offset)) {
      throw (0, _errors.InvalidRequestError)(`Pagination offset must be a valid number`);
    }
    limit = parseInt(limit || opts.defaultLimit, 10);
    offset = parseInt(offset || opts.defaultOffset, 10);
    if (limit > opts.maxLimit) {
      throw (0, _errors.InvalidRequestError)(`Pagination limit is too large (max ${opts.maxLimit})`);
    }
    if (limit <= 0) {
      throw (0, _errors.InvalidRequestError)(`Pagination limit must be greater than 0`);
    }
    if (offset < 0) {
      throw (0, _errors.InvalidRequestError)(`Pagination offset must be greater than or equal to 0`);
    }
    query.limit = String(limit);
    query.offset = String(limit + offset);
    ctx.state.pagination = {
      limit,
      offset,
      nextPath: `/api${ctx.request.path}?${_nodeQuerystring.default.stringify(query)}`
    };
    return next();
  };
}