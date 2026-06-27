"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _compat = require("es-toolkit/compat");
var _sequelizeTypescript = require("sequelize-typescript");
var _time = require("../../shared/utils/time");
var _validations = require("../../shared/validations");
var _errors = require("../errors");
var _CacheHelper = require("../utils/CacheHelper");
var _RedisPrefixHelper = require("../utils/RedisPrefixHelper");
var _Team = _interopRequireDefault(require("./Team"));
var _User = _interopRequireDefault(require("./User"));
var _ParanoidModel = _interopRequireDefault(require("./base/ParanoidModel"));
var _Encrypted = _interopRequireDefault(require("./decorators/Encrypted"));
var _Fix = _interopRequireDefault(require("./decorators/Fix"));
var _IsUrl = _interopRequireDefault(require("./validators/IsUrl"));
var _Length = _interopRequireDefault(require("./validators/Length"));
var _random = require("../../shared/random");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _WebhookSubscription;
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let WebhookSubscription = (_dec = (0, _sequelizeTypescript.DefaultScope)(() => ({
  include: [{
    association: "team",
    required: true
  }]
})), _dec2 = (0, _sequelizeTypescript.Table)({
  tableName: "webhook_subscriptions",
  modelName: "webhook_subscription"
}), _dec3 = (0, _Length.default)({
  max: _validations.WebhookSubscriptionValidation.maxNameLength,
  msg: `Webhook name must be ${_validations.WebhookSubscriptionValidation.maxNameLength} characters or less`
}), _dec4 = Reflect.metadata("design:type", String), _dec5 = (0, _Length.default)({
  max: _validations.WebhookSubscriptionValidation.maxUrlLength,
  msg: `Webhook url must be ${_validations.WebhookSubscriptionValidation.maxUrlLength} characters or less`
}), _dec6 = Reflect.metadata("design:type", String), _dec7 = Reflect.metadata("design:type", Boolean), _dec8 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.ARRAY(_sequelizeTypescript.DataType.STRING)), _dec9 = Reflect.metadata("design:type", Array), _dec0 = (0, _sequelizeTypescript.Column)(_sequelizeTypescript.DataType.BLOB), _dec1 = Reflect.metadata("design:type", String), _dec10 = (0, _sequelizeTypescript.BelongsTo)(() => _User.default, "createdById"), _dec11 = Reflect.metadata("design:type", typeof _User.default === "undefined" ? Object : _User.default), _dec12 = (0, _sequelizeTypescript.ForeignKey)(() => _User.default), _dec13 = Reflect.metadata("design:type", String), _dec14 = (0, _sequelizeTypescript.BelongsTo)(() => _Team.default, "teamId"), _dec15 = Reflect.metadata("design:type", typeof _Team.default === "undefined" ? Object : _Team.default), _dec16 = (0, _sequelizeTypescript.ForeignKey)(() => _Team.default), _dec17 = Reflect.metadata("design:type", String), _dec18 = Reflect.metadata("design:type", Function), _dec19 = Reflect.metadata("design:paramtypes", [Object]), _dec20 = Reflect.metadata("design:type", Function), _dec21 = Reflect.metadata("design:paramtypes", [Object, Object]), _dec(_class = _dec2(_class = (0, _Fix.default)(_class = (_class2 = (_WebhookSubscription = class WebhookSubscription extends _ParanoidModel.default {
  constructor() {
    super(...arguments);
    _initializerDefineProperty(this, "name", _descriptor, this);
    _initializerDefineProperty(this, "url", _descriptor2, this);
    _initializerDefineProperty(this, "enabled", _descriptor3, this);
    _initializerDefineProperty(this, "events", _descriptor4, this);
    _initializerDefineProperty(this, "secret", _descriptor5, this);
    // associations
    _initializerDefineProperty(this, "createdBy", _descriptor6, this);
    _initializerDefineProperty(this, "createdById", _descriptor7, this);
    _initializerDefineProperty(this, "team", _descriptor8, this);
    _initializerDefineProperty(this, "teamId", _descriptor9, this);
    /**
     * Determines if an event should be processed for this webhook subscription
     * based on the event configuration.
     *
     * @param event Event to check
     * @returns true if event is valid
     */
    _defineProperty(this, "validForEvent", event => WebhookSubscription.matchEvent(this.events, event.name));
    /**
     * Calculates the signature for a webhook payload if the webhook subscription
     * has an associated secret stored.
     *
     * @param payload The text payload of a webhook delivery
     * @returns the signature as a string
     */
    _defineProperty(this, "signature", payload => {
      if ((0, _compat.isNil)(this.secret)) {
        return;
      }
      const signTimestamp = Date.now();
      const signature = _nodeCrypto.default.createHmac("sha256", this.secret).update(`${signTimestamp}.${payload}`).digest("hex");
      return `t=${signTimestamp},s=${signature}`;
    });
  }
  /**
   * Returns the enabled webhook subscriptions for a team, caching the
   * lightweight { id, events } projection in Redis to avoid a database query on
   * every event. The cache is invalidated by model lifecycle hooks whenever a
   * team's subscriptions change.
   *
   * @param teamId The team to load subscriptions for.
   * @returns the enabled subscriptions' ids and subscribed event names.
   */
  static async findEnabledByTeamId(teamId) {
    return (await _CacheHelper.CacheHelper.getDataOrSet(_RedisPrefixHelper.RedisPrefixHelper.getWebhookSubscriptionsKey(teamId), async () => {
      const subscriptions = await this.unscoped().findAll({
        attributes: ["id", "events"],
        where: {
          enabled: true,
          teamId
        },
        raw: true
      });
      return subscriptions.map(subscription => ({
        id: subscription.id,
        events: subscription.events
      }));
    }, _time.Hour.seconds)) ?? [];
  }

  /**
   * Determines whether a subscription configured for the given event names
   * should receive an event with the given name. Pure so it can run against the
   * cached projection as well as model instances.
   *
   * @param events The event names a subscription is configured for.
   * @param eventName The name of the event being processed.
   * @returns true if the event matches the subscription configuration.
   */
  static matchEvent(events, eventName) {
    if (events.length === 1 && events[0] === "*") {
      return true;
    }
    for (const e of events) {
      if (e === eventName || eventName.startsWith(e + ".")) {
        return true;
      }
    }
    return false;
  }
  // hooks

  static async checkLimit(model) {
    const count = await this.count({
      where: {
        teamId: model.teamId
      }
    });
    if (count >= _validations.WebhookSubscriptionValidation.maxSubscriptions) {
      throw (0, _errors.ValidationError)(`You have reached the limit of ${_validations.WebhookSubscriptionValidation.maxSubscriptions} webhooks`);
    }
  }
  static async invalidateCache(model, options) {
    const invalidate = () => _CacheHelper.CacheHelper.removeData(_RedisPrefixHelper.RedisPrefixHelper.getWebhookSubscriptionsKey(model.teamId));

    // Defer invalidation until after the transaction commits so that a rollback
    // does not leave the cache out of sync, and so a stale pre-commit read is
    // not re-cached by a concurrent reader. Walk to the parent transaction when
    // nested so the callback isn't lost when a savepoint releases.
    if (options.transaction) {
      const transaction = options.transaction.parent || options.transaction;
      transaction.afterCommit(invalidate);
    } else {
      await invalidate();
    }
  }

  // instance methods

  /**
   * Rotate the secret value. Does not persist to database.
   */
  rotateSecret() {
    this.secret = `ol_whs_${(0, _random.randomString)(32)}`;
  }

  /**
   * Disables the webhook subscription
   *
   * @param options Save options
   * @returns Promise<WebhookSubscription>
   */
  async disable(options) {
    return this.update({
      enabled: false
    }, options);
  }
}, _defineProperty(_WebhookSubscription, "eventNamespace", "webhookSubscriptions"), _WebhookSubscription), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "name", [_sequelizeTypescript.NotEmpty, _dec3, _sequelizeTypescript.Column, _dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "url", [_IsUrl.default, _sequelizeTypescript.NotEmpty, _dec5, _sequelizeTypescript.Column, _dec6], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "enabled", [_sequelizeTypescript.Column, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "events", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "secret", [_sequelizeTypescript.AllowNull, _dec0, _Encrypted.default, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "createdBy", [_dec10, _dec11], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "createdById", [_dec12, _sequelizeTypescript.Column, _dec13], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "team", [_dec14, _dec15], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "teamId", [_dec16, _sequelizeTypescript.Column, _dec17], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
}), _applyDecoratedDescriptor(_class2, "checkLimit", [_sequelizeTypescript.BeforeCreate, _dec18, _dec19], Object.getOwnPropertyDescriptor(_class2, "checkLimit"), _class2), _applyDecoratedDescriptor(_class2, "invalidateCache", [_sequelizeTypescript.AfterCreate, _sequelizeTypescript.AfterUpdate, _sequelizeTypescript.AfterDestroy, _sequelizeTypescript.AfterRestore, _dec20, _dec21], Object.getOwnPropertyDescriptor(_class2, "invalidateCache"), _class2), _class2)) || _class) || _class) || _class);
var _default = exports.default = WebhookSubscription;