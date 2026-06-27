"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _types = require("../../shared/types");
var _errors = require("../errors");
var _Collection = _interopRequireDefault(require("./Collection"));
var _Document = _interopRequireDefault(require("./Document"));
var _Group = _interopRequireDefault(require("./Group"));
var _User = _interopRequireDefault(require("./User"));
var _UserMembership = _interopRequireDefault(require("./UserMembership"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
/**
 * Represents a group's permission to access a collection or document.
 */
let GroupMembership = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  withGroup: {
    include: [{
      association: "group"
    }]
  },
  withCollection: {
    where: {
      collectionId: {
        [_sequelize.Op.ne]: null
      }
    },
    include: [{
      association: "collection"
    }]
  },
  withDocument: {
    where: {
      documentId: {
        [_sequelize.Op.ne]: null
      }
    },
    include: [{
      association: "document"
    }]
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "group_permissions",
  modelName: "group_permission"
}), _dec3 = (0, _sequelizeTypescript.Default)(_types.CollectionPermission.ReadWrite), _dec4 = (0, _sequelizeTypescript.IsIn)([Object.values(_types.CollectionPermission)]), _dec5 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec6 = Reflect.metadata("design:type", Object), _dec7 = (0, _sequelizeTypescript.BelongsTo)(() => _Collection.default, "collectionId"), _dec8 = Reflect.metadata("design:type", typeof _Collection.default === "undefined" ? Object : _Collection.default), _dec9 = (0, _sequelizeTypescript.ForeignKey)(() => _Collection.default), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec1 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec11 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec12 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec14 = Reflect.metadata("design:type", String), _dec15 = (0, _sequelizeTypescript.BelongsTo)(() => GroupMembership, "sourceId"), _dec16 = Reflect.metadata("design:type", Object), _dec17 = (0, _sequelizeTypescript.ForeignKey)(() => GroupMembership), _dec18 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec19 = Reflect.metadata("design:type", String), _dec20 = (0, _sequelizeTypescript.BelongsTo)(() => _Group.default, "groupId"), _dec21 = Reflect.metadata("design:type", typeof _Group.default === "undefined" ? Object : _Group.default), _dec22 = (0, _sequelizeTypescript.ForeignKey)(() => _Group.default), _dec23 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec24 = Reflect.metadata("design:type", String), _dec25 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec26 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec27 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec28 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec29 = Reflect.metadata("design:type", String), _dec30 = Reflect.metadata("design:type", Function), _dec31 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec32 = Reflect.metadata("design:type", Function), _dec33 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec34 = Reflect.metadata("design:type", Function), _dec35 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec36 = Reflect.metadata("design:type", Function), _dec37 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec38 = Reflect.metadata("design:type", Function), _dec39 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec40 = Reflect.metadata("design:type", Function), _dec41 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec42 = Reflect.metadata("design:type", Function), _dec43 = Reflect.metadata("design:paramtypes", [Object, typeof DestroyOptions === "undefined" ? Object : DestroyOptions]), _dec44 = Reflect.metadata("design:type", Function), _dec45 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = class GroupMembership extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    /** The permission granted to the group. */
    _initializerDefineProperty(this, "permission", _descriptor, this);
    // associations
    /** The collection that this membership grants the group access to. */
    _initializerDefineProperty(this, "collection", _descriptor2, this);
    /** The collection ID that this membership grants the group access to. */
    _initializerDefineProperty(this, "collectionId", _descriptor3, this);
    /** The document that this membership grants the group access to. */
    _initializerDefineProperty(this, "document", _descriptor4, this);
    /** The document ID that this membership grants the group access to. */
    _initializerDefineProperty(this, "documentId", _descriptor5, this);
    /** If this represents the membership on a child then this points to the membership on the root */
    _initializerDefineProperty(this, "source", _descriptor6, this);
    /** If this represents the membership on a child then this points to the membership on the root */
    _initializerDefineProperty(this, "sourceId", _descriptor7, this);
    /** The group that this membership is granted to. */
    _initializerDefineProperty(this, "group", _descriptor8, this);
    /** The group ID that this membership is granted to. */
    _initializerDefineProperty(this, "groupId", _descriptor9, this);
    /** The user that created this membership. */
    _initializerDefineProperty(this, "createdBy", _descriptor0, this);
    /** The user ID that created this membership. */
    _initializerDefineProperty(this, "createdById", _descriptor1, this);
  }
  get modelId() {
    return this.groupId;
  }

  // static methods

  /**
   * Copy group memberships from one document to another.
   *
   * @param where The where clause to find the group memberships to copy.
   * @param document The document to copy the group memberships to.
   * @param options Additional options to pass to the query.
   */
  static async copy(where, document, options) {
    const {
      transaction
    } = options;
    const groupMemberships = await this.findAll({
      where,
      transaction
    });
    await Promise.all(groupMemberships.map(membership => this.create({
      documentId: document.id,
      groupId: membership.groupId,
      sourceId: membership.sourceId ?? membership.id,
      permission: membership.permission,
      createdById: membership.createdById
    }, {
      transaction,
      hooks: false
    })));
  }

  /**
   * Find the root membership for a document and (optionally) group.
   *
   * @param documentId The document ID to find the membership for.
   * @param groupId The group ID to find the membership for.
   * @param options Additional options to pass to the query.
   * @returns A promise that resolves to the root memberships for the document and group, or null.
   */
  static async findRootMembershipsForDocument(documentId, groupId, options) {
    const memberships = await this.findAll({
      where: {
        documentId,
        ...(groupId ? {
          groupId
        } : {})
      }
    });
    const rootMemberships = await Promise.all(memberships.map(membership => membership?.sourceId ? this.findByPk(membership.sourceId, options) : Promise.resolve(membership)));
    return rootMemberships.filter(Boolean);
  }

  // hooks

  static async createSourcedMemberships(model, options) {
    if (model.sourceId || !model.documentId) {
      return;
    }
    return this.recreateSourcedMemberships(model, options);
  }
  static async publishAddGroupEventAfterCreate(model, context) {
    await model.insertEvent(context, "add_group", {
      membershipId: model.id,
      isNew: true
    });
  }
  static async updateSourcedMemberships(model, options) {
    if (model.sourceId || !model.documentId) {
      return;
    }
    const {
      transaction
    } = options;
    if (model.changed("permission")) {
      await this.update({
        permission: model.permission
      }, {
        where: {
          groupId: model.groupId,
          sourceId: model.id
        },
        transaction
      });
    }
  }
  static async checkLastAdminBeforeUpdate(model, ctx) {
    if (model.permission === _types.CollectionPermission.Admin || model.previous("permission") !== _types.CollectionPermission.Admin || !model.collectionId) {
      return;
    }
    await this.validateLastAdminPermission(model, ctx);
  }
  static async checkLastAdminBeforeDestroy(model, ctx) {
    // Only check for last admin permission if this permission is admin
    if (model.permission !== _types.CollectionPermission.Admin || !model.collectionId) {
      return;
    }
    await this.validateLastAdminPermission(model, ctx);
  }
  static async publishAddGroupEventAfterUpdate(model, context) {
    await model.insertEvent(context, "add_group", {
      membershipId: model.id,
      isNew: false
    });
  }
  static async destroySourcedMemberships(model, options) {
    if (model.sourceId || !model.documentId) {
      return;
    }
    const {
      transaction
    } = options;
    await this.destroy({
      where: {
        groupId: model.groupId,
        sourceId: model.id
      },
      transaction
    });
  }
  static async publishRemoveGroupEvent(model, context) {
    await model.insertEvent(context, "remove_group", {
      membershipId: model.id
    });
  }

  /**
   * Recreate all sourced permissions for a given permission.
   */
  static async recreateSourcedMemberships(model, options) {
    if (!model.documentId) {
      return;
    }
    const {
      transaction,
      documentId
    } = options;
    const document = await _Document.default.unscoped().scope("withoutState").findOne({
      attributes: ["id"],
      where: {
        id: documentId ?? model.documentId
      },
      transaction
    });
    if (!document) {
      return;
    }
    const childDocumentIds = [...(documentId ? [documentId] : []), ...(await document.findAllChildDocumentIds({
      publishedAt: {
        [_sequelize.Op.ne]: null
      }
    }, {
      transaction
    }))];
    if (childDocumentIds.length) {
      await this.destroy({
        where: {
          groupId: model.groupId,
          sourceId: model.id,
          documentId: {
            [_sequelize.Op.in]: childDocumentIds
          }
        },
        transaction
      });
    }
    for (const childDocumentId of childDocumentIds) {
      await this.create({
        documentId: childDocumentId,
        groupId: model.groupId,
        permission: model.permission,
        sourceId: model.id,
        createdById: model.createdById,
        createdAt: model.createdAt,
        updatedAt: model.updatedAt
      }, {
        transaction,
        hooks: false
      });
    }
  }
  async insertEvent(ctx, name, data) {
    const hookContext = {
      ...ctx,
      event: {
        name,
        data,
        publish: true
      }
    };
    if (this.collectionId) {
      await _Collection.default.insertEvent(name, this, hookContext);
    } else {
      await _Document.default.insertEvent(name, this, hookContext);
    }
  }
  static async validateLastAdminPermission(model, _ref) {
    let {
      transaction
    } = _ref;
    const [userMemberships, groupMemberships] = await Promise.all([_UserMembership.default.count({
      where: {
        collectionId: model.collectionId,
        permission: _types.CollectionPermission.Admin
      },
      transaction
    }), this.count({
      where: {
        collectionId: model.collectionId,
        permission: _types.CollectionPermission.Admin
      },
      transaction
    })]);
    if (userMemberships === 0 && groupMemberships === 1) {
      throw (0, _errors.ValidationError)("At least one user or group must have manage permissions");
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class2.prototype, "permission", [_dec3, _dec4, _dec5, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "collection", [_dec7, _dec8], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "collectionId", [_dec9, _dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "document", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "documentId", [_dec12, _dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "source", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "sourceId", [_dec17, _dec18, _dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "group", [_dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "groupId", [_dec22, _dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec25, _dec26], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec27, _dec28, _dec29], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "createSourcedMemberships", [_sequelizeTypescript.AfterCreate, _dec30, _dec31], Object.getOwnPropertyDescriptor(_class2, "createSourcedMemberships"), _class2), _applyDecoratedDescriptor(_class2, "publishAddGroupEventAfterCreate", [_sequelizeTypescript.AfterCreate, _dec32, _dec33], Object.getOwnPropertyDescriptor(_class2, "publishAddGroupEventAfterCreate"), _class2), _applyDecoratedDescriptor(_class2, "updateSourcedMemberships", [_sequelizeTypescript.AfterUpdate, _dec34, _dec35], Object.getOwnPropertyDescriptor(_class2, "updateSourcedMemberships"), _class2), _applyDecoratedDescriptor(_class2, "checkLastAdminBeforeUpdate", [_sequelizeTypescript.BeforeUpdate, _dec36, _dec37], Object.getOwnPropertyDescriptor(_class2, "checkLastAdminBeforeUpdate"), _class2), _applyDecoratedDescriptor(_class2, "checkLastAdminBeforeDestroy", [_sequelizeTypescript.BeforeDestroy, _dec38, _dec39], Object.getOwnPropertyDescriptor(_class2, "checkLastAdminBeforeDestroy"), _class2), _applyDecoratedDescriptor(_class2, "publishAddGroupEventAfterUpdate", [_sequelizeTypescript.AfterUpdate, _dec40, _dec41], Object.getOwnPropertyDescriptor(_class2, "publishAddGroupEventAfterUpdate"), _class2), _applyDecoratedDescriptor(_class2, "destroySourcedMemberships", [_sequelizeTypescript.AfterDestroy, _dec42, _dec43], Object.getOwnPropertyDescriptor(_class2, "destroySourcedMemberships"), _class2), _applyDecoratedDescriptor(_class2, "publishRemoveGroupEvent", [_sequelizeTypescript.AfterDestroy, _dec44, _dec45], Object.getOwnPropertyDescriptor(_class2, "publishRemoveGroupEvent"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = GroupMembership;