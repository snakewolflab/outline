"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateIPAddress = exports.useAgent = exports.globalHttpsAgent = exports.globalHttpAgent = exports.RequestFilteringHttpsAgent = exports.RequestFilteringHttpAgent = exports.DefaultRequestFilteringAgentOptions = void 0;
var http = _interopRequireWildcard(require("node:http"));
var https = _interopRequireWildcard(require("node:https"));
var net = _interopRequireWildcard(require("node:net"));
var dns = _interopRequireWildcard(require("node:dns"));
var _ipaddr = _interopRequireDefault(require("ipaddr.js"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); } /* oxlint-disable no-restricted-imports */ // Vendored from request-filtering-agent v3.2.0 (MIT, by azu).
// Source: https://github.com/azu/request-filtering-agent/blob/cc0f9fcb9e700cd4246db2ea36245439eede4096/src/request-filtering-agent.ts
// License: see ./LICENSE.md
//
// Vendored to:
//   1. Expose validateIPAddress so the proxy pre-flight check in
//      server/utils/fetch.ts can reuse the exact same SSRF rules without
//      duplicating them.
//   2. Avoid the upstream package's pure-ESM publish.
//
// When upgrading, diff against upstream and port any changes here.
const DefaultRequestFilteringAgentOptions = exports.DefaultRequestFilteringAgentOptions = {
  allowPrivateIPAddress: false,
  allowMetaIPAddress: false,
  allowIPAddressList: [],
  denyIPAddressList: []
};
const matchIPAddress = _ref => {
  let {
    targetAddress,
    ipAddressList,
    listName
  } = _ref;
  for (const ipOrCIDR of ipAddressList) {
    if (net.isIP(ipOrCIDR) !== 0) {
      if (ipOrCIDR === targetAddress.raw) {
        return true;
      }
    } else {
      try {
        const cidr = _ipaddr.default.parseCIDR(ipOrCIDR);
        if (targetAddress.parsed.match(cidr)) {
          return true;
        }
      } catch (e) {
        _Logger.default.warn(`[request-filtering-agent] Invalid CIDR in ${listName}: ${ipOrCIDR}`, {
          error: e
        });
      }
    }
  }
  return false;
};

/**
 * Validate a resolved IP address against the configured filtering rules.
 *
 * @param input The resolved address (and optional host/family for richer error messages).
 * @param options Allow/deny rules to apply (undefined values fall back to defaults).
 * @returns An Error if the address is disallowed, otherwise undefined.
 */
const validateIPAddress = function (_ref2) {
  let {
    address,
    host,
    family
  } = _ref2;
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  if (net.isIP(address) === 0) {
    return;
  }
  const resolved = {
    ...DefaultRequestFilteringAgentOptions,
    ...options
  };
  try {
    const parsedAddr = _ipaddr.default.parse(address);
    if (resolved.allowIPAddressList.length > 0) {
      if (matchIPAddress({
        targetAddress: {
          raw: address,
          parsed: parsedAddr
        },
        ipAddressList: resolved.allowIPAddressList,
        listName: "allowIPAddressList"
      })) {
        return;
      }
    }
    const range = parsedAddr.range();
    if (!resolved.allowMetaIPAddress) {
      if (range === "unspecified") {
        return new Error(`DNS lookup ${address}(family:${family}, host:${host}) is not allowed. Because, It is meta IP address.`);
      }
    }
    if (!resolved.allowPrivateIPAddress && range !== "unicast") {
      return new Error(`DNS lookup ${address}(family:${family}, host:${host}) is not allowed. Because, It is private IP address.`);
    }
    if (resolved.denyIPAddressList.length > 0) {
      if (matchIPAddress({
        targetAddress: {
          raw: address,
          parsed: parsedAddr
        },
        ipAddressList: resolved.denyIPAddressList,
        listName: "denyIPAddressList"
      })) {
        return new Error(`DNS lookup ${address}(family:${family}, host:${host}) is not allowed. Because It is defined in denyIPAddressList.`);
      }
    }
  } catch (error) {
    return error;
  }
  return;
};
exports.validateIPAddress = validateIPAddress;
const makeLookup = (createConnectionOptions, requestFilterOptions) =>
// @ts-expect-error - @types/node has a poor definition of this callback
(hostname, options, cb) => {
  const lookup = createConnectionOptions.lookup || dns.lookup;
  let lookupCb;
  if (options.all) {
    lookupCb = (err, addresses) => {
      if (err) {
        cb(err);
        return;
      }
      for (const {
        address,
        family
      } of addresses) {
        const validationError = validateIPAddress({
          address,
          family,
          host: hostname
        }, requestFilterOptions);
        if (validationError) {
          cb(validationError);
          return;
        }
      }
      cb(null, addresses);
    };
  } else {
    lookupCb = (err, address, family) => {
      if (err) {
        cb(err);
        return;
      }
      const validationError = validateIPAddress({
        address: address,
        family: family,
        host: hostname
      }, requestFilterOptions);
      if (validationError) {
        cb(validationError);
        return;
      }
      cb(null, address, family);
    };
  }
  // @ts-expect-error - @types/node has a poor definition of this callback
  lookup(hostname, options, lookupCb);
};
const resolveOptions = options => ({
  ...DefaultRequestFilteringAgentOptions,
  ...options
});

/**
 * An http.Agent that rejects connections to disallowed IP addresses.
 */
class RequestFilteringHttpAgent extends http.Agent {
  constructor(options) {
    super(options);
    _defineProperty(this, "requestFilterOptions", void 0);
    this.requestFilterOptions = resolveOptions(options);
  }
  createConnection(options, connectionListener) {
    const {
      host
    } = options;
    if (host !== undefined) {
      const validationError = validateIPAddress({
        address: host
      }, this.requestFilterOptions);
      if (validationError) {
        throw validationError;
      }
    }
    return super.createConnection({
      ...options,
      lookup: makeLookup(options, this.requestFilterOptions)
    }, connectionListener);
  }
}

/**
 * An https.Agent that rejects connections to disallowed IP addresses.
 */
exports.RequestFilteringHttpAgent = RequestFilteringHttpAgent;
class RequestFilteringHttpsAgent extends https.Agent {
  constructor(options) {
    super(options);
    _defineProperty(this, "requestFilterOptions", void 0);
    this.requestFilterOptions = resolveOptions(options);
  }
  createConnection(options, connectionListener) {
    const {
      host
    } = options;
    if (host !== undefined) {
      const validationError = validateIPAddress({
        address: host
      }, this.requestFilterOptions);
      if (validationError) {
        throw validationError;
      }
    }
    return super.createConnection({
      ...options,
      lookup: makeLookup(options, this.requestFilterOptions)
    }, connectionListener);
  }
}
exports.RequestFilteringHttpsAgent = RequestFilteringHttpsAgent;
const globalHttpAgent = exports.globalHttpAgent = new RequestFilteringHttpAgent();
const globalHttpsAgent = exports.globalHttpsAgent = new RequestFilteringHttpsAgent();

/**
 * Get a filtering agent for the given URL. Returns a process-global agent when
 * no options are provided, otherwise constructs a fresh one.
 *
 * @param url The target URL — used only to pick http vs https.
 * @param options Optional filtering and underlying agent options.
 * @returns A filtering http or https agent.
 */
const useAgent = (url, options) => {
  if (!options) {
    return url.startsWith("https") ? globalHttpsAgent : globalHttpAgent;
  }
  return url.startsWith("https") ? new RequestFilteringHttpsAgent(options) : new RequestFilteringHttpAgent(options);
};
exports.useAgent = useAgent;