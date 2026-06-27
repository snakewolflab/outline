"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OIDCStrategy = void 0;
var _httpsProxyAgent = require("https-proxy-agent");
var _passportOauth = require("passport-oauth2");
class OIDCStrategy extends _passportOauth.Strategy {
  constructor(options, verify) {
    super(options, verify);
    if (process.env.https_proxy) {
      const httpsProxyAgent = new _httpsProxyAgent.HttpsProxyAgent(process.env.https_proxy);
      this._oauth2.setAgent(httpsProxyAgent);
    }
  }
  authenticate(req, options) {
    options.originalQuery = req.query;
    super.authenticate(req, options);
  }
  authorizationParams(options) {
    return {
      ...options.originalQuery,
      ...super.authorizationParams?.(options)
    };
  }
}
exports.OIDCStrategy = OIDCStrategy;