"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Headers", {
  enumerable: true,
  get: function () {
    return _nodeFetch.Headers;
  }
});
exports.chromeUserAgent = void 0;
exports.default = fetch;
exports.outlineUserAgent = void 0;
var _nodeDns = require("node:dns");
var net = _interopRequireWildcard(require("node:net"));
var _nodeFetch = _interopRequireWildcard(require("node-fetch"));
var _proxyFromEnv = require("proxy-from-env");
var _tunnelAgent = _interopRequireDefault(require("tunnel-agent"));
var _error = require("../../shared/utils/error");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _compat = require("es-toolkit/compat");
var _requestFilteringAgent = require("./requestFilteringAgent");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/* oxlint-disable no-restricted-imports, react/rules-of-hooks */

const DefaultOptions = {
  keepAlive: true,
  timeout: 1000,
  keepAliveMsecs: 500,
  maxSockets: 200,
  maxFreeSockets: 5,
  maxCachedSessions: 500
};
/**
 * Default user agent string for outgoing requests.
 */
const outlineUserAgent = exports.outlineUserAgent = `Outline-${_env.default.VERSION ? `/${_env.default.VERSION.slice(0, 7)}` : ""}`;

/**
 * Fake Chrome user agent string for use in fetch requests to
 * improve reliability.
 */
const chromeUserAgent = exports.chromeUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

/**
 * Resolves the URL's hostname and validates every returned address against the
 * filtering rules. Used as a pre-flight check when a proxy is configured,
 * since both proxy code paths in buildAgent() bypass the per-connection DNS
 * hook in the filtering agent.
 *
 * @param url The target URL to validate.
 * @param options Allow/deny rules to apply.
 * @param signal Optional abort signal — if it fires (e.g. fetch timeout),
 * the validation rejects with an AbortError so the configured timeout
 * applies to slow DNS resolution as well.
 * @throws An error if any resolved address is disallowed.
 */
const validateTargetURL = async (url, options, signal) => {
  const host = url.hostname;
  const lookup = net.isIP(host) !== 0 ? Promise.resolve([{
    address: host,
    family: net.isIP(host)
  }]) : _nodeDns.promises.lookup(host, {
    all: true
  });
  const addresses = signal ? await Promise.race([lookup, new Promise((_, reject) => {
    if (signal.aborted) {
      reject(Object.assign(new Error("aborted"), {
        name: "AbortError"
      }));
      return;
    }
    signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), {
      name: "AbortError"
    })), {
      once: true
    });
  })]) : await lookup;
  for (const {
    address,
    family
  } of addresses) {
    const err = (0, _requestFilteringAgent.validateIPAddress)({
      address,
      family,
      host
    }, options);
    if (err) {
      throw err;
    }
  }
};

/**
 * Wrapper around fetch that uses the request-filtering-agent in cloud hosted
 * environments to filter malicious requests, and the fetch-with-proxy library
 * in self-hosted environments to allow for request from behind a proxy.
 *
 * @param url The url to fetch
 * @param init The fetch init object
 * @returns The response
 */
async function fetch(url, init) {
  _Logger.default.silly("http", `Network request to ${url}`, init);
  const {
    allowPrivateIPAddress,
    timeout,
    ...rest
  } = init || {};

  // Create AbortController for timeout if specified
  let abortController;
  let timeoutId;
  if (timeout && !rest.signal) {
    abortController = new AbortController();
    timeoutId = setTimeout(() => {
      abortController?.abort();
    }, timeout);
  }
  const signal = abortController?.signal || rest.signal;
  try {
    // When a proxy is configured, the request-filtering-agent's per-connection
    // DNS hook does not see the target host (the tunnel-agent path bypasses it
    // entirely, and the http-over-http path only filters the proxy's IP).
    // Pre-resolve and validate the target ourselves so SSRF protection still
    // applies to user-supplied URLs.
    //
    // We resolve DNS locally, but the proxy performs its own DNS resolution
    // when forwarding the request. A determined attacker controlling DNS
    // could return a public IP here and a private IP to the proxy. Closing
    // that gap would require the proxy itself to enforce egress rules.
    const parsedURL = new URL(url);
    if ((0, _proxyFromEnv.getProxyForUrl)(parsedURL.href)) {
      await validateTargetURL(parsedURL, {
        allowPrivateIPAddress,
        allowIPAddressList: _env.default.ALLOWED_PRIVATE_IP_ADDRESSES ?? []
      }, signal);
    }
    const headers = new _nodeFetch.Headers({
      "User-Agent": outlineUserAgent
    });
    new _nodeFetch.Headers(rest?.headers).forEach((value, key) => {
      headers.set(key, value);
    });
    const response = await (0, _nodeFetch.default)(url, {
      ...rest,
      headers,
      signal,
      agent: buildAgent(url, {
        signal,
        allowPrivateIPAddress
      })
    });
    if (!response.ok) {
      _Logger.default.silly("http", `Network request failed`, {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers.raw()
      });
    }
    return response;
  } catch (err) {
    if (err instanceof Error && "name" in err && err.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    const message = (0, _error.errToString)(err);
    if (message.startsWith("DNS lookup")) {
      throw (0, _errors.InvalidRequestError)(_env.default.isCloudHosted ? message : `${message}\n\nTo allow this request, add the IP address or CIDR range to the ALLOWED_PRIVATE_IP_ADDRESSES environment variable.`);
    }
    throw err;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Parses the proxy URL and returns an object with the properties
 *
 * @param url The URL to be fetched
 * @param proxyURL The proxy URL to be used
 * @returns An object containing the parsed proxy URL and tunnel method
 */
const parseProxy = (url, proxyURL) => {
  const proxyObject = new URL(proxyURL);
  const proxyProtocol = proxyObject.protocol?.replace(":", "");
  const proxyPort = proxyObject.port || (proxyProtocol === "https" ? "443" : "80");
  proxyObject.port = proxyPort;
  proxyObject.tunnelMethod = url.protocol?.replace(":", "").concat("Over").concat((0, _compat.capitalize)(proxyProtocol));
  return proxyObject;
};

/**
 * Builds a tunnel agent for the given proxy URL and options. Note that tunnel
 * agents do not perform request filtering.
 *
 * @param proxy The parsed proxy URL
 * @param options The request options
 * @returns A tunnel agent for the proxy
 */
const buildTunnel = (proxy, options) => {
  if (!proxy.tunnelMethod) {
    _Logger.default.warn("Proxy tunnel method not defined");
    return;
  }
  if (!(proxy.tunnelMethod in _tunnelAgent.default)) {
    _Logger.default.warn(`Proxy tunnel method not supported: ${proxy.tunnelMethod}`);
    return;
  }
  const proxyAuth = proxy.username || proxy.password ? `${proxy.username}:${proxy.password}` : undefined;
  return _tunnelAgent.default[proxy.tunnelMethod]({
    ...options,
    proxy: {
      port: proxy.port,
      host: proxy.hostname,
      proxyAuth
    }
  });
};

/**
 * Creates a http or https agent for the given URL, applying request filtering
 * if necessary. If a proxy is detected in the environment, it will use that
 * proxy agent to tunnel the request.
 *
 * @param url The URL to fetch.
 * @param options Options controlling agent behavior.
 * @param options.signal An abort signal used to destroy the agent on cancellation or timeout.
 * @param options.allowPrivateIPAddress Whether to allow requests to private IP addresses.
 * @returns An http or https agent configured for the URL.
 */
function buildAgent(url) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const agentOptions = {
    ...DefaultOptions
  };
  const parsedURL = new URL(url);
  const proxyURL = (0, _proxyFromEnv.getProxyForUrl)(parsedURL.href);
  let agent;

  // Add allowIPAddressList from environment configuration
  const filteringOptions = {
    ...agentOptions,
    allowPrivateIPAddress: options.allowPrivateIPAddress,
    allowIPAddressList: _env.default.ALLOWED_PRIVATE_IP_ADDRESSES ?? []
  };
  if (proxyURL) {
    const parsedProxyURL = parseProxy(parsedURL, proxyURL);
    _Logger.default.silly("http", `Using proxy for request`, {
      url: parsedURL.toString(),
      proxy: parsedProxyURL.href,
      tunnelMethod: parsedProxyURL.tunnelMethod,
      username: parsedProxyURL.username || undefined,
      password: parsedProxyURL.password ? "******" : undefined
    });
    if (parsedProxyURL.tunnelMethod?.startsWith("httpOver")) {
      const proxyURL = new URL(parsedProxyURL.href);
      proxyURL.pathname = (parsedURL.protocol ?? "").concat("//").concat(parsedURL.host ?? "").concat(parsedURL.pathname + parsedURL.search);
      if (parsedProxyURL.username || parsedProxyURL.password) {
        proxyURL.username = parsedProxyURL.username;
        proxyURL.password = parsedProxyURL.password;
      }
      agent = (0, _requestFilteringAgent.useAgent)(proxyURL.toString(), filteringOptions);
    } else {
      // tunnel-agent bypasses the filtering agent's per-connection DNS hook,
      // so SSRF protection for this branch comes from the validateTargetURL
      // pre-flight in fetch() above.
      agent = buildTunnel(parsedProxyURL, agentOptions) || (0, _requestFilteringAgent.useAgent)(parsedURL.toString(), filteringOptions);
    }
  } else {
    agent = (0, _requestFilteringAgent.useAgent)(parsedURL.toString(), filteringOptions);
  }
  if (options.signal) {
    options.signal.addEventListener("abort", () => {
      if (agent && "destroy" in agent) {
        agent.destroy();
      }
    });
  }
  return agent;
}