"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("../../shared/types");
var _validations = require("../../shared/validations");
var _errors = require("../errors");
var _Integration = _interopRequireDefault(require("./Integration"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Import = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    association: "createdBy",
    required: true,
    paranoid: false
  }]
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "imports",
  modelName: "import"
}), _dec3 = (0, _Length.default)({
  max: _validations.ImportValidation.maxNameLength,
  msg: `name must be ${_validations.ImportValidation.maxNameLength} characters or less`
}), _dec4 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.ImportableIntegrationService)]), _dec7 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec8 = Reflect.metadata("design:type", typeof T === "undefined" ? Object : T), _dec9 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.ImportState)]), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec1 = Reflect.metadata("design:type", typeof _types.ImportState === "undefined" ? Object : _types.ImportState), _dec10 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec11 = Reflect.metadata("design:type", typeof ImportInput === "undefined" ? Object : ImportInput), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec13 = Reflect.metadata("design:type", typeof ImportScratch === "undefined" ? Object : ImportScratch), _dec14 = (0, _sequelizeTypescript.Default)(0), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.INTEGER), _dec16 = Reflect.metadata("design:type", Number), _dec17 = Reflect.metadata("design:type", String), _dec18 = (0, _sequelizeTypescript.BelongsTo)(() => _Integration.default, "integrationId"), _dec19 = Reflect.metadata("design:type", typeof _Integration.default === "undefined" ? Object : _Integration.default), _dec20 = (0, _sequelizeTypescript.ForeignKey)(() => _Integration.default), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec22 = Reflect.metadata("design:type", String), _dec23 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec24 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec25 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec27 = Reflect.metadata("design:type", String), _dec28 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec29 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec30 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec32 = Reflect.metadata("design:type", String), _dec33 = Reflect.metadata("design:type", Function), _dec34 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class Import extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    _initializerDefineProperty(this, "service", _descriptor2, this);
    _initializerDefineProperty(this, "state", _descriptor3, this);
    _initializerDefineProperty(this, "input", _descriptor4, this);
    _initializerDefineProperty(this, "scratch", _descriptor5, this);
    _initializerDefineProperty(this, "documentCount", _descriptor6, this);
    _initializerDefineProperty(this, "error", _descriptor7, this);
    // associations
    _initializerDefineProperty(this, "integration", _descriptor8, this);
    _initializerDefineProperty(this, "integrationId", _descriptor9, this);
    _initializerDefineProperty(this, "createdBy", _descriptor0, this);
    _initializerDefineProperty(this, "createdById", _descriptor1, this);
    _initializerDefineProperty(this, "team", _descriptor10, this);
    _initializerDefineProperty(this, "teamId", _descriptor11, this);
  }
  /**
   * Serializes imports per team — blocks creation while another import is
   * already in flight. Centralizing the check here lets every code path that
   * creates an Import (route handlers, integrations) share one definition of
   * "in progress" without duplicating the count query.
   */
  static async checkInProgress(model, options) {
    const inProgress = await this.count({
      where: {
        teamId: model.teamId,
        state: [_types.ImportState.Created, _types.ImportState.InProgress, _types.ImportState.Processed]
      },
      transaction: options.transaction
    });
    if (inProgress) {
      throw (0, _errors.UnprocessableEntityError)("An import is already in progress");
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec3, _dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "service", [_dec6, _dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "state", [_dec9, _dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "input", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "scratch", [_sequelizeTypescript.AllowNull, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "documentCount", [_sequelizeTypescript.IsNumeric, _dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "error", [_sequelizeTypescript.Column, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "integration", [_dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "integrationId", [_sequelizeTypescript.AllowNull, _dec20, _dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec25, _dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec30, _dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "checkInProgress", [_sequelizeTypescript.BeforeCreate, _dec33, _dec34], Object.getOwnPropertyDescriptor(_class2, "checkInProgress"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = Import;