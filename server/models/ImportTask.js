"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("../../shared/types");
var _Import = _interopRequireDefault(require("./Import"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
// Not all fields are automatically inferred by Sequelize.
// see https://sequelize.org/docs/v7/models/model-typing/#manual-attribute-typing
let ImportTask = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "import_tasks",
  modelName: "import_task"
}), _dec2 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.ImportTaskState)]), _dec3 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec4 = Reflect.metadata("design:type", typeof _types.ImportTaskState === "undefined" ? Object : _types.ImportTaskState), _dec5 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.ImportTaskPhase)]), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec7 = Reflect.metadata("design:type", typeof _types.ImportTaskPhase === "undefined" ? Object : _types.ImportTaskPhase), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec9 = Reflect.metadata("design:type", typeof ImportTaskInput === "undefined" ? Object : ImportTaskInput), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec1 = Reflect.metadata("design:type", typeof ImportTaskOutput === "undefined" ? Object : ImportTaskOutput), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.BelongsTo)(() => _Import.default, "importId"), _dec12 = Reflect.metadata("design:type", typeof _Import.default === "undefined" ? Object : _Import.default), _dec13 = (0, _sequelizeTypescript.ForeignKey)(() => _Import.default), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec15 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class ImportTask extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "state", _descriptor, this);
    _initializerDefineProperty(this, "phase", _descriptor2, this);
    _initializerDefineProperty(this, "input", _descriptor3, this);
    _initializerDefineProperty(this, "output", _descriptor4, this);
    _initializerDefineProperty(this, "error", _descriptor5, this);
    // associations
    _initializerDefineProperty(this, "import", _descriptor6, this);
    _initializerDefineProperty(this, "importId", _descriptor7, this);
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "state", [_dec2, _dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "phase", [_dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "input", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "output", [_sequelizeTypescript.AllowNull, _dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "error", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "import", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "importId", [_dec13, _dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = ImportTask;