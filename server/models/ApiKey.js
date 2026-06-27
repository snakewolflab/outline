"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _dateFns = require("date-fns");
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _random = require("../../shared/random");
var _validations = require("../../shared/validations");
var _crypto = require("../utils/crypto");
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Changeset = require("./decorators/Changeset");
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _AuthenticationHelper = _interopRequireDefault(require("../../shared/helpers/AuthenticationHelper"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _ApiKey;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let ApiKey = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "apiKeys",
  modelName: "apiKey"
}), _dec2 = (0, _sequelizeTypescript.Scopes)(() => ({
  withUser: {
    include: [{
      association: "user"
    }]
  }
})), _dec3 = (0, _Length.default)({
  min: _validations.ApiKeyValidation.minNameLength,
  max: _validations.ApiKeyValidation.maxNameLength,
  msg: `Name must be between ${_validations.ApiKeyValidation.minNameLength} and ${_validations.ApiKeyValidation.maxNameLength} characters`
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _classValidator.Matches)(_AuthenticationHelper.default.scopeGrammarRegex, {
  each: true,
  message: "Scope must be a valid API scope"
}), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec7 = Reflect.metadata("design:type", Array), _dec8 = Reflect.metadata("design:type", String), _dec9 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.VIRTUAL), _dec0 = Reflect.metadata("design:type", String), _dec1 = Reflect.metadata("design:type", String), _dec10 = Reflect.metadata("design:type", String), _dec11 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec12 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec13 = Reflect.metadata("design:type", Function), _dec14 = Reflect.metadata("design:paramtypes", [Object]), _dec15 = Reflect.metadata("design:type", Function), _dec16 = Reflect.metadata("design:paramtypes", [Object]), _dec17 = Reflect.metadata("design:type", Function), _dec18 = Reflect.metadata("design:paramtypes", [Object]), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec20 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec22 = Reflect.metadata("design:type", String), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_ApiKey = class ApiKey extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    /** The human-readable name of this API key */
    _initializerDefineProperty(this, "name", _descriptor, this);
    /** A list of scopes that this API key has access to */
    _initializerDefineProperty(this, "scope", _descriptor2, this);
    /** @deprecated The plain text value of the API key, removed soon. */
    _initializerDefineProperty(this, "secret", _descriptor3, this);
    /** The cached plain text value. Only available when creating the API key */
    _initializerDefineProperty(this, "value", _descriptor4, this);
    /** The hashed value of the API key */
    _initializerDefineProperty(this, "hash", _descriptor5, this);
    /** The last 4 characters of the API key */
    _initializerDefineProperty(this, "last4", _descriptor6, this);
    /** The date and time when this API key will expire */
    _initializerDefineProperty(this, "expiresAt", _descriptor7, this);
    /** The date and time when this API key was last used */
    _initializerDefineProperty(this, "lastActiveAt", _descriptor8, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor9, this);
    _initializerDefineProperty(this, "userId", _descriptor0, this);
    // methods
    _defineProperty(this, "updateActiveAt", async () => {
      const fiveMinutesAgo = (0, _dateFns.subMinutes)(new Date(), 5);

      // ensure this is updated only every few minutes otherwise
      // we'll be constantly writing to the DB as API requests happen
      if (!this.lastActiveAt || this.lastActiveAt < fiveMinutesAgo) {
        this.lastActiveAt = new Date();
      }
      return this.save({
        silent: true
      });
    });
    /** Checks if the API key has access to the given path */
    _defineProperty(this, "canAccess", path => {
      if (!this.scope) {
        return true;
      }

      // MCP endpoint access is allowed if the key has any valid scope.
      // Fine-grained scope enforcement happens at the tool level.
      if (path.startsWith("/mcp")) {
        return this.scope.length > 0;
      }
      return _AuthenticationHelper.default.canAccess(path, this.scope);
    });
  }
  // hooks

  static async afterFindHook(models) {
    const modelsArray = Array.isArray(models) ? models : [models];
    for (const model of modelsArray) {
      if (model?.secret) {
        model.last4 = model.secret.slice(-4);
      }
    }
  }
  static async generateSecret(model) {
    if (!model.hash) {
      const secret = `${ApiKey.prefix}${(0, _random.randomString)(38)}`;
      model.value = model.secret || secret;
      model.hash = (0, _crypto.hash)(model.value);
    }
  }
  static async updateLast4(model) {
    const value = model.value || model.secret;
    if (value) {
      model.last4 = value.slice(-4);
    }
  }

  /**
   * Validates that the input text _could_ be an API key, this does not check
   * that the key actually exists in the database.
   *
   * @param text The text to validate
   * @returns True if likely an API key
   */
  static match(text) {
    // cannot guarantee prefix here as older keys do not include it.
    return !!text.replace(ApiKey.prefix, "").match(/^[\w]{38}$/);
  }

  /**
   * Finds an API key by the given input string. This will check both the
   * secret and hash fields.
   *
   * @param input The input string to search for
   * @returns The API key if found
   */
  static findByToken(input) {
    return this.findOne({
      where: {
        [_sequelize.Op.or]: [{
          secret: input
        }, {
          hash: (0, _crypto.hash)(input)
        }]
      }
    });
  }
}, _defineProperty(_ApiKey, "prefix", "ol_api_"), _defineProperty(_ApiKey, "eventNamespace", "api_keys"), _ApiKey), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec3, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "scope", [_dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "secret", [_sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "value", [_dec9, _dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "hash", [_sequelizeTypescript.Unique, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "last4", [_sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "expiresAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "afterFindHook", [_sequelizeTypescript.AfterFind, _dec13, _dec14], Object.getOwnPropertyDescriptor(_class2, "afterFindHook"), _class2), _applyDecoratedDescriptor(_class2, "generateSecret", [_sequelizeTypescript.BeforeValidate, _dec15, _dec16], Object.getOwnPropertyDescriptor(_class2, "generateSecret"), _class2), _applyDecoratedDescriptor(_class2, "updateLast4", [_sequelizeTypescript.BeforeSave, _dec17, _dec18], Object.getOwnPropertyDescriptor(_class2, "updateLast4"), _class2), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec21, _sequelizeTypescript.Column, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class);
var _default = exports.default = ApiKey;