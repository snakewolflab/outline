"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _sequelizeTypescript = require("sequelize-typescript");
var _AuthenticationHelper = _interopRequireDefault(require("../../../shared/helpers/AuthenticationHelper"));
var _validations = require("../../../shared/validations");
var _env = _interopRequireDefault(require("../../env"));
var _User = _interopRequireDefault(require("../User"));
var _IdModel = _interopRequireDefault(require("../base/IdModel"));
var _Changeset = require("../decorators/Changeset");
var _Fix = _interopRequireDefault(require("../decorators/Fix"));
var _crypto = require("../../utils/crypto");
var _OAuthClient = _interopRequireDefault(require("./OAuthClient"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _OAuthAuthorizationCode;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let OAuthAuthorizationCode = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "oauth_authorization_codes",
  modelName: "oauth_authorization_code",
  updatedAt: false
}), _dec2 = Reflect.metadata("design:type", String), _dec3 = Reflect.metadata("design:type", String), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec6 = Reflect.metadata("design:type", String), _dec7 = (0, _classValidator.Matches)(_AuthenticationHelper.default.scopeGrammarRegex, {
  each: true,
  message: "Scope must be a valid API scope"
}), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec9 = Reflect.metadata("design:type", Array), _dec0 = (0, _sequelizeTypescript.Length)({
  max: _validations.OAuthClientValidation.maxRedirectUriLength
}), _dec1 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec11 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec12 = (0, _sequelizeTypescript.BelongsTo)(() => _OAuthClient.default, "oauthClientId"), _dec13 = Reflect.metadata("design:type", typeof _OAuthClient.default === "undefined" ? Object : _OAuthClient.default), _dec14 = (0, _sequelizeTypescript.ForeignKey)(() => _OAuthClient.default), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec16 = Reflect.metadata("design:type", String), _dec17 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec18 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec19 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec20 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec21 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = (_OAuthAuthorizationCode = class OAuthAuthorizationCode extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "authorizationCodeHash", _descriptor, this);
    _initializerDefineProperty(this, "codeChallenge", _descriptor2, this);
    _initializerDefineProperty(this, "codeChallengeMethod", _descriptor3, this);
    /**
     * The ID of the grant that this authorization code belongs to. Used for
     * refresh token rotation and revocation of all tokens in a grant.
     */
    _initializerDefineProperty(this, "grantId", _descriptor4, this);
    /** A list of scopes that this authorization code has access to */
    _initializerDefineProperty(this, "scope", _descriptor5, this);
    _initializerDefineProperty(this, "redirectUri", _descriptor6, this);
    _initializerDefineProperty(this, "expiresAt", _descriptor7, this);
    // associations
    _initializerDefineProperty(this, "oauthClient", _descriptor8, this);
    _initializerDefineProperty(this, "oauthClientId", _descriptor9, this);
    _initializerDefineProperty(this, "user", _descriptor0, this);
    _initializerDefineProperty(this, "userId", _descriptor1, this);
  }
  /**
   * Finds an OAuthAuthorizationCode by the given code.
   *
   * @param input The code to search for
   * @returns The OAuthAuthentication if found
   */
  static findByCode(input) {
    const authorizationCodeHash = (0, _crypto.hash)(input);
    return this.findOne({
      where: {
        authorizationCodeHash
      },
      include: [{
        association: "user",
        required: true
      }]
    });
  }
}, _defineProperty(_OAuthAuthorizationCode, "eventNamespace", "oauthAuthorizationCodes"), _defineProperty(_OAuthAuthorizationCode, "authorizationCodeLifetime", _env.default.OAUTH_PROVIDER_AUTHORIZATION_CODE_LIFETIME), _defineProperty(_OAuthAuthorizationCode, "authorizationCodePrefix", "ol_ac_"), _OAuthAuthorizationCode), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "authorizationCodeHash", [_sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "codeChallenge", [_sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "codeChallengeMethod", [_sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "grantId", [_dec5, _Changeset.SkipChangeset, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "scope", [_dec7, _dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "redirectUri", [_dec0, _sequelizeTypescript.Column, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "expiresAt", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "oauthClient", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "oauthClientId", [_dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec19, _dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = OAuthAuthorizationCode;