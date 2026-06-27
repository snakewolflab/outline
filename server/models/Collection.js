"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _fractionalIndex = _interopRequireDefault(require("fractional-index"));
var _compat = require("es-toolkit/compat");
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _isUUID = _interopRequireDefault(require("validator/lib/isUUID"));
var _types = require("../../shared/types");
var _UrlHelper = require("../../shared/utils/UrlHelper");
var _collections = require("../../shared/utils/collections");
var _slugify = _interopRequireDefault(require("../../shared/utils/slugify"));
var _validations = require("../../shared/validations");
var _editor = require("../editor");
var _errors = require("../errors");
var _CacheHelper = require("../utils/CacheHelper");
var _RedisPrefixHelper = require("../utils/RedisPrefixHelper");
var _removeIndexCollision = _interopRequireDefault(require("../utils/removeIndexCollision"));
var _url = require("../utils/url");
var _validation = require("../validation");
var _Document = _interopRequireDefault(require("./Document"));
var _FileOperation = _interopRequireDefault(require("./FileOperation"));
var _Group = _interopRequireDefault(require("./Group"));
var _GroupMembership = _interopRequireDefault(require("./GroupMembership"));
var _GroupUser = _interopRequireDefault(require("./GroupUser"));
var _Import = _interopRequireDefault(require("./Import"));
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _UserMembership = _interopRequireDefault(require("./UserMembership"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _DocumentHelper = require("./helpers/DocumentHelper");
var _IsHexColor = _interopRequireDefault(require("./validators/IsHexColor"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _NotContainsUrl = _interopRequireDefault(require("./validators/NotContainsUrl"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _dec66, _dec67, _dec68, _dec69, _dec70, _dec71, _dec72, _dec73, _dec74, _dec75, _dec76, _dec77, _dec78, _dec79, _dec80, _dec81, _dec82, _dec83, _dec84, _dec85, _dec86, _dec87, _dec88, _dec89, _dec90, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _Collection;
/* oxlint-disable lines-between-class-members */
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Collection = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  attributes: {
    exclude: ["documentStructure"]
  }
})), _dec2 = (0, _sequelizeTypescript.Scopes)(() => ({
  withAllMemberships: {
    include: [{
      model: _UserMembership.default,
      as: "memberships",
      required: false
    }, {
      model: _GroupMembership.default,
      as: "groupMemberships",
      required: false,
      // use of "separate" property: sequelize breaks when there are
      // nested "includes" with alternating values for "required"
      // see https://github.com/sequelize/sequelize/issues/9869
      separate: true,
      // include for groups that are members of this collection,
      // of which userId is a member of, resulting in:
      // GroupMembership [inner join] Group [inner join] GroupUser [where] userId
      include: [{
        model: _Group.default,
        as: "group",
        required: true,
        include: [{
          model: _GroupUser.default,
          as: "groupUsers",
          required: true
        }]
      }]
    }]
  },
  withUser: () => ({
    include: [{
      model: _User.default,
      required: true,
      as: "user"
    }]
  }),
  withArchivedBy: () => ({
    include: [{
      association: "archivedBy"
    }]
  }),
  withDocumentStructure: () => ({
    attributes: {
      // resets to include the documentStructure column
      exclude: []
    }
  }),
  withMembership: userId => {
    if (!userId) {
      return {};
    }
    return {
      include: [{
        association: "memberships",
        where: {
          userId
        },
        required: false
      }, {
        model: _GroupMembership.default,
        as: "groupMemberships",
        required: false,
        // use of "separate" property: sequelize breaks when there are
        // nested "includes" with alternating values for "required"
        // see https://github.com/sequelize/sequelize/issues/9869
        separate: true,
        // include for groups that are members of this collection,
        // of which userId is a member of, resulting in:
        // CollectionGroup [inner join] Group [inner join] GroupUser [where] userId
        include: [{
          model: _Group.default,
          as: "group",
          required: true,
          include: [{
            model: _GroupUser.default,
            as: "groupUsers",
            required: true,
            where: {
              userId
            }
          }]
        }]
      }]
    };
  }
})), _dec3 = (0, _sequelizeTypescript.Table)({
  tableName: "collections",
  modelName: "collection"
}), _dec4 = (0, _sequelizeTypescript.Length)({
  min: 10,
  max: 10,
  msg: `urlId must be 10 characters`
}), _dec5 = Reflect.metadata("design:type", String), _dec6 = (0, _Length.default)({
  max: _validations.CollectionValidation.maxNameLength,
  msg: `name must be ${_validations.CollectionValidation.maxNameLength} characters or less`
}), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _Length.default)({
  max: _validations.CollectionValidation.maxDescriptionLength,
  msg: `description must be ${_validations.CollectionValidation.maxDescriptionLength} characters or less`
}), _dec9 = Reflect.metadata("design:type", String), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec1 = Reflect.metadata("design:type", typeof ProsemirrorData === "undefined" ? Object : ProsemirrorData), _dec10 = Reflect.metadata("design:type", String), _dec11 = Reflect.metadata("design:type", String), _dec12 = (0, _Length.default)({
  max: _validation.ValidateIndex.maxLength,
  msg: `index must be ${_validation.ValidateIndex.maxLength} characters or less`
}), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.CollectionPermission)]), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec16 = Reflect.metadata("design:type", typeof _types.CollectionPermission === "undefined" ? Object : _types.CollectionPermission), _dec17 = (0, _sequelizeTypescript.Default)(false), _dec18 = Reflect.metadata("design:type", Boolean), _dec19 = (0, _sequelizeTypescript.Default)(null), _dec20 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec21 = Reflect.metadata("design:type", Array), _dec22 = (0, _sequelizeTypescript.Default)(true), _dec23 = Reflect.metadata("design:type", Boolean), _dec24 = (0, _sequelizeTypescript.Default)({
  field: "title",
  direction: "asc"
}), _dec25 = (0, _sequelizeTypescript.Column)({
  type: _sequelizeTypescript.DataType.JSONB,
  validate: {
    isSort(value) {
      if (typeof value !== "object" || !value.direction || !value.field || Object.keys(value).length !== 2) {
        throw new Error("Sort must be an object with field,direction");
      }
      if (!["asc", "desc"].includes(value.direction)) {
        throw new Error("Sort direction must be one of asc,desc");
      }
      if (!["title", "index"].includes(value.field)) {
        throw new Error("Sort field must be one of title,index");
      }
    }
  }
}), _dec26 = Reflect.metadata("design:type", typeof CollectionSort === "undefined" ? Object : CollectionSort), _dec27 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec28 = (0, _sequelizeTypescript.IsIn)([[_types.CollectionPermission.Admin, _types.CollectionPermission.ReadWrite]]), _dec29 = (0, _sequelizeTypescript.Default)(_types.CollectionPermission.Admin), _dec30 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec31 = Reflect.metadata("design:type", typeof _types.CollectionPermission === "undefined" ? Object : _types.CollectionPermission), _dec32 = (0, _sequelizeTypescript.AllowNull)(true), _dec33 = (0, _sequelizeTypescript.Default)(null), _dec34 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BOOLEAN), _dec35 = Reflect.metadata("design:type", Boolean), _dec36 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.JSONB), _dec37 = Reflect.metadata("design:type", typeof SourceMetadata === "undefined" ? Object : SourceMetadata), _dec38 = Reflect.metadata("design:type", Function), _dec39 = Reflect.metadata("design:paramtypes", [Object]), _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [Object]), _dec42 = Reflect.metadata("design:type", Function), _dec43 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec44 = Reflect.metadata("design:type", Function), _dec45 = Reflect.metadata("design:paramtypes", [Object]), _dec46 = Reflect.metadata("design:type", Function), _dec47 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec48 = Reflect.metadata("design:type", Function), _dec49 = Reflect.metadata("design:paramtypes", [Object, typeof CreateOptions === "undefined" ? Object : CreateOptions]), _dec50 = Reflect.metadata("design:type", Function), _dec51 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec52 = Reflect.metadata("design:type", Function), _dec53 = Reflect.metadata("design:paramtypes", [Object, typeof UpdateOptions === "undefined" ? Object : UpdateOptions]), _dec54 = Reflect.metadata("design:type", Function), _dec55 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec56 = (0, _sequelizeTypescript.BelongsTo)(() => _FileOperation.default, "importId"), _dec57 = Reflect.metadata("design:type", typeof _FileOperation.default === "undefined" ? Object : _FileOperation.default), _dec58 = (0, _sequelizeTypescript.ForeignKey)(() => _FileOperation.default), _dec59 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec60 = Reflect.metadata("design:type", String), _dec61 = (0, _sequelizeTypescript.BelongsTo)(() => _Import.default, "apiImportId"), _dec62 = Reflect.metadata("design:type", typeof _Import.default === "undefined" ? Object : _Import.default), _dec63 = (0, _sequelizeTypescript.ForeignKey)(() => _Import.default), _dec64 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec65 = Reflect.metadata("design:type", String), _dec66 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "archivedById"), _dec67 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec68 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec69 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec70 = Reflect.metadata("design:type", String), _dec71 = (0, _sequelizeTypescript.HasMany)(() => _Document.default, "collectionId"), _dec72 = Reflect.metadata("design:type", Array), _dec73 = (0, _sequelizeTypescript.HasMany)(() => _UserMembership.default, "collectionId"), _dec74 = Reflect.metadata("design:type", Array), _dec75 = (0, _sequelizeTypescript.HasMany)(() => _GroupMembership.default, "collectionId"), _dec76 = Reflect.metadata("design:type", Array), _dec77 = (0, _sequelizeTypescript.BelongsToMany)(() => _User.default, () => _UserMembership.default), _dec78 = Reflect.metadata("design:type", Array), _dec79 = (0, _sequelizeTypescript.BelongsToMany)(() => _Group.default, () => _GroupMembership.default), _dec80 = Reflect.metadata("design:type", Array), _dec81 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec82 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec83 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec84 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec85 = Reflect.metadata("design:type", String), _dec86 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec87 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec88 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec89 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec90 = Reflect.metadata("design:type", String), _dec(_class = _dec2(_class = _dec3(_class = (0, _Fix.default)(_class = (_class2 = (_Collection = class Collection extends _ParanoidModel.default {
  constructor() {
    var _this;
    super(...arguments);
    _this = this;
    _initializerDefineProperty(this, "urlId", _descriptor, this);
    _initializerDefineProperty(this, "name", _descriptor2, this);
    /**
     * The content of the collection as Markdown.
     *
     * @deprecated Use `content` instead, or `DocumentHelper.toMarkdown` if exporting lossy markdown.
     * This column will be removed in a future migration.
     */
    _initializerDefineProperty(this, "description", _descriptor3, this);
    /**
     * The content of the collection as JSON, this is a snapshot at the last time the state was saved.
     */
    _initializerDefineProperty(this, "content", _descriptor4, this);
    /** An icon (or) emoji to use as the collection icon. */
    _initializerDefineProperty(this, "icon", _descriptor5, this);
    /** The color of the icon. */
    _initializerDefineProperty(this, "color", _descriptor6, this);
    _initializerDefineProperty(this, "index", _descriptor7, this);
    _initializerDefineProperty(this, "permission", _descriptor8, this);
    _initializerDefineProperty(this, "maintainerApprovalRequired", _descriptor9, this);
    _initializerDefineProperty(this, "documentStructure", _descriptor0, this);
    _initializerDefineProperty(this, "sharing", _descriptor1, this);
    _initializerDefineProperty(this, "sort", _descriptor10, this);
    /** Whether the collection is archived, and if so when. */
    _initializerDefineProperty(this, "archivedAt", _descriptor11, this);
    /** The minimum permission level required to manage templates in this collection. */
    _initializerDefineProperty(this, "templateManagement", _descriptor12, this);
    /** Allows the configuration of commenting per collection. */
    _initializerDefineProperty(this, "commenting", _descriptor13, this);
    _initializerDefineProperty(this, "sourceMetadata", _descriptor14, this);
    // associations
    _initializerDefineProperty(this, "import", _descriptor15, this);
    _initializerDefineProperty(this, "importId", _descriptor16, this);
    _initializerDefineProperty(this, "apiImport", _descriptor17, this);
    _initializerDefineProperty(this, "apiImportId", _descriptor18, this);
    _initializerDefineProperty(this, "archivedBy", _descriptor19, this);
    _initializerDefineProperty(this, "archivedById", _descriptor20, this);
    _initializerDefineProperty(this, "documents", _descriptor21, this);
    _initializerDefineProperty(this, "memberships", _descriptor22, this);
    _initializerDefineProperty(this, "groupMemberships", _descriptor23, this);
    _initializerDefineProperty(this, "users", _descriptor24, this);
    _initializerDefineProperty(this, "groups", _descriptor25, this);
    _initializerDefineProperty(this, "user", _descriptor26, this);
    _initializerDefineProperty(this, "createdById", _descriptor27, this);
    _initializerDefineProperty(this, "team", _descriptor28, this);
    _initializerDefineProperty(this, "teamId", _descriptor29, this);
    /**
     * Returns the collection's documentStructure via cache, populating it on
     * miss. The cache is kept fresh by this model's save hooks, so callers
     * should prefer this over re-fetching the column directly.
     *
     * @returns the cached documentStructure, or null when the collection has none.
     */
    _defineProperty(this, "getCachedDocumentStructure", async () => {
      const result = await _CacheHelper.CacheHelper.getDataOrSet(_RedisPrefixHelper.RedisPrefixHelper.getCollectionDocumentsKey(this.id), async () => (await this.constructor.findByPk(this.id, {
        attributes: ["documentStructure"],
        includeDocumentStructure: true,
        rejectOnEmpty: true
      })).documentStructure, Collection.DOCUMENT_STRUCTURE_CACHE_TTL);
      return result ?? null;
    });
    _defineProperty(this, "getDocumentTree", documentId => {
      if (!this.documentStructure) {
        return null;
      }
      let result;
      const loopChildren = documents => {
        if (result) {
          return;
        }
        documents.forEach(document => {
          if (result) {
            return;
          }
          if (document.id === documentId) {
            result = document;
          } else {
            loopChildren(document.children);
          }
        });
      };

      // Technically, sorting the children is presenter-layer work...
      // but the only place it's used passes straight into an API response
      // so the extra indirection is not worthwhile
      loopChildren(this.documentStructure);

      // if the document is a draft loopChildren will not find it in the structure
      if (!result) {
        return null;
      }
      return {
        ...result,
        children: (0, _collections.sortNavigationNodes)(result.children, this.sort)
      };
    });
    /**
     * Archives the collection and all of its non-archived documents. The
     * collection's `archivedAt` and `archivedBy` are set to now and the acting
     * user respectively, and child documents inherit the same `archivedAt`.
     *
     * @param ctx - the API context, including the acting user and optional transaction.
     * @returns the updated collection.
     */
    _defineProperty(this, "archiveWithCtx", async ctx => {
      const {
        transaction
      } = ctx.state;
      const {
        user
      } = ctx.state.auth;
      this.archivedAt = new Date();
      this.archivedById = user.id;
      this.archivedBy = user;
      await this.saveWithCtx(ctx, undefined, {
        name: "archive"
      });
      await _Document.default.update({
        lastModifiedById: user.id,
        archivedAt: this.archivedAt
      }, {
        where: {
          teamId: this.teamId,
          collectionId: this.id,
          archivedAt: {
            [_sequelize.Op.is]: null
          }
        },
        transaction
      });
      return this;
    });
    _defineProperty(this, "deleteDocument", async (document, options) => {
      await this.removeDocumentInStructure(document, options);

      // Helper to destroy all child documents for a document
      const loopChildren = async (documentId, opts) => {
        const childDocuments = await _Document.default.findAll({
          where: {
            parentDocumentId: documentId
          }
        });
        for (const child of childDocuments) {
          await loopChildren(child.id, opts);
          await child.destroy(opts);
        }
      };
      await loopChildren(document.id, options);
      await document.destroy(options);
    });
    _defineProperty(this, "removeDocumentInStructure", async (document, options) => {
      if (!this.documentStructure) {
        return;
      }
      let result;
      const removeFromChildren = async (children, id) => {
        children = await Promise.all(children.map(async childDocument => ({
          ...childDocument,
          children: await removeFromChildren(childDocument.children, id)
        })));
        const match = (0, _compat.find)(children, {
          id
        });
        if (match) {
          if (!result) {
            result = [match, (0, _compat.findIndex)(children, {
              id
            })];
          }
          (0, _compat.remove)(children, {
            id
          });
        }
        return children;
      };
      this.documentStructure = await removeFromChildren(this.documentStructure, document.id);

      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      this.changed("documentStructure", true);
      if (options?.save !== false) {
        await this.save({
          ...options,
          fields: ["documentStructure"]
        });
      }
      return result;
    });
    _defineProperty(this, "getDocumentParents", documentId => {
      let result;
      const loopChildren = function (documents) {
        let path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        if (result) {
          return;
        }
        documents.forEach(document => {
          if (document.id === documentId) {
            result = path;
          } else {
            loopChildren(document.children, [...path, document.id]);
          }
        });
      };
      if (this.documentStructure) {
        loopChildren(this.documentStructure);
      }
      return result;
    });
    /**
     * Update document's title and url in the documentStructure
     */
    _defineProperty(this, "updateDocument", async (updatedDocument, options) => {
      if (!this.documentStructure) {
        return;
      }
      const {
        id
      } = updatedDocument;
      const updateChildren = documents => Promise.all(documents.map(async document => {
        if (document.id === id) {
          document = {
            ...(await updatedDocument.toNavigationNode(options)),
            children: document.children
          };
        } else {
          document.children = await updateChildren(document.children);
        }
        return document;
      }));
      this.documentStructure = await updateChildren(this.documentStructure);
      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      this.changed("documentStructure", true);
      await this.save({
        fields: ["documentStructure"],
        ...options
      });
      return this;
    });
    _defineProperty(this, "addDocumentToStructure", async function (document, index) {
      let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      if (!_this.documentStructure) {
        _this.documentStructure = [];
      }
      if (_this.getDocumentTree(document.id)) {
        return _this;
      }

      // If moving existing document with children, use existing structure
      const documentJson = {
        ...(await document.toNavigationNode(options)),
        ...options.documentJson
      };

      // Determine the insertion index based on order parameter or explicit index
      let insertionIndex;
      if (index !== undefined) {
        // Explicit index takes precedence
        insertionIndex = index;
      } else if (options.insertOrder === "prepend") {
        // Prepend to the beginning
        insertionIndex = 0;
      } else {
        // Default behavior: append to the end (maintains backward compatibility)
        insertionIndex = _this.documentStructure.length;
      }
      if (!document.parentDocumentId) {
        // Note: Index is supported on DB level but it's being ignored
        // by the API presentation until we build product support for it.
        _this.documentStructure.splice(insertionIndex, 0, documentJson);
      } else {
        // Recursively place document
        const placeDocument = documentList => documentList.map(childDocument => {
          if (document.parentDocumentId === childDocument.id) {
            const childInsertionIndex = index !== undefined ? index : options.insertOrder === "prepend" ? 0 : childDocument.children.length;
            childDocument.children.splice(childInsertionIndex, 0, documentJson);
          } else {
            childDocument.children = placeDocument(childDocument.children);
          }
          return childDocument;
        });
        _this.documentStructure = placeDocument(_this.documentStructure);
      }

      // Sequelize doesn't seem to set the value with splice on JSONB field
      // https://github.com/sequelize/sequelize/blob/e1446837196c07b8ff0c23359b958d68af40fd6d/src/model.js#L3937
      _this.changed("documentStructure", true);
      if (options?.save !== false) {
        await _this.save({
          ...options,
          fields: ["documentStructure"]
        });
      }
      return _this;
    });
    /**
     * Get all of the document ids that are in this collection by
     * recursively iterating through `documentStructure`.
     *
     * @returns list of document ids
     */
    _defineProperty(this, "getAllDocumentIds", () => {
      if (!this.documentStructure) {
        return [];
      }
      const allDocumentIds = [];
      const loopChildren = node => {
        allDocumentIds.push(node.id);
        (node.children ?? []).forEach(childNode => {
          loopChildren(childNode);
        });
      };
      this.documentStructure.forEach(loopChildren);
      return allDocumentIds;
    });
    /**
     * Returns a JSON representation of this collection suitable for use in the frontend navigation.
     *
     * @returns NavigationNode
     */
    _defineProperty(this, "toNavigationNode", () => ({
      id: this.id,
      title: this.name,
      url: this.path,
      icon: (0, _compat.isNil)(this.icon) ? undefined : this.icon,
      color: (0, _compat.isNil)(this.color) ? undefined : this.color,
      children: (0, _collections.sortNavigationNodes)(this.documentStructure ?? [], this.sort)
    }));
  }
  // getters

  /** The frontend path to this collection. */
  get path() {
    return Collection.getPath({
      name: this.name,
      urlId: this.urlId
    });
  }

  /**
   * Returns the frontend path for a collection.
   *
   * @param name The collection name.
   * @param urlId The collection URL ID.
   * @returns the frontend path for the collection.
   */
  static getPath(_ref) {
    let {
      name,
      urlId
    } = _ref;
    if (!name) {
      return `/collection/untitled-${urlId}`;
    }
    const slugifiedName = (0, _slugify.default)(name);
    if (!slugifiedName) {
      return `/collection/untitled-${urlId}`;
    }
    return `/collection/${slugifiedName}-${urlId}`;
  }

  /**
   * Whether this collection is considered active or not. A collection is active if
   * it has not been archived or deleted.
   *
   * @returns boolean
   */
  get isActive() {
    return !this.archivedAt && !this.deletedAt;
  }

  // hooks

  static async onBeforeValidate(model) {
    model.urlId = model.urlId || (0, _url.generateUrlId)();
  }
  static async onBeforeSave(model) {
    const descriptionChanged = model.changed("description");
    const contentChanged = model.changed("content");
    if (descriptionChanged && !contentChanged) {
      model.content = model.description ? _editor.parser.parse(model.description)?.toJSON() ?? null : null;
    } else if (contentChanged && !descriptionChanged) {
      model.description = model.content ? await _DocumentHelper.DocumentHelper.toMarkdown(model, {
        includeTitle: false
      }) : null;
    } else if (!model.content) {
      model.content = await _DocumentHelper.DocumentHelper.toJSON(model);
    }
    if (model.changed("documentStructure")) {
      await _CacheHelper.CacheHelper.clearData(_RedisPrefixHelper.RedisPrefixHelper.getCollectionDocumentsKey(model.id));
    }
  }
  static async cacheDocumentStructure(model, options) {
    if (model.changed("documentStructure")) {
      const setData = () => _CacheHelper.CacheHelper.setData(_RedisPrefixHelper.RedisPrefixHelper.getCollectionDocumentsKey(model.id), model.documentStructure, Collection.DOCUMENT_STRUCTURE_CACHE_TTL);
      if (options.transaction) {
        return (options.transaction.parent || options.transaction).afterCommit(setData);
      }
      await setData();
    }
  }
  static async checkLastCollection(model) {
    const total = await this.count({
      where: {
        teamId: model.teamId
      }
    });
    if (total === 1) {
      throw (0, _errors.ValidationError)("Cannot delete last collection");
    }
  }
  static async deleteDocuments(model, ctx) {
    await _Document.default.update({
      lastModifiedById: ctx.auth.user.id,
      deletedAt: new Date()
    }, {
      transaction: ctx.transaction,
      where: {
        teamId: model.teamId,
        collectionId: model.id,
        archivedAt: {
          [_sequelize.Op.is]: null
        }
      }
    });
  }
  static async setIndex(model, options) {
    if (model.index) {
      model.index = await (0, _removeIndexCollision.default)(model.teamId, model.index, {
        transaction: options.transaction
      });
      return;
    }
    const firstCollectionForTeam = await this.findOne({
      where: {
        teamId: model.teamId
      },
      order: [
      // using LC_COLLATE:"C" because we need byte order to drive the sorting
      _sequelizeTypescript.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
      transaction: options.transaction
    });
    model.index = (0, _fractionalIndex.default)(null, firstCollectionForTeam?.index ?? null);
  }
  static async onAfterCreate(model, options) {
    const existing = await _UserMembership.default.findOne({
      where: {
        collectionId: model.id,
        userId: model.createdById
      },
      transaction: options.transaction
    });
    if (!existing) {
      return _UserMembership.default.create({
        collectionId: model.id,
        userId: model.createdById,
        permission: _types.CollectionPermission.Admin,
        createdById: model.createdById
      }, {
        transaction: options.transaction,
        hooks: false
      });
    }
    return existing;
  }
  static async checkIndex(model, options) {
    if (model.index && model.changed("index") || !model.archivedAt && model.changed("archivedAt")) {
      model.index = await (0, _removeIndexCollision.default)(model.teamId, model.index, {
        transaction: options.transaction
      });
    }
  }
  static async publishPermissionChangedEvent(model, ctx) {
    const privacyChanged = model.previous("permission") !== model.permission;
    const sharingChanged = model.previous("sharing") !== model.sharing;
    if (privacyChanged || sharingChanged) {
      await this.insertEvent("permission_changed", model, {
        ...ctx,
        event: {
          publish: true
        }
      });
    }
  }
  /**
   * Returns an array of unique userIds that are members of a collection,
   * either via group or direct membership.
   *
   * @param collectionId
   * @param permission optional permission filter
   *
   * @returns userIds
   */
  static async membershipUserIds(collectionId, permission) {
    const collection = await this.scope("withAllMemberships").findOne({
      where: {
        id: collectionId
      },
      include: [{
        association: "memberships",
        required: false,
        ...(permission ? {
          where: {
            permission
          }
        } : {}),
        separate: true
      }, {
        association: "groupMemberships",
        required: false,
        ...(permission ? {
          where: {
            permission
          }
        } : {}),
        separate: true
      }]
    });
    if (!collection) {
      return [];
    }
    const groupMemberships = collection.groupMemberships.map(gm => gm.group.groupUsers).flat();
    const membershipUserIds = [...groupMemberships, ...collection.memberships].map(membership => membership.userId);
    return (0, _compat.uniq)(membershipUserIds);
  }

  /**
   * Overrides the standard findByPk behavior to allow also querying by urlId
   * and loading memberships for a user passed in by `userId`
   *
   * @param id uuid or urlId
   * @param options FindOptions
   * @returns A promise resolving to a collection instance or null
   */

  static async findByPk(id) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (typeof id !== "string") {
      return null;
    }
    const {
      includeDocumentStructure,
      includeOwner,
      includeArchivedBy,
      userId,
      ...rest
    } = options;
    const scopes = [includeDocumentStructure ? "withDocumentStructure" : "defaultScope", {
      method: ["withMembership", userId]
    }];
    if (includeOwner) {
      scopes.push("withUser");
    }
    if (includeArchivedBy) {
      scopes.push("withArchivedBy");
    }
    const scope = this.scope(scopes);
    if ((0, _isUUID.default)(id)) {
      const collection = await scope.findOne({
        where: {
          id
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!collection && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Collection doesn't exist with id: ${id}`);
      }
      return collection;
    }
    const match = id.match(_UrlHelper.UrlHelper.SLUG_URL_REGEX);
    if (match) {
      const collection = await scope.findOne({
        where: {
          urlId: match[1]
        },
        ...rest,
        rejectOnEmpty: false
      });
      if (!collection && rest.rejectOnEmpty) {
        throw new _sequelize.EmptyResultError(`Collection doesn't exist with id: ${id}`);
      }
      return collection;
    }
    return null;
  }

  /**
   * Find the first collection that the specified user has access to.
   *
   * @param user User to find the collection for
   * @param options Additional options for the query
   * @returns collection First collection in the sidebar order
   */
  static async findFirstCollectionForUser(user) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const id = await user.collectionIds({
      transaction: options.transaction
    });
    return this.findOne({
      where: {
        teamId: user.teamId,
        id
      },
      order: [
      // using LC_COLLATE:"C" because we need byte order to drive the sorting
      _sequelizeTypescript.Sequelize.literal('"collection"."index" collate "C"'), ["updatedAt", "DESC"]],
      ...options
    });
  }

  /**
   * Convenience method to return if a collection is considered private.
   * This means that a membership is required to view it rather than just being
   * a workspace member.
   *
   * @returns boolean
   */
  get isPrivate() {
    return !this.permission;
  }
}, _defineProperty(_Collection, "DEFAULT_SORT", {
  field: "index",
  direction: "asc"
}), _defineProperty(_Collection, "DOCUMENT_STRUCTURE_CACHE_TTL", 60), _Collection), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "urlId", [_dec4, _sequelizeTypescript.Unique, _sequelizeTypescript.Column, _dec5], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "name", [_NotContainsUrl.default, _dec6, _sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "description", [_dec8, _sequelizeTypescript.Column, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_sequelizeTypescript.Column, _dec10], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "color", [_IsHexColor.default, _sequelizeTypescript.Column, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "index", [_dec12, _sequelizeTypescript.Column, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "permission", [_dec14, _dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "maintainerApprovalRequired", [_dec17, _sequelizeTypescript.Column, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "documentStructure", [_dec19, _dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "sharing", [_dec22, _sequelizeTypescript.Column, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "sort", [_dec24, _dec25, _dec26], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "archivedAt", [_sequelizeTypescript.IsDate, _sequelizeTypescript.Column, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "templateManagement", [_dec28, _dec29, _dec30, _dec31], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "commenting", [_dec32, _dec33, _dec34, _dec35], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "sourceMetadata", [_sequelizeTypescript.AllowNull, _dec36, _dec37], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "onBeforeValidate", [_sequelizeTypescript.BeforeValidate, _dec38, _dec39], Object.getOwnPropertyDescriptor(_class2, "onBeforeValidate"), _class2), _applyDecoratedDescriptor(_class2, "onBeforeSave", [_sequelizeTypescript.BeforeSave, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2, "onBeforeSave"), _class2), _applyDecoratedDescriptor(_class2, "cacheDocumentStructure", [_sequelizeTypescript.AfterSave, _dec42, _dec43], Object.getOwnPropertyDescriptor(_class2, "cacheDocumentStructure"), _class2), _applyDecoratedDescriptor(_class2, "checkLastCollection", [_sequelizeTypescript.BeforeDestroy, _dec44, _dec45], Object.getOwnPropertyDescriptor(_class2, "checkLastCollection"), _class2), _applyDecoratedDescriptor(_class2, "deleteDocuments", [_sequelizeTypescript.BeforeDestroy, _dec46, _dec47], Object.getOwnPropertyDescriptor(_class2, "deleteDocuments"), _class2), _applyDecoratedDescriptor(_class2, "setIndex", [_sequelizeTypescript.BeforeCreate, _dec48, _dec49], Object.getOwnPropertyDescriptor(_class2, "setIndex"), _class2), _applyDecoratedDescriptor(_class2, "onAfterCreate", [_sequelizeTypescript.AfterCreate, _dec50, _dec51], Object.getOwnPropertyDescriptor(_class2, "onAfterCreate"), _class2), _applyDecoratedDescriptor(_class2, "checkIndex", [_sequelizeTypescript.BeforeUpdate, _dec52, _dec53], Object.getOwnPropertyDescriptor(_class2, "checkIndex"), _class2), _applyDecoratedDescriptor(_class2, "publishPermissionChangedEvent", [_sequelizeTypescript.BeforeUpdate, _dec54, _dec55], Object.getOwnPropertyDescriptor(_class2, "publishPermissionChangedEvent"), _class2), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "import", [_dec56, _dec57], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "importId", [_dec58, _dec59, _dec60], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "apiImport", [_dec61, _dec62], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "apiImportId", [_dec63, _dec64, _dec65], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "archivedBy", [_dec66, _dec67], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "archivedById", [_sequelizeTypescript.AllowNull, _dec68, _dec69, _dec70], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "documents", [_dec71, _dec72], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "memberships", [_dec73, _dec74], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "groupMemberships", [_dec75, _dec76], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "users", [_dec77, _dec78], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "groups", [_dec79, _dec80], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "user", [_dec81, _dec82], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor27 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec83, _dec84, _dec85], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor28 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec86, _dec87], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor29 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec88, _dec89, _dec90], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _class2)) || _class) || _class) || _class) || _class);
var _default = exports.default = Collection;