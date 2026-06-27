"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _AuthenticationProvider = _interopRequireDefault(require("./AuthenticationProvider"));
var _Group = _interopRequireDefault(require("./Group"));
var _Team = _interopRequireDefault(require("./Team"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let ExternalGroup = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "external_groups",
  modelName: "external_group"
}), _dec2 = (0, _Length.default)({
  max: 255,
  msg: "externalId must be 255 characters or less"
}), _dec3 = Reflect.metadata("design:type", String), _dec4 = (0, _Length.default)({
  max: 255,
  msg: "name must be 255 characters or less"
}), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec7 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec8 = (0, _sequelizeTypescript.BelongsTo)(() => _Group.default, "groupId"), _dec9 = Reflect.metadata("design:type", typeof _Group.default === "undefined" ? Object : _Group.default), _dec0 = (0, _sequelizeTypescript.ForeignKey)(() => _Group.default), _dec1 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.BelongsTo)(() => _AuthenticationProvider.default, "authenticationProviderId"), _dec12 = Reflect.metadata("design:type", typeof _AuthenticationProvider.default === "undefined" ? Object : _AuthenticationProvider.default), _dec13 = (0, _sequelizeTypescript.ForeignKey)(() => _AuthenticationProvider.default), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec15 = Reflect.metadata("design:type", String), _dec16 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec17 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec18 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec19 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec20 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class ExternalGroup extends _IdModel.default {
  constructor() {
    super(...arguments);
    /** The external identifier from the provider (e.g. OIDC group id or name). */
    _initializerDefineProperty(this, "externalId", _descriptor, this);
    /** The group name as reported by the external provider. */
    _initializerDefineProperty(this, "name", _descriptor2, this);
    /** When this record was last synced from the provider. */
    _initializerDefineProperty(this, "lastSyncedAt", _descriptor3, this);
    // associations
    /** The linked internal Outline Group, if one has been created. */
    _initializerDefineProperty(this, "group", _descriptor4, this);
    _initializerDefineProperty(this, "groupId", _descriptor5, this);
    /** The authentication provider this external group came from. */
    _initializerDefineProperty(this, "authenticationProvider", _descriptor6, this);
    _initializerDefineProperty(this, "authenticationProviderId", _descriptor7, this);
    /** The team this external group belongs to. */
    _initializerDefineProperty(this, "team", _descriptor8, this);
    _initializerDefineProperty(this, "teamId", _descriptor9, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "externalId", [_dec2, _sequelizeTypescript.Column, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec4, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "lastSyncedAt", [_dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "group", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec0, _dec1, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "authenticationProvider", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "authenticationProviderId", [_dec13, _dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec18, _dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = ExternalGroup;