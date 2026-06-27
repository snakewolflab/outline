"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _slugify = _interopRequireDefault(require("slugify"));
var _domains = require("../../shared/utils/domains");
var _tracing = require("../logging/tracing");
var _models = require("../models");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function teamCreator(ctx, _ref) {
  let {
    name,
    subdomain,
    avatarUrl,
    authenticationProviders
  } = _ref;
  if (!avatarUrl?.startsWith("http")) {
    avatarUrl = null;
  }
  const availableSubdomain = await findAvailableSubdomain(ctx, subdomain);
  return await _models.Team.createWithCtx(ctx, {
    name,
    subdomain: availableSubdomain,
    avatarUrl,
    authenticationProviders
  }, undefined, {
    include: ["authenticationProviders"]
  });
}
async function findAvailableSubdomain(ctx, requestedSubdomain) {
  // filter subdomain to only valid characters
  // if there are less than the minimum length, use a default subdomain
  const normalizedSubdomain = (0, _slugify.default)(requestedSubdomain, {
    lower: true,
    strict: true
  });
  let subdomain = normalizedSubdomain.length < 3 || _domains.RESERVED_SUBDOMAINS.includes(normalizedSubdomain) ? "team" : normalizedSubdomain;
  let append = 0;
  for (;;) {
    const existing = await _models.Team.findOne({
      where: {
        subdomain
      },
      paranoid: false,
      transaction: ctx.state.transaction
    });
    if (existing) {
      // subdomain was invalid or already used, try another
      subdomain = `${normalizedSubdomain}${++append}`;
    } else {
      break;
    }
  }
  return subdomain;
}
var _default = exports.default = (0, _tracing.traceFunction)({
  spanName: "teamCreator"
})(teamCreator);