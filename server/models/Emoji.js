"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelizeTypescript = require("sequelize-typescript");
var _validations = require("../../shared/validations");
var _errors = require("../errors");
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _classValidator = require("class-validator");
var _files = _interopRequireDefault(require("../storage/files"));
var _Attachment = _interopRequireDefault(require("./Attachment"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Emoji = (_dec = (0, _sequelizeTypescript.Table)({
  tableName: "emojis",
  modelName: "emoji"
}), _dec2 = (0, _Length.default)({
  max: _validations.EmojiValidation.maxNameLength,
  msg: `emoji name must be less than ${_validations.EmojiValidation.maxNameLength} characters`
}), _dec3 = (0, _classValidator.Matches)(_validations.EmojiValidation.allowedNameCharacters, {
  message: "emoji name can only contain lowercase letters, numbers, and underscores"
}), _dec4 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _sequelizeTypescript.BelongsTo)(() => _Attachment.default, "attachmentId"), _dec7 = Reflect.metadata("design:type", typeof _Attachment.default === "undefined" ? Object : _Attachment.default), _dec8 = (0, _sequelizeTypescript.ForeignKey)(() => _Attachment.default), _dec9 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec0 = Reflect.metadata("design:type", String), _dec1 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec10 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec11 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec12 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec15 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec18 = Reflect.metadata("design:type", String), _dec19 = Reflect.metadata("design:type", Function), _dec20 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec21 = Reflect.metadata("design:type", Function), _dec22 = Reflect.metadata("design:paramtypes", [Object]), _dec(_class = (0, _Fix.default)(_class = (_class2 = class Emoji extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    // associations
    _initializerDefineProperty(this, "attachment", _descriptor2, this);
    _initializerDefineProperty(this, "attachmentId", _descriptor3, this);
    _initializerDefineProperty(this, "team", _descriptor4, this);
    _initializerDefineProperty(this, "teamId", _descriptor5, this);
    _initializerDefineProperty(this, "createdBy", _descriptor6, this);
    _initializerDefineProperty(this, "createdById", _descriptor7, this);
  }
  // hooks
  static async checkUniqueName(model, options) {
    const existingEmoji = await this.findOne({
      where: {
        name: model.name,
        teamId: model.teamId
      },
      transaction: options.transaction
    });
    if (existingEmoji) {
      throw (0, _errors.ValidationError)(`Emoji with name "${model.name}" already exists.`);
    }
  }
  static async deleteAttachmentFromS3(model) {
    const attachment = await _Attachment.default.findByPk(model.attachmentId);
    if (attachment) {
      await _files.default.deleteFile(attachment.key);
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_dec2, _dec3, _dec4, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "attachment", [_dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "attachmentId", [_dec8, _dec9, _dec0], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec1, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec11, _dec12, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec16, _dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "checkUniqueName", [_sequelizeTypescript.BeforeCreate, _dec19, _dec20], Object.getOwnPropertyDescriptor(_class2, "checkUniqueName"), _class2), _applyDecoratedDescriptor(_class2, "deleteAttachmentFromS3", [_sequelizeTypescript.BeforeDestroy, _dec21, _dec22], Object.getOwnPropertyDescriptor(_class2, "deleteAttachmentFromS3"), _class2), _class2)) || _class) || _class);
var _default = exports.default = Emoji;