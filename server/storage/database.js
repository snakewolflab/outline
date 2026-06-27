"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyStatementTimeoutToTransactions = applyStatementTimeoutToTransactions;
exports.checkConnection = void 0;
exports.createDatabaseInstance = createDatabaseInstance;
exports.createMigrationRunner = createMigrationRunner;
exports.migrations = void 0;
exports.monkeyPatchSequelizeErrorsForTests = monkeyPatchSequelizeErrorsForTests;
exports.sequelizeReadOnly = exports.sequelize = void 0;
var _nodeCluster = _interopRequireDefault(require("node:cluster"));
var _nodePath = _interopRequireDefault(require("node:path"));
var _sequelizeStrictAttributes = _interopRequireDefault(require("sequelize-strict-attributes"));
var _sequelizeTypescript = require("sequelize-typescript");
var _umzug = require("umzug");
var _error = require("../../shared/utils/error");
var _env = _interopRequireDefault(require("../env"));
var _errors = require("../errors");
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var models = _interopRequireWildcard(require("../models"));
var _requestContext = require("./requestContext");
var _utils = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Returns database configuration for Sequelize constructor.
 * Either uses DATABASE_URL or constructs options from individual components.
 */
function getDatabaseConfig() {
  if (_env.default.DATABASE_URL) {
    return _env.default.DATABASE_URL;
  }

  // If using individual components, return Sequelize options object
  if (_env.default.DATABASE_HOST && _env.default.DATABASE_NAME && _env.default.DATABASE_USER) {
    return {
      database: _env.default.DATABASE_NAME,
      username: _env.default.DATABASE_USER,
      password: _env.default.DATABASE_PASSWORD || undefined,
      host: _env.default.DATABASE_HOST,
      port: _env.default.DATABASE_PORT || 5432,
      dialect: "postgres"
    };
  }
  throw new Error("DATABASE_URL is not set or individual database components (DATABASE_HOST, DATABASE_NAME, DATABASE_USER) are not properly configured.");
}
const isSSLDisabled = _env.default.PGSSLMODE === "disable";
const poolMax = _env.default.DATABASE_CONNECTION_POOL_MAX ?? 5;
const poolMin = _env.default.DATABASE_CONNECTION_POOL_MIN ?? 0;
const databaseConfig = _env.default.DATABASE_CONNECTION_POOL_URL || getDatabaseConfig();
const schema = _env.default.DATABASE_SCHEMA;
const isApiProcess = (_env.default.SERVICES.includes("web") || _env.default.SERVICES.includes("collaboration") || _env.default.SERVICES.includes("websockets") || _env.default.SERVICES.includes("admin")) && !_env.default.SERVICES.includes("worker") && !_env.default.SERVICES.includes("cron");

// Request-handling processes get a Postgres `statement_timeout` matching the
// HTTP request timeout, so a single slow query cannot hold a connection past
// the point at which its response could be delivered. Applied as `SET LOCAL`
// inside each transaction so the value is scoped to the transaction.
const statementTimeout = isApiProcess && _nodeCluster.default.isWorker ? _env.default.REQUEST_TIMEOUT : undefined;
function createDatabaseInstance(databaseConfig, input, options) {
  try {
    let instance;
    const isReadOnly = options?.readOnly ?? false;

    // Common options for both URL and object configurations
    const commonOptions = {
      logging: msg => process.env.DEBUG?.includes("database") && _Logger.default.debug("database", msg),
      typeValidation: true,
      logQueryParameters: _env.default.isDevelopment,
      dialectOptions: {
        application_name: (0, _utils.getConnectionName)(),
        ssl: _env.default.isProduction && !isSSLDisabled ? {
          // Ref.: https://github.com/brianc/node-postgres/issues/2009
          rejectUnauthorized: false
        } : false
      },
      models: Object.values(input),
      pool: {
        // Read-only connections can have larger pools since there's no write contention
        max: isReadOnly ? poolMax * 2 : poolMax,
        min: poolMin,
        acquire: 30000,
        idle: 10000
      },
      // Only retry on deadlocks for write connections
      retry: isReadOnly ? undefined : {
        match: [/deadlock/i],
        max: 3,
        backoffBase: 200,
        backoffExponent: 1.5
      },
      schema
    };

    // If databaseConfig is a string, it's a URL; if it's an object, merge with common options
    if (typeof databaseConfig === "string") {
      instance = new _sequelizeTypescript.Sequelize(databaseConfig, commonOptions);
    } else {
      instance = new _sequelizeTypescript.Sequelize({
        ...databaseConfig,
        ...commonOptions
      });
    }
    (0, _sequelizeStrictAttributes.default)(instance);
    if (statementTimeout) {
      instance = applyStatementTimeoutToTransactions(instance, Number(statementTimeout));
    }
    if (_env.default.isTest) {
      instance = monkeyPatchSequelizeErrorsForTests(instance);
    }

    // Skip queries when the originating HTTP request socket has been destroyed
    // (e.g. client disconnected or server timeout). This avoids wasting database
    // resources on work whose response can never be delivered.
    const assertConnectionOpen = () => {
      const store = _requestContext.requestContext.getStore();
      if (store?.req.socket.destroyed) {
        throw (0, _errors.ClientClosedRequestError)();
      }
    };
    instance.addHook("beforeFind", assertConnectionOpen);
    instance.addHook("beforeCount", assertConnectionOpen);

    // Add hooks to warn about write operations on read-only connections
    if (isReadOnly) {
      const warnWriteOperation = operation => {
        _Logger.default.warn(`Attempted ${operation} operation on read-only database connection`);
      };
      instance.addHook("beforeCreate", () => warnWriteOperation("CREATE"));
      instance.addHook("beforeUpdate", () => warnWriteOperation("UPDATE"));
      instance.addHook("beforeDestroy", () => warnWriteOperation("DELETE"));
      instance.addHook("beforeBulkCreate", () => warnWriteOperation("BULK CREATE"));
      instance.addHook("beforeBulkUpdate", () => warnWriteOperation("BULK UPDATE"));
      instance.addHook("beforeBulkDestroy", () => warnWriteOperation("BULK DELETE"));
    }
    return instance;
  } catch (_err) {
    _Logger.default.fatal("Could not connect to database", typeof databaseConfig === "string" ? new Error(`Failed to parse: "${databaseConfig}". Ensure special characters in database URL are encoded`) : new Error(`Failed to connect using database credentials. Please check DATABASE_HOST, DATABASE_NAME, DATABASE_USER configuration`));
    // To satisfy TypeScript that a Sequelize instance is always returned
    throw _err;
  }
}

/**
 * This function is used to test the database connection on startup. It will
 * throw a descriptive error if the connection fails.
 */
const checkConnection = async db => {
  try {
    await db.authenticate();
  } catch (error) {
    if (error instanceof Error && error.message.includes("does not support SSL")) {
      _Logger.default.fatal("The database does not support SSL connections. Set the `PGSSLMODE` environment variable to `disable` or enable SSL on your database server.", error);
    } else {
      _Logger.default.fatal("Failed to connect to database", (0, _error.toError)(error));
    }
  }
};
exports.checkConnection = checkConnection;
function createMigrationRunner(db, glob) {
  return new _umzug.Umzug({
    migrations: {
      glob,
      resolve: _ref => {
        let {
          name,
          path,
          context
        } = _ref;
        // oxlint-disable-next-line @typescript-eslint/no-require-imports
        const migration = require(path);
        return {
          name,
          up: async () => migration.up(context, _sequelizeTypescript.Sequelize),
          down: async () => migration.down(context, _sequelizeTypescript.Sequelize)
        };
      }
    },
    context: db.getQueryInterface(),
    storage: new _umzug.SequelizeStorage({
      sequelize: db
    }),
    logger: {
      warn: params => _Logger.default.warn("database", params),
      error: params => _Logger.default.error(params.message, params),
      info: params => _Logger.default.info("database", params.event === "migrating" ? `Migrating ${String(params.name)}…` : `Migrated ${String(params.name)} in ${String(params.durationSeconds)}s`),
      debug: params => _Logger.default.debug("database", params.event === "migrating" ? `Migrating ${String(params.name)}…` : `Migrated ${String(params.name)} in ${String(params.durationSeconds)}s`)
    }
  });
}

/**
 * Wraps `sequelize.transaction()` so that every transaction issues
 * `SET LOCAL statement_timeout` immediately after it begins. Using `SET LOCAL`
 * scopes the value to the transaction, preventing it from leaking to other
 * consumers (e.g. background workers) sharing the same underlying connection
 * via pgbouncer's transaction pooling.
 */
function applyStatementTimeoutToTransactions(instance, timeoutMs) {
  const origTransaction = instance.transaction.bind(instance);
  const setLocalTimeout = t => instance.query(`SET LOCAL statement_timeout = ${timeoutMs}`, {
    transaction: t
  });
  instance.transaction = async (optionsOrCallback, maybeCallback) => {
    const autoCallback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
    const options = typeof optionsOrCallback === "function" ? undefined : optionsOrCallback;
    if (autoCallback) {
      return origTransaction(options, async t => {
        await setLocalTimeout(t);
        return autoCallback(t);
      });
    }
    const t = await origTransaction(options);
    try {
      await setLocalTimeout(t);
    } catch (err) {
      // Roll back so the started transaction does not linger on the pooled
      // connection until idle-in-transaction timeout closes it.
      try {
        await t.rollback();
      } catch {
        // Ignore rollback failure; the original error is more informative.
      }
      throw err;
    }
    return t;
  };
  return instance;
}

/**
 * Fixed in Sequelize v7, but hasn't been back-ported to Sequelize v6.
 * See https://github.com/sequelize/sequelize/issues/14807#issuecomment-1854398131
 */
function monkeyPatchSequelizeErrorsForTests(instance) {
  const sequelizeVersion = _sequelizeTypescript.Sequelize.version;
  const major = sequelizeVersion.split(".").map(Number)[0];
  if (major >= 7) {
    _Logger.default.fatal("Redundant patch", new Error("This patch was made redundant in Sequelize v7, you should check!"));
  }
  const origQueryFunc = instance.query.bind(instance);
  instance.query = async function () {
    try {
      return await origQueryFunc(...arguments);
    } catch (err) {
      // Ensure error appears in test output, not swallowed by Sequelize internals
      const error = err;
      _Logger.default.error(error.message, error.parent ?? error);
      throw err;
    }
  };
  return instance;
}
const sequelize = exports.sequelize = createDatabaseInstance(databaseConfig, models);

/**
 * Read-only database connection for read replicas.
 * Falls back to the main connection if DATABASE_READ_ONLY_URL is not set.
 */
const sequelizeReadOnly = exports.sequelizeReadOnly = _env.default.DATABASE_READ_ONLY_URL ? createDatabaseInstance(_env.default.DATABASE_READ_ONLY_URL, {}, {
  readOnly: true
}) : sequelize;
const migrations = exports.migrations = createMigrationRunner(sequelize, ["migrations/*.js", {
  cwd: _nodePath.default.resolve("server")
}]);