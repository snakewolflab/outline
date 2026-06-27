"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _sequelize = require("sequelize");
var _sequelizeTypescript = require("sequelize-typescript");
var _dateFns = require("date-fns");
var _errors = require("../errors");
var _Document = _interopRequireDefault(require("./Document"));
var _Share = _interopRequireDefault(require("./Share"));
var _IdModel = _interopRequireDefault(require("./base/IdModel"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _ShareSubscription;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
/**
 * A subscription to email notifications for updates to a publicly shared
 * document and its descendants.
 */
let ShareSubscription = (_dec = (0, _sequelizeTypescript.Scopes)(() => ({
  active: {
    where: {
      confirmedAt: {
        [_sequelize.Op.not]: null
      },
      unsubscribedAt: null
    }
  }
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "share_subscriptions",
  modelName: "share_subscription"
}), _dec3 = (0, _sequelizeTypescript.BelongsTo)(() => _Share.default, "shareId"), _dec4 = Reflect.metadata("design:type", typeof _Share.default === "undefined" ? Object : _Share.default), _dec5 = (0, _sequelizeTypescript.ForeignKey)(() => _Share.default), _dec6 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec7 = Reflect.metadata("design:type", String), _dec8 = (0, _sequelizeTypescript.BelongsTo)(() => _Document.default, "documentId"), _dec9 = Reflect.metadata("design:type", typeof _Document.default === "undefined" ? Object : _Document.default), _dec0 = (0, _sequelizeTypescript.ForeignKey)(() => _Document.default), _dec1 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.UUID), _dec10 = Reflect.metadata("design:type", String), _dec11 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec12 = Reflect.metadata("design:type", String), _dec13 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec14 = Reflect.metadata("design:type", String), _dec15 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING), _dec16 = Reflect.metadata("design:type", String), _dec17 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.STRING(45)), _dec18 = Reflect.metadata("design:type", String), _dec19 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec20 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec21 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec22 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec23 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.DATE), _dec24 = Reflect.metadata("design:type", typeof Date === "undefined" ? Object : Date), _dec25 = Reflect.metadata("design:type", Function), _dec26 = Reflect.metadata("design:paramtypes", [Object, typeof SaveOptions === "undefined" ? Object : SaveOptions]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_ShareSubscription = class ShareSubscription extends _IdModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "share", _descriptor, this);
    _initializerDefineProperty(this, "shareId", _descriptor2, this);
    /** The document to scope notifications to (the document and its descendants). */
    _initializerDefineProperty(this, "document", _descriptor3, this);
    _initializerDefineProperty(this, "documentId", _descriptor4, this);
    /** The subscribed email */
    _initializerDefineProperty(this, "email", _descriptor5, this);
    /** Normalized email fingerprint helps to improve spam detection through removal of common bypasses */
    _initializerDefineProperty(this, "emailFingerprint", _descriptor6, this);
    /** Signing secret for subscribe/unsubscribe links */
    _initializerDefineProperty(this, "secret", _descriptor7, this);
    /** IP address of the user that subscribed */
    _initializerDefineProperty(this, "ipAddress", _descriptor8, this);
    _initializerDefineProperty(this, "confirmedAt", _descriptor9, this);
    _initializerDefineProperty(this, "unsubscribedAt", _descriptor0, this);
    _initializerDefineProperty(this, "lastNotifiedAt", _descriptor1, this);
  }
  /**
   * Enforce a per-IP rate limit on subscription creation to prevent abuse.
   *
   * @param model The subscription being created.
   * @param options The save options including the current transaction.
   * @throws when the IP has reached the maximum number of subscriptions.
   */
  static async checkIPLimit(model, options) {
    if (!model.ipAddress) {
      return;
    }
    const results = await this.findAll({
      attributes: ["emailFingerprint"],
      where: {
        ipAddress: model.ipAddress
      },
      group: ["emailFingerprint"],
      transaction: options.transaction
    });
    const count = results.length;
    if (count >= this.maxSubscriptionsPerIP) {
      throw (0, _errors.ValidationError)(`You have reached the limit of subscriptions`);
    }
  }

  /**
   * Whether this subscription has been confirmed via email.
   */
  get isConfirmed() {
    return !!this.confirmedAt;
  }

  /**
   * Whether this subscription has been unsubscribed.
   */
  get isUnsubscribed() {
    return !!this.unsubscribedAt;
  }

  /**
   * Whether the confirmation token has expired (24-hour window from last update).
   */
  get isTokenExpired() {
    return this.updatedAt < (0, _dateFns.subHours)(new Date(), 24);
  }

  /**
   * Normalize an email address into a fingerprint for uniqueness comparison.
   * Lowercases, removes dots from local part, and strips +alias suffixes.
   *
   * @param email The email address to normalize.
   * @returns The normalized email fingerprint.
   */
  static normalizeEmailFingerprint(email) {
    // Strip null bytes to prevent injection bypasses
    // eslint-disable-next-line no-control-regex
    const lower = email.replace(/\0/g, "").toLowerCase().trim();
    const [localPart, domain] = lower.split("@");
    if (!localPart || !domain) {
      return _nodeCrypto.default.createHash("sha256").update(lower).digest("hex");
    }
    const withoutPlus = localPart.split("+")[0];

    // Normalize googlemail.com to gmail.com as they are the same service
    const normalizedDomain = domain === "googlemail.com" ? "gmail.com" : domain;

    // Gmail ignores dots in the local part; other providers treat them as significant
    const normalizedLocal = normalizedDomain === "gmail.com" ? withoutPlus.replace(/\./g, "") : withoutPlus;
    const normalized = `${normalizedLocal}@${normalizedDomain}`;
    return _nodeCrypto.default.createHash("sha256").update(normalized).digest("hex");
  }

  /**
   * Generate an HMAC token for confirming this subscription.
   *
   * @param subscription The subscription to generate a token for.
   * @returns The confirmation token as a hex string.
   */
  static generateConfirmToken(subscription) {
    return _nodeCrypto.default.createHmac("sha256", subscription.secret).update(`${subscription.shareId}:${subscription.email}:confirm`).digest("hex");
  }

  /**
   * Generate an HMAC token for unsubscribing from this subscription.
   *
   * @param subscription The subscription to generate a token for.
   * @returns The unsubscribe token as a hex string.
   */
  static generateUnsubscribeToken(subscription) {
    return _nodeCrypto.default.createHmac("sha256", subscription.secret).update(`${subscription.shareId}:${subscription.email}:unsubscribe`).digest("hex");
  }
}, _defineProperty(_ShareSubscription, "maxSubscriptionsPerIP", 3), _ShareSubscription), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec3, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "shareId", [_dec5, _dec6, _dec7], {
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
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "email", [_dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "emailFingerprint", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "secret", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "ipAddress", [_dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "confirmedAt", [_dec19, _dec20], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor0 = _applyDecoratedDescriptor(_class2.prototype, "unsubscribedAt", [_dec21, _dec22], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor1 = _applyDecoratedDescriptor(_class2.prototype, "lastNotifiedAt", [_dec23, _dec24], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "checkIPLimit", [_sequelizeTypescript.BeforeCreate, _dec25, _dec26], Object.getOwnPropertyDescriptor(_class2, "checkIPLimit"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = ShareSubscription;