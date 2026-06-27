"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _classValidator = require("class-validator");
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _slugify = _interopRequireDefault(require("slugify"));
var _UrlHelper = require("../../shared/utils/UrlHelper");
var _validations = require("../../shared/validations");
var _url = require("../utils/url");
var _Collection = _interopRequireDefault(require("./Collection"));
var _Revision = _interopRequireDefault(require("./Revision"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IsHexColor = _interopRequireDefault(require("./validators/IsHexColor"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _Template;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Template = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    association: "createdBy",
    paranoid: false
  }, {
    association: "updatedBy",
    paranoid: false
  }],
  where: {
    template: true
  },
  attributes: {
    exclude: ["state"]
  }
})), _dec2 = (0, _sequelizeTypescript.Scopes)(() => ({
  withMembership: function (userId) {
    let paranoid = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
    return {
      include: [{
        model: userId ? _Collection.default.scope(["defaultScope", {
          method: ["withMembership", userId]
        }]) : _Collection.default,
        as: "collection",
        paranoid
      }]
    };
  },
  withCollection: {
    include: [{
      model: _Collection.default,
      as: "collection"
    }]
  }
})), _dec3 = (0, _sequelizeTypescript.Table)({
  tableName: "documents",
  modelName: "template"
}), _dec4 = (0, _sequelizeTypescript.Length)({
  min: 10,
  max: 10,
  msg: `urlId must be 10 characters`
}), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _Length.default)({
  max: _validations.DocumentValidation.maxTitleLength,
  msg: `Template title must be ${_validations.DocumentValidation.maxTitleLength} characters or less`
}), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _sequelizeTypescript.Default)(false), _dec9 = Reflect.metadata("design:type", Boolean), _dec0 = (0, _sequelizeTypescript.Default)(true), _dec1 = Reflect.metadata("design:type", Boolean), _dec10 = (0, _sequelizeTypescript.Length)({
  max: 255,
  msg: `editorVersion must be 255 characters or less`
}), _dec11 = Reflect.metadata("design:type", String), _dec12 = (0, _Length.default)({
  max: 50,
  msg: `icon must be 50 characters or less`
}), _dec13 = Reflect.metadata("design:type", String), _dec14 = Reflect.metadata("design:type", String), _dec15 = Reflect.metadata("design:type", String), _dec16 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec17 = Reflect.metadata("design:type", typeof ProsemirrorData === "undefined" ? Object : ProsemirrorData), _dec18 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "lastModifiedById"), _dec19 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec20 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec22 = Reflect.metadata("design:type", String), _dec23 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec24 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec25 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec26 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec27 = Reflect.metadata("design:type", String), _dec28 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec29 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec30 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec31 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec32 = Reflect.metadata("design:type", String), _dec33 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec34 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec35 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec36 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec37 = Reflect.metadata("design:type", String), _dec38 = (0, _sequelizeTypescript.HasMany)(() => _Revision.default, "documentId"), _dec39 = Reflect.metadata("design:type", Array), _dec40 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec41 = Reflect.metadata("design:type", Function), _dec42 = Reflect.metadata("design:paramtypes", [Object]), _dec(_class = _dec2(_class = _dec3(_class = (0, _Fix.default)(_class = (_class2 = (_Template = class Template extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "urlId", _descriptor, this);
    _initializerDefineProperty(this, "title", _descriptor2, this);
    _initializerDefineProperty(this, "fullWidth", _descriptor3, this);
    _initializerDefineProperty(this, "template", _descriptor4, this);
    /** The version of the editor last used to edit this template. */
    _initializerDefineProperty(this, "editorVersion", _descriptor5, this);
    /** An icon to use as the template icon. */
    _initializerDefineProperty(this, "icon", _descriptor6, this);
    /** The color of the icon. */
    _initializerDefineProperty(this, "color", _descriptor7, this);
    /** The likely language of the template, in ISO 639-1 format. */
    _initializerDefineProperty(this, "language", _descriptor8, this);
    /**
     * The content of the template as JSON, this is a snapshot at the last time the state was saved.
     */
    _initializerDefineProperty(this, "content", _descriptor9, this);
    // associations
    _initializerDefineProperty(this, "updatedBy", _descriptor0, this);
    _initializerDefineProperty(this, "lastModifiedById", _descriptor1, this);
    _initializerDefineProperty(this, "createdBy", _descriptor10, this);
    _initializerDefineProperty(this, "createdById", _descriptor11, this);
    _initializerDefineProperty(this, "team", _descriptor12, this);
    _initializerDefineProperty(this, "teamId", _descriptor13, this);
    _initializerDefineProperty(this, "collection", _descriptor14, this);
    _initializerDefineProperty(this, "collectionId", _descriptor15, this);
    _initializerDefineProperty(this, "revisions", _descriptor16, this);
    /** Whether the template is published, and if so when. */
    _initializerDefineProperty(this, "publishedAt", _descriptor17, this);
  }
  // getters

  /** The frontend path to this template. */
  get path() {
    if (!this.title) {
      return `/settings/templates/untitled-${this.urlId}`;
    }
    const slugifiedTitle = (0, _slugify.default)(this.title);
    return `/settings/templates/${slugifiedTitle}-${this.urlId}`;
  }

  /**
   * Returns whether this is a workspace template.
   *
   * @returns boolean
   */
  get isWorkspaceTemplate() {
    return !this.collectionId;
  }
  static createUrlId(model) {
    return model.urlId = model.urlId || (0, _url.generateUrlId)();
  }

  /**
   * Overrides the standard findByPk behavior to allow also querying by urlId
   *
   * @param id uuid or urlId
   * @param options FindOptions
   * @returns A promise resolving to a template instance or null
   */

  static async findByPk(id) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof id !== "string") {
      return null;
    }
    const {
      includeState,
      userId,
      ...rest
    } = options;

    // allow default preloading of collection membership if `userId` is passed in find options
    // almost every endpoint needs the collection membership to determine policy permissions.
    const scope = this.scope(["defaultScope", {
      method: ["withMembership", userId, rest.paranoid]
    }]);
    if ((0, _classValidator.isUUID)(id)) {
      const template = await scope.findOne({
        where: {
          id
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!template && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Template doesn't exist with id: ${id}`);
      }
      return template;
    }
    const match = id.match(_UrlHelper.UrlHelper.SLUG_URL_REGEX);
    if (match) {
      const template = await scope.findOne({
        where: {
          urlId: match[1]
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!template && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Template doesn't exist with id: ${id}`);
      }
      return template;
    }
    return null;
  }
}, _defineProperty(_Template, "eventNamespace", "templates"), _Template), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "urlId", [_dec4, _sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec6, _sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "fullWidth", [_dec8, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "template", [_dec0, _sequelizeTypescript.Column, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editorVersion", [_dec10, _sequelizeTypescript.Column, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec12, _sequelizeTypescript.Column, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "color", [_IsHexColor.default, _sequelizeTypescript.Column, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "language", [_sequelizeTypescript.Column, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec16, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "updatedBy", [_dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "lastModifiedById", [_dec20, _dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec25, _dec26, _dec27], {
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
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec33, _dec34], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec35, _dec36, _dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "revisions", [_dec38, _dec39], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "publishedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "createUrlId", [_sequelizeTypescript.BeforeValidate, _dec41, _dec42], Object.getOwnPropertyDescriptor(_class2, "createUrlId"), _class2), _class2)) || _class) || _class) || _class) || _class);
var _default = exports.default = Template;