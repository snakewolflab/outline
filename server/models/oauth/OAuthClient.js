"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
var _random = require("../../../shared/random");
var _validations = require("../../../shared/validations");
var _Team = _interopRequireDefault(require("../Team"));
var _User = _interopRequireDefault(require("../User"));
var _ParanoidModel = _interopRequireDefault(require("../base/ParanoidModel"));
var _Changeset = require("../decorators/Changeset");
var _Encrypted = _interopRequireDefault(require("../decorators/Encrypted"));
var _Fix = _interopRequireDefault(require("../decorators/Fix"));
var _crypto = require("../../utils/crypto");
var _IsUrlOrRelativePath = _interopRequireDefault(require("../validators/IsUrlOrRelativePath"));
var _Length = _interopRequireDefault(require("../validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("../validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _OAuthClient;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let OAuthClient = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "oauth_clients",
  modelName: "oauth_client"
}), _dec2 = (0, _Length.default)({
  max: _validations.OAuthClientValidation.maxNameLength,
  msg: `name must be ${_validations.OAuthClientValidation.maxNameLength} characters or less`
}), _dec3 = Reflect.metadata("design:type", String), _dec4 = (0, _Length.default)({
  max: _validations.OAuthClientValidation.maxDescriptionLength,
  msg: `description must be ${_validations.OAuthClientValidation.maxDescriptionLength} characters or less`
}), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _Length.default)({
  max: _validations.OAuthClientValidation.maxDeveloperNameLength,
  msg: `developerName must be ${_validations.OAuthClientValidation.maxDeveloperNameLength} characters or less`
}), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _Length.default)({
  max: _validations.OAuthClientValidation.maxDeveloperUrlLength,
  msg: `developerUrl must be ${_validations.OAuthClientValidation.maxDeveloperUrlLength} characters or less`
}), _dec9 = Reflect.metadata("design:type", String), _dec0 = (0, _Length.default)({
  max: _validations.OAuthClientValidation.maxAvatarUrlLength,
  msg: `avatarUrl must be ${_validations.OAuthClientValidation.maxAvatarUrlLength} characters or less`
}), _dec1 = Reflect.metadata("design:type", String), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.IsIn)([Array.from(_validations.OAuthClientValidation.clientTypes)]), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec13 = Reflect.metadata("design:type", Object), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec15 = Reflect.metadata("design:type", String), _dec16 = Reflect.metadata("design:type", Boolean), _dec17 = (0, _classValidator.ArrayNotEmpty)(), _dec18 = (0, _classValidator.ArrayUnique)(), _dec19 = (0, _classValidator.ArrayMinSize)(1), _dec20 = (0, _classValidator.ArrayMaxSize)(10), _dec21 = (0, _classValidator.IsUrl)({
  require_tld: false,
  allow_underscores: true
}, {
  each: true
}), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec23 = Reflect.metadata("design:type", Array), _dec24 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec25 = Reflect.metadata("design:type", String), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.VIRTUAL), _dec27 = Reflect.metadata("design:type", String), _dec28 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec29 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec30 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec32 = Reflect.metadata("design:type", String), _dec33 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec34 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec35 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec36 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec37 = Reflect.metadata("design:type", String), _dec38 = Reflect.metadata("design:type", Function), _dec39 = Reflect.metadata("design:paramtypes", [Object]), _dec(_class = (0, _Fix.default)(_class = (_class2 = (_OAuthClient = class OAuthClient extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    _initializerDefineProperty(this, "description", _descriptor2, this);
    _initializerDefineProperty(this, "developerName", _descriptor3, this);
    _initializerDefineProperty(this, "developerUrl", _descriptor4, this);
    _initializerDefineProperty(this, "avatarUrl", _descriptor5, this);
    _initializerDefineProperty(this, "clientId", _descriptor6, this);
    _initializerDefineProperty(this, "clientType", _descriptor7, this);
    _initializerDefineProperty(this, "clientSecret", _descriptor8, this);
    _initializerDefineProperty(this, "published", _descriptor9, this);
    _initializerDefineProperty(this, "redirectUris", _descriptor0, this);
    /** The last time this client was used to make an API request. */
    _initializerDefineProperty(this, "lastActiveAt", _descriptor1, this);
    /** SHA-256 hash of the registration access token (RFC 7592). */
    _initializerDefineProperty(this, "registrationAccessTokenHash", _descriptor10, this);
    /** The cached registration access token. Only available during creation. */
    _initializerDefineProperty(this, "registrationAccessToken", _descriptor11, this);
    // associations
    _initializerDefineProperty(this, "team", _descriptor12, this);
    _initializerDefineProperty(this, "teamId", _descriptor13, this);
    _initializerDefineProperty(this, "createdBy", _descriptor14, this);
    _initializerDefineProperty(this, "createdById", _descriptor15, this);
  }
  // instance methods

  /**
   * Rotate the client secret value. Does not persist to database.
   */
  rotateClientSecret() {
    this.clientSecret = OAuthClient.generateNewClientSecret();
  }

  /**
   * Rotate the registration access token. Sets both the plain token
   * (virtual) and its hash. Does not persist to database.
   */
  rotateRegistrationAccessToken() {
    const token = OAuthClient.generateNewRegistrationAccessToken();
    this.registrationAccessToken = token;
    this.registrationAccessTokenHash = (0, _crypto.hash)(token);
  }

  /**
   * Determine if this client was created through dynamic client registration (DCR).
   * DCR clients are identified by having a null `createdById`, meaning they were not created by any user.
   *
   * @returns true if this client is a DCR client, false otherwise.
   */
  get isDCR() {
    return !this.createdById;
  }

  // hooks

  static async generateCredentials(model) {
    model.clientId = OAuthClient.generateNewClientId();
    model.clientSecret = OAuthClient.generateNewClientSecret();
    if (model.isDCR) {
      const token = OAuthClient.generateNewRegistrationAccessToken();
      model.registrationAccessToken = token;
      model.registrationAccessTokenHash = (0, _crypto.hash)(token);
    }
  }

  // static methods

  /**
   * Find an OAuthClient by it's public `clientId`
   *
   * @param clientId The public clientId of the OAuthClient
   * @returns The OAuthClient or null if not found
   */
  static async findByClientId(clientId) {
    return this.findOne({
      where: {
        clientId
      }
    });
  }

  /**
   * Find an OAuthClient by its registration access token.
   *
   * @param token The plain registration access token.
   * @param options Optional Sequelize find options to include transaction or other query modifiers.
   * @returns the OAuthClient or null if not found.
   */
  static async findByRegistrationAccessToken(token, options) {
    return this.findOne({
      where: {
        registrationAccessTokenHash: (0, _crypto.hash)(token)
      },
      ...options
    });
  }
  static generateNewRegistrationAccessToken() {
    return `${OAuthClient.registrationAccessTokenPrefix}${(0, _random.randomString)(38)}`;
  }
  static generateNewClientId() {
    return (0, _random.randomString)({
      length: 20,
      charset: "alphanumeric",
      capitalization: "lowercase"
    });
  }
  static generateNewClientSecret() {
    return `${OAuthClient.clientSecretPrefix}${(0, _random.randomString)(32)}`;
  }
}, _defineProperty(_OAuthClient, "eventNamespace", "oauthClients"), _defineProperty(_OAuthClient, "clientSecretPrefix", "ol_sk_"), _defineProperty(_OAuthClient, "registrationAccessTokenPrefix", "ol_rat_"), _OAuthClient), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec2, _sequelizeTypescript.Column, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "description", [_sequelizeTypescript.AllowNull, _NotContainsUrl.default, _dec4, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "developerName", [_sequelizeTypescript.AllowNull, _NotContainsUrl.default, _dec6, _sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "developerUrl", [_sequelizeTypescript.AllowNull, _IsUrlOrRelativePath.default, _dec8, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "avatarUrl", [_sequelizeTypescript.AllowNull, _IsUrlOrRelativePath.default, _dec0, _sequelizeTypescript.Column, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "clientId", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "clientType", [_dec11, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "clientSecret", [_dec14, _Encrypted.default, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "published", [_sequelizeTypescript.Column, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "redirectUris", [_dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "registrationAccessTokenHash", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "registrationAccessToken", [_dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec30, _dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec33, _dec34], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_sequelizeTypescript.AllowNull, _dec35, _dec36, _dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "generateCredentials", [_sequelizeTypescript.BeforeCreate, _dec38, _dec39], Object.getOwnPropertyDescriptor(_class2, "generateCredentials"), _class2), _class2)) || _class) || _class);
var _default = exports.default = OAuthClient;