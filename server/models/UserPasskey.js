"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _validations = require("../../shared/validations");
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _Changeset = require("./decorators/Changeset");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _UserPasskey;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let UserPasskey = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "user_passkeys",
  modelName: "user_passkey"
}), _dec2 = Reflect.metadata("design:type", String), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec4 = Reflect.metadata("design:type", typeof Buffer === "undefined" ? Object : Buffer), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BIGINT), _dec7 = Reflect.metadata("design:type", Number), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec9 = Reflect.metadata("design:type", Array), _dec0 = (0, _sequelizeTypescript.Length)({
  min: _validations.UserPasskeyValidation.minNameLength,
  max: _validations.UserPasskeyValidation.maxNameLength,
  msg: `Name must be between ${_validations.UserPasskeyValidation.minNameLength} and ${_validations.UserPasskeyValidation.maxNameLength} characters`
}), _dec1 = Reflect.metadata("design:type", String), _dec10 = Reflect.metadata("design:type", String), _dec11 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec12 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec13 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec14 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec16 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = (_UserPasskey = class UserPasskey extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "credentialId", _descriptor, this);
    _initializerDefineProperty(this, "credentialPublicKey", _descriptor2, this);
    _initializerDefineProperty(this, "aaguid", _descriptor3, this);
    _initializerDefineProperty(this, "counter", _descriptor4, this);
    _initializerDefineProperty(this, "transports", _descriptor5, this);
    _initializerDefineProperty(this, "name", _descriptor6, this);
    _initializerDefineProperty(this, "userAgent", _descriptor7, this);
    _initializerDefineProperty(this, "lastActiveAt", _descriptor8, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor9, this);
    _initializerDefineProperty(this, "userId", _descriptor0, this);
  }
}, _defineProperty(_UserPasskey, "eventNamespace", "passkeys"), _UserPasskey), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "credentialId", [_sequelizeTypescript.Column, _dec2], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "credentialPublicKey", [_dec3, _Changeset.SkipChangeset, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "aaguid", [_sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "counter", [_dec6, _Changeset.SkipChangeset, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "transports", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec0, _NotContainsUrl.default, _sequelizeTypescript.Column, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "userAgent", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "lastActiveAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _Changeset.SkipChangeset, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = UserPasskey;