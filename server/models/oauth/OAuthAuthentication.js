"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _dateFns = require("date-fns");
var _sequelizeTypescript = require("sequelize-typescript");
var _env = _interopRequireDefault(require("../../env"));
var _User = _interopRequireDefault(require("../User"));
var _ParanoidModel = _interopRequireDefault(require("../base/ParanoidModel"));
var _Changeset = require("../decorators/Changeset");
var _Fix = _interopRequireDefault(require("../decorators/Fix"));
var _AuthenticationHelper = _interopRequireDefault(require("../../../shared/helpers/AuthenticationHelper"));
var _crypto = require("../../utils/crypto");
var _OAuthClient = _interopRequireDefault(require("./OAuthClient"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _OAuthAuthentication;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let OAuthAuthentication = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "oauth_authentications",
  modelName: "oauth_authentication"
}), _dec2 = Reflect.metadata("design:type", String), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.VIRTUAL), _dec4 = Reflect.metadata("design:type", String), _dec5 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.VIRTUAL), _dec8 = Reflect.metadata("design:type", String), _dec9 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec1 = Reflect.metadata("design:type", String), _dec10 = (0, _classValidator.Matches)(_AuthenticationHelper.default.scopeGrammarRegex, {
  each: true,
  message: "Scope must be a valid API scope"
}), _dec11 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec12 = Reflect.metadata("design:type", Array), _dec13 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _OAuthClient.default, "oauthClientId"), _dec15 = Reflect.metadata("design:type", typeof _OAuthClient.default === "undefined" ? Object : _OAuthClient.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _OAuthClient.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec20 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec23 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = (_OAuthAuthentication = class OAuthAuthentication extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "accessTokenHash", _descriptor, this);
    /** The cached plain text access token. Only available during creation. */
    _initializerDefineProperty(this, "accessToken", _descriptor2, this);
    _initializerDefineProperty(this, "accessTokenExpiresAt", _descriptor3, this);
    _initializerDefineProperty(this, "refreshTokenHash", _descriptor4, this);
    /** The cached plain text refresh token. Only available during creation. */
    _initializerDefineProperty(this, "refreshToken", _descriptor5, this);
    _initializerDefineProperty(this, "refreshTokenExpiresAt", _descriptor6, this);
    /**
     * The ID of the grant that this authentication belongs to. Used for
     * refresh token rotation and revocation of all tokens in a grant.
     */
    _initializerDefineProperty(this, "grantId", _descriptor7, this);
    /** A list of scopes that this authentication has access to */
    _initializerDefineProperty(this, "scope", _descriptor8, this);
    _initializerDefineProperty(this, "lastActiveAt", _descriptor9, this);
    // associations
    _initializerDefineProperty(this, "oauthClient", _descriptor0, this);
    _initializerDefineProperty(this, "oauthClientId", _descriptor1, this);
    _initializerDefineProperty(this, "user", _descriptor10, this);
    _initializerDefineProperty(this, "userId", _descriptor11, this);
    // methods
    _defineProperty(this, "updateActiveAt", async () => {
      const fiveMinutesAgo = (0, _dateFns.subMinutes)(new Date(), 5);
      const now = new Date();

      // ensure this is updated only every few minutes otherwise
      // we'll be constantly writing to the DB as API requests happen
      if (!this.lastActiveAt || this.lastActiveAt < fiveMinutesAgo) {
        this.lastActiveAt = now;
      }
      const promises = [this.save({
        silent: true
      })];

      // Propagate activity timestamp to the parent OAuth client
      if (this.oauthClient && (!this.oauthClient.lastActiveAt || this.oauthClient.lastActiveAt < fiveMinutesAgo)) {
        this.oauthClient.lastActiveAt = now;
        promises.push(this.oauthClient.save({
          silent: true
        }));
      }
      await Promise.all(promises);
    });
    // instance methods
    /** Checks if the authentication has access to the given path */
    _defineProperty(this, "canAccess", path => {
      // Special case for the revoke endpoint, which is always allowed
      if (path === "/oauth/revoke") {
        return true;
      }

      // MCP endpoint access is allowed if the token has any valid scope.
      // Fine-grained scope enforcement happens at the tool level.
      if (path.startsWith("/mcp")) {
        return this.scope.length > 0;
      }
      return _AuthenticationHelper.default.canAccess(path, this.scope);
    });
  }
  // static methods

  /**
   * Validates that the input text _could_ be an OAuth token, this does not check
   * that the key actually exists in the database.
   *
   * @param text The text to validate
   * @returns True if likely an OAuth token
   */
  static match(text) {
    return !!text.startsWith(this.accessTokenPrefix);
  }

  /**
   * Validates that the input text _could_ be an OAuth refresh token, this does
   * not check that the key actually exists in the database.
   *
   * @param text The text to validate
   * @returns True if likely an OAuth refresh token
   */
  static matchRefreshToken(text) {
    return !!text.startsWith(this.refreshTokenPrefix);
  }

  /**
   * Finds an OAuthAuthentication by the given access token, including the
   * associated user.
   *
   * @param input The access token to search for
   * @param options The options to pass to the find method
   * @returns The OAuthAuthentication if found
   */
  static findByAccessToken(input, options) {
    return this.findOne({
      where: {
        accessTokenHash: (0, _crypto.hash)(input)
      },
      include: [{
        association: "user",
        required: true
      }, {
        association: "oauthClient",
        required: true
      }],
      ...options
    });
  }

  /**
   * Finds an OAuthAuthentication by the given refresh token, including the
   * associated user.
   *
   * @param input The refresh token to search for
   * @param options The options to pass to the find method
   * @returns The OAuthAuthentication if found
   */
  static findByRefreshToken(input, options) {
    return this.findOne({
      where: {
        refreshTokenHash: (0, _crypto.hash)(input)
      },
      include: [{
        association: "user",
        required: true
      }, {
        association: "oauthClient",
        required: true
      }],
      ...options
    });
  }
}, _defineProperty(_OAuthAuthentication, "eventNamespace", "oauthAuthentications"), _defineProperty(_OAuthAuthentication, "accessTokenLifetime", _env.default.OAUTH_PROVIDER_ACCESS_TOKEN_LIFETIME), _defineProperty(_OAuthAuthentication, "refreshTokenLifetime", _env.default.OAUTH_PROVIDER_REFRESH_TOKEN_LIFETIME), _defineProperty(_OAuthAuthentication, "accessTokenPrefix", "ol_at_"), _defineProperty(_OAuthAuthentication, "refreshTokenPrefix", "ol_rt_"), _OAuthAuthentication), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "accessTokenHash", [_sequelizeTypescript.Unique, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "accessToken", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "accessTokenExpiresAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "refreshTokenHash", [_sequelizeTypescript.Unique, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "refreshToken", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "refreshTokenExpiresAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "grantId", [_dec0, _Changeset.SkipChangeset, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "scope", [_dec10, _dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "oauthClient", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "oauthClientId", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = OAuthAuthentication;