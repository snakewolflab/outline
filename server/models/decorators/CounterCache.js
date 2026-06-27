"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CounterCache = CounterCache;
var _compat = require("es-toolkit/compat");
var _CacheHelper = require("../../utils/CacheHelper");
var _RedisPrefixHelper = require("../../utils/RedisPrefixHelper");
/**
 * A decorator that caches the count of a relationship and registers model lifecycle hooks
 * to invalidate the cache when models are added or removed from the relationship.
 */
function CounterCache(classResolver, options) {
  return function (target, _propertyKey) {
    const modelClass = classResolver();
    const modelName = target.constructor.name;
    const buildCacheKey = id => _RedisPrefixHelper.RedisPrefixHelper.getCounterCacheKey(modelName, options.as, String(id));
    const computeCount = id => modelClass.count({
      where: Object.assign({
        [options.foreignKey]: id
      }, options.where),
      include: options.include,
      distinct: !!options.include
    });
    const invalidate = async (model, hookOptions) => {
      const cacheKey = buildCacheKey(model[options.foreignKey]);
      const remove = async () => {
        await _CacheHelper.CacheHelper.removeData(cacheKey);
      };

      // Defer invalidation until after the transaction commits so that a
      // rollback does not leave the cache out of sync, and so that a stale
      // pre-commit count is not re-cached by a concurrent reader. Walk to
      // the parent transaction when nested so the callback isn't lost when
      // the savepoint releases without committing the outer transaction.
      if (hookOptions?.transaction) {
        const transaction = hookOptions.transaction.parent || hookOptions.transaction;
        transaction.afterCommit(remove);
      } else {
        await remove();
      }
    };

    // The model class is not added to a Sequelize instance until the database
    // module is first imported, which is later than decorator evaluation. Poll
    // until the model is ready, then register the hooks. Use unref() so the
    // pending immediate does not keep the event loop alive in environments
    // (such as tests) where the database is never initialized.
    const registerHooks = () => {
      if (!modelClass.sequelize) {
        setImmediate(registerHooks).unref();
        return;
      }
      modelClass.addHook("afterCreate", invalidate);
      modelClass.addHook("afterDestroy", invalidate);
    };
    setImmediate(registerHooks).unref();
    return {
      get() {
        const cacheKey = buildCacheKey(this.id);
        return _CacheHelper.CacheHelper.getData(cacheKey).then(value => {
          if (!(0, _compat.isNil)(value)) {
            return value;
          }
          return computeCount(this.id).then(count => {
            void _CacheHelper.CacheHelper.setData(cacheKey, count);
            return count;
          });
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TS rejects PropertyDescriptor as legacy decorator return type; descriptor is consumed by Sequelize at runtime.
    };
  };
}