"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _Share = _interopRequireDefault(require("./Share"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _Model = _interopRequireDefault(require("./base/Model"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let SearchQuery = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "search_queries",
  modelName: "search_query",
  updatedAt: false
}), _dec2 = (0, _sequelizeTypescript.IsUUID)(4), _dec3 = (0, _sequelizeTypescript.Default)(_sequelizeTypescript.DataType.UUIDV4), _dec4 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec5 = Reflect.metadata("design:type", String), _dec6 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec7 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ENUM("slack", "app", "api", "oauth")), _dec8 = Reflect.metadata("design:type", String), _dec9 = Reflect.metadata("design:type", Number), _dec0 = Reflect.metadata("design:type", Number), _dec1 = Reflect.metadata("design:type", Number), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec12 = Reflect.metadata("design:type", Function), _dec13 = Reflect.metadata("design:paramtypes", [String]), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec15 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.BelongsTo)(() => _Share.default, "shareId"), _dec20 = Reflect.metadata("design:type", typeof _Share.default === "undefined" ? Object : _Share.default), _dec21 = (0, _sequelizeTypescript.ForeignKey)(() => _Share.default), _dec22 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec23 = Reflect.metadata("design:type", String), _dec24 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec25 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec26 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec27 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec28 = Reflect.metadata("design:type", String), _dec(_class = (0, _Fix.default)(_class = (_class2 = class SearchQuery extends _Model.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "id", _descriptor, this);
    _initializerDefineProperty(this, "createdAt", _descriptor2, this);
    /**
     * Where the query originated.
     */
    _initializerDefineProperty(this, "source", _descriptor3, this);
    /**
     * The number of results returned for this query.
     */
    _initializerDefineProperty(this, "results", _descriptor4, this);
    /**
     * How long the search took to execute, in milliseconds.
     */
    _initializerDefineProperty(this, "duration", _descriptor5, this);
    /**
     * User score for the results for this query, -1 for negative, 1 for positive, null for neutral.
     */
    _initializerDefineProperty(this, "score", _descriptor6, this);
    /**
     * The generated answer to the query, if any.
     */
    _initializerDefineProperty(this, "answer", _descriptor7, this);
    // associations
    _initializerDefineProperty(this, "user", _descriptor8, this);
    _initializerDefineProperty(this, "userId", _descriptor9, this);
    _initializerDefineProperty(this, "share", _descriptor0, this);
    _initializerDefineProperty(this, "shareId", _descriptor1, this);
    _initializerDefineProperty(this, "team", _descriptor10, this);
    _initializerDefineProperty(this, "teamId", _descriptor11, this);
  }
  /**
   * The query string, automatically truncated to 255 characters.
   */
  set query(value) {
    this.setDataValue("query", value.substring(0, 255));
  }
  get query() {
    return this.getDataValue("query");
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2, _sequelizeTypescript.PrimaryKey, _dec3, _dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "createdAt", [_sequelizeTypescript.CreatedAt, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "source", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "results", [_sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "duration", [_sequelizeTypescript.Column, _dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "score", [_sequelizeTypescript.Column, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "answer", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2.prototype, "query", [_dec11, _dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "query"), _class2.prototype), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "shareId", [_dec21, _dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec26, _dec27, _dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class);
var _default = exports.default = SearchQuery;