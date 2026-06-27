"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.AccessRequestStatus = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _Document = _interopRequireDefault(require("./Document"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _classValidator = require("class-validator");
var _errors = require("../errors");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let AccessRequestStatus = exports.AccessRequestStatus = /*#__PURE__*/function (AccessRequestStatus) {
  AccessRequestStatus["Pending"] = "pending";
  AccessRequestStatus["Approved"] = "approved";
  AccessRequestStatus["Dismissed"] = "dismissed";
  return AccessRequestStatus;
}({});
let AccessRequest = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    association: "user",
    required: true
  }, {
    association: "responder",
    required: false
  }]
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "access_requests",
  modelName: "access_request"
}), _dec3 = (0, _sequelizeTypescript.Default)(AccessRequestStatus.Pending), _dec4 = (0, _classValidator.IsIn)([Object.values(AccessRequestStatus)]), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec6 = Reflect.metadata("design:type", typeof AccessRequestStatus === "undefined" ? Object : AccessRequestStatus), _dec7 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec8 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec9 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec0 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec1 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "userId"), _dec12 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec13 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec14 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec15 = Reflect.metadata("design:type", String), _dec16 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec17 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec18 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec19 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec20 = Reflect.metadata("design:type", String), _dec21 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "responderId"), _dec22 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec23 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec24 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec25 = Reflect.metadata("design:type", String), _dec26 = Reflect.metadata("design:type", Function), _dec27 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class AccessRequest extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "status", _descriptor, this);
    _initializerDefineProperty(this, "respondedAt", _descriptor2, this);
    // associations
    _initializerDefineProperty(this, "document", _descriptor3, this);
    _initializerDefineProperty(this, "documentId", _descriptor4, this);
    _initializerDefineProperty(this, "user", _descriptor5, this);
    _initializerDefineProperty(this, "userId", _descriptor6, this);
    _initializerDefineProperty(this, "team", _descriptor7, this);
    _initializerDefineProperty(this, "teamId", _descriptor8, this);
    _initializerDefineProperty(this, "responder", _descriptor9, this);
    _initializerDefineProperty(this, "responderId", _descriptor0, this);
  }
  static async validateNoDuplicatePendingRequest(instance, options) {
    const {
      documentId,
      userId
    } = instance;
    const existingRequest = await this.findOne({
      where: {
        documentId,
        userId,
        status: AccessRequestStatus.Pending
      },
      transaction: options.transaction
    });
    if (existingRequest) {
      throw (0, _errors.ValidationError)("A pending access request already exists for this document and user.");
    }
  }

  /**
   * Approve this access request, setting the status and responder, and persist.
   *
   * @param ctx the API context; the authenticated user is recorded as responder.
   */
  approve(ctx) {
    this.status = AccessRequestStatus.Approved;
    this.responderId = ctx.state.auth.user.id;
    this.respondedAt = new Date();
    return this.saveWithCtx(ctx);
  }

  /**
   * Dismiss this access request, setting the status and responder, and persist.
   *
   * @param ctx the API context; the authenticated user is recorded as responder.
   */
  dismiss(ctx) {
    this.status = AccessRequestStatus.Dismissed;
    this.responderId = ctx.state.auth.user.id;
    this.respondedAt = new Date();
    return this.saveWithCtx(ctx);
  }

  /**
   * get the user's pending request.
   *
   * @param documentId The document ID or slug.
   * @param userId The user ID.
   *
   * @returns the pending request or null.
   */
  static async findPendingForUser(_ref) {
    let {
      documentId,
      userId
    } = _ref;
    if (!documentId || !userId) {
      return null;
    }
    return this.findOne({
      where: {
        documentId,
        userId,
        status: AccessRequestStatus.Pending
      }
    });
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "status", [_dec3, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "respondedAt", [_sequelizeTypescript.AllowNull, _sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec0, _dec1, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "userId", [_dec13, _dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec18, _dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "responder", [_dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "responderId", [_sequelizeTypescript.AllowNull, _dec23, _dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "validateNoDuplicatePendingRequest", [_sequelizeTypescript.BeforeCreate, _dec26, _dec27], Object.getOwnPropertyDescriptor(_class2, "validateNoDuplicatePendingRequest"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = AccessRequest;