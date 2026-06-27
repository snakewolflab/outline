"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Environment = void 0;
var _environment = _interopRequireDefault(require("./utils/environment"));
var _nodeOs = _interopRequireDefault(require("node:os"));
var _services = _interopRequireDefault(require("nodemailer/lib/well-known/services.json"));
var _classValidator = require("class-validator");
var _compat = require("es-toolkit/compat");
var _i18n = require("../shared/i18n");
var _time = require("../shared/utils/time");
var _validators = require("./utils/validators");
var _Deprecated = _interopRequireDefault(require("./models/decorators/Deprecated"));
var _args = require("./utils/args");
var _Public = require("./utils/decorators/Public");
var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec0, _dec1, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _dec49, _dec50, _dec51, _dec52, _dec53, _dec54, _dec55, _dec56, _dec57, _dec58, _dec59, _dec60, _dec61, _dec62, _dec63, _dec64, _dec65, _dec66, _dec67, _dec68, _dec69, _dec70, _dec71, _dec72, _dec73, _dec74, _dec75, _dec76, _dec77, _dec78, _dec79, _dec80, _dec81, _dec82, _dec83, _dec84, _dec85, _dec86, _dec87, _dec88, _dec89, _dec90, _dec91, _dec92, _dec93, _dec94, _dec95, _dec96, _dec97, _dec98, _dec99, _dec100, _dec101, _dec102, _dec103, _dec104, _dec105, _dec106, _dec107, _dec108, _dec109, _dec110, _dec111, _dec112, _dec113, _dec114, _dec115, _dec116, _dec117, _dec118, _dec119, _dec120, _dec121, _dec122, _dec123, _dec124, _dec125, _dec126, _dec127, _dec128, _dec129, _dec130, _dec131, _dec132, _class, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor0, _descriptor1, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26, _descriptor27, _descriptor28, _descriptor29, _descriptor30, _descriptor31, _descriptor32, _descriptor33, _descriptor34, _descriptor35, _descriptor36, _descriptor37, _descriptor38, _descriptor39, _descriptor40, _descriptor41, _descriptor42, _descriptor43, _descriptor44, _descriptor45, _descriptor46, _descriptor47, _descriptor48, _descriptor49, _descriptor50, _descriptor51, _descriptor52, _descriptor53, _descriptor54, _descriptor55, _descriptor56, _descriptor57, _descriptor58, _descriptor59, _descriptor60, _descriptor61, _descriptor62, _descriptor63, _descriptor64, _descriptor65, _descriptor66, _descriptor67, _descriptor68, _descriptor69, _descriptor70, _descriptor71, _descriptor72, _descriptor73, _descriptor74, _descriptor75, _descriptor76, _descriptor77, _descriptor78, _descriptor79, _descriptor80, _descriptor81, _descriptor82;
/* oxlint-disable no-console */
// oxlint-disable-next-line import/order
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _initializerDefineProperty(e, i, r, l) { r && Object.defineProperty(e, i, { enumerable: r.enumerable, configurable: r.configurable, writable: r.writable, value: r.initializer ? r.initializer.call(l) : void 0 }); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _applyDecoratedDescriptor(i, e, r, n, l) { var a = {}; return Object.keys(n).forEach(function (i) { a[i] = n[i]; }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) { return n(i, e, r) || r; }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a; }
function _initializerWarningHelper(r, e) { throw Error("Decorating class property failed. Please ensure that transform-class-properties is enabled and runs after the decorators transform."); }
let Environment = exports.Environment = (_dec = (0, _classValidator.IsIn)(["development", "production", "staging", "test"]), _dec2 = (0, _classValidator.IsHexadecimal)(), _dec3 = (0, _classValidator.Length)(64, 64, {
  message: `The SECRET_KEY environment variable must be exactly 64 hexadecimal characters (Use \`openssl rand -hex 32\` to generate a value).`
}), _dec4 = (0, _classValidator.IsNotEmpty)(), _dec5 = (0, _classValidator.IsOptional)(), _dec6 = (0, _validators.IsDatabaseUrl)(), _dec7 = (0, _validators.CannotUseWithAny)(["DATABASE_HOST", "DATABASE_PORT", "DATABASE_NAME", "DATABASE_USER", "DATABASE_PASSWORD"]), _dec8 = (0, _classValidator.IsOptional)(), _dec9 = (0, _validators.IsDatabaseUrl)(), _dec0 = (0, _classValidator.IsOptional)(), _dec1 = (0, _validators.CannotUseWith)("DATABASE_URL"), _dec10 = (0, _classValidator.IsOptional)(), _dec11 = (0, _classValidator.IsNumber)(), _dec12 = (0, _validators.CannotUseWith)("DATABASE_URL"), _dec13 = (0, _classValidator.IsOptional)(), _dec14 = (0, _validators.CannotUseWith)("DATABASE_URL"), _dec15 = (0, _classValidator.IsOptional)(), _dec16 = (0, _validators.CannotUseWith)("DATABASE_URL"), _dec17 = (0, _classValidator.IsOptional)(), _dec18 = (0, _validators.CannotUseWith)("DATABASE_URL"), _dec19 = (0, _classValidator.IsOptional)(), _dec20 = (0, _classValidator.IsOptional)(), _dec21 = (0, _validators.IsDatabaseUrl)(), _dec22 = (0, _classValidator.IsNumber)(), _dec23 = (0, _classValidator.IsOptional)(), _dec24 = (0, _classValidator.IsNumber)(), _dec25 = (0, _classValidator.IsOptional)(), _dec26 = (0, _classValidator.IsIn)(["disable", "allow", "require", "prefer", "verify-ca", "verify-full"]), _dec27 = (0, _classValidator.IsOptional)(), _dec28 = (0, _classValidator.IsNotEmpty)(), _dec29 = (0, _classValidator.IsNumber)(), _dec30 = (0, _classValidator.Min)(1000), _dec31 = (0, _classValidator.IsNumber)(), _dec32 = (0, _classValidator.Min)(100), _dec33 = (0, _classValidator.IsNotEmpty)(), _dec34 = (0, _classValidator.IsUrl)({
  protocols: ["http", "https"],
  require_protocol: true,
  require_tld: false
}), _dec35 = (0, _classValidator.IsOptional)(), _dec36 = (0, _classValidator.IsUrl)({
  protocols: ["http", "https"],
  require_protocol: true,
  require_tld: false
}), _dec37 = (0, _classValidator.IsUrl)({
  require_tld: false,
  require_protocol: true,
  protocols: ["http", "https", "ws", "wss"]
}), _dec38 = (0, _classValidator.IsOptional)(), _dec39 = (0, _classValidator.IsOptional)(), _dec40 = (0, _classValidator.IsNumber)(), _dec41 = (0, _classValidator.IsNumber)(), _dec42 = (0, _classValidator.IsOptional)(), _dec43 = (0, _classValidator.IsIn)(["error", "warn", "info", "http", "verbose", "debug", "silly"]), _dec44 = (0, _classValidator.IsNumber)(), _dec45 = (0, _classValidator.IsOptional)(), _dec46 = (0, _classValidator.IsNumber)(), _dec47 = (0, _classValidator.IsOptional)(), _dec48 = (0, _classValidator.IsOptional)(), _dec49 = (0, _validators.CannotUseWithout)("SSL_CERT"), _dec50 = (0, _classValidator.IsOptional)(), _dec51 = (0, _validators.CannotUseWithout)("SSL_KEY"), _dec52 = (0, _classValidator.IsIn)(_i18n.languages), _dec53 = (0, _classValidator.IsBoolean)(), _dec54 = (0, _classValidator.IsOptional)(), _dec55 = (0, _classValidator.IsBoolean)(), _dec56 = (0, _classValidator.IsBoolean)(), _dec57 = (0, _validators.CannotUseWith)("SMTP_SERVICE"), _dec58 = (0, _validators.CannotUseWith)("SMTP_HOST"), _dec59 = (0, _validators.IsInCaseInsensitive)(Object.keys(_services.default)), _dec60 = (0, _classValidator.IsNumber)(), _dec61 = (0, _classValidator.IsOptional)(), _dec62 = (0, _validators.CannotUseWith)("SMTP_SERVICE"), _dec63 = (0, _validators.IsMailboxAddress)(), _dec64 = (0, _classValidator.IsOptional)(), _dec65 = (0, _validators.IsMailboxAddress)(), _dec66 = (0, _classValidator.IsOptional)(), _dec67 = (0, _classValidator.IsOptional)(), _dec68 = (0, _classValidator.IsUrl)(), _dec69 = (0, _classValidator.IsOptional)(), _dec70 = (0, _classValidator.IsUrl)(), _dec71 = (0, _classValidator.IsOptional)(), _dec72 = (0, _classValidator.IsOptional)(), _dec73 = (0, _classValidator.IsOptional)(), _dec74 = (0, _classValidator.IsNumber)(), _dec75 = (0, _classValidator.IsOptional)(), _dec76 = (0, _classValidator.IsNumber)(), _dec77 = (0, _classValidator.IsOptional)(), _dec78 = (0, _classValidator.IsBoolean)(), _dec79 = (0, _classValidator.IsOptional)(), _dec80 = (0, _classValidator.IsNumber)(), _dec81 = (0, _validators.CannotUseWithout)("RATE_LIMITER_ENABLED"), _dec82 = (0, _classValidator.IsOptional)(), _dec83 = (0, _classValidator.IsNumber)(), _dec84 = (0, _classValidator.IsOptional)(), _dec85 = (0, _classValidator.IsNumber)(), _dec86 = (0, _validators.CannotUseWithout)("RATE_LIMITER_ENABLED"), _dec87 = (0, _classValidator.IsOptional)(), _dec88 = (0, _classValidator.IsNumber)(), _dec89 = (0, _classValidator.Min)(0), _dec90 = (0, _validators.CannotUseWithout)("RATE_LIMITER_ENABLED"), _dec91 = (0, _classValidator.IsOptional)(), _dec92 = (0, _classValidator.IsNumber)(), _dec93 = (0, _Deprecated.default)("Use FILE_STORAGE_UPLOAD_MAX_SIZE instead"), _dec94 = (0, _classValidator.IsOptional)(), _dec95 = (0, _classValidator.IsOptional)(), _dec96 = (0, _validators.CannotUseWithout)("AWS_ACCESS_KEY_ID"), _dec97 = (0, _classValidator.IsOptional)(), _dec98 = (0, _classValidator.IsOptional)(), _dec99 = (0, _classValidator.IsOptional)(), _dec100 = (0, _classValidator.IsOptional)(), _dec101 = (0, _classValidator.IsOptional)(), _dec102 = (0, _classValidator.IsOptional)(), _dec103 = (0, _classValidator.IsOptional)(), _dec104 = (0, _classValidator.IsOptional)(), _dec105 = (0, _classValidator.IsOptional)(), _dec106 = (0, _classValidator.IsIn)(["put", "post"]), _dec107 = (0, _classValidator.IsIn)(["local", "s3"]), _dec108 = (0, _classValidator.IsNumber)(), _dec109 = (0, _classValidator.IsNumber)(), _dec110 = (0, _classValidator.IsNumber)(), _dec111 = (0, _classValidator.IsNumber)(), _dec112 = (0, _classValidator.IsOptional)(), _dec113 = (0, _classValidator.IsNumber)(), _dec114 = (0, _Deprecated.default)("Use FILE_STORAGE_IMPORT_MAX_SIZE instead"), _dec115 = (0, _classValidator.IsNumber)(), _dec116 = (0, _classValidator.IsNumber)(), _dec117 = (0, _classValidator.IsNumber)(), _dec118 = (0, _classValidator.IsNumber)(), _dec119 = (0, _classValidator.IsBoolean)(), _dec120 = (0, _classValidator.IsBoolean)(), _dec121 = (0, _classValidator.IsNumber)(), _dec122 = (0, _classValidator.IsOptional)(), _dec123 = (0, _classValidator.IsNumber)(), _dec124 = (0, _classValidator.IsOptional)(), _dec125 = (0, _classValidator.IsOptional)(), _dec126 = (0, _classValidator.IsOptional)(), _dec127 = (0, _classValidator.IsOptional)(), _dec128 = (0, _classValidator.IsNumber)(), _dec129 = (0, _classValidator.IsOptional)(), _dec130 = (0, _classValidator.IsNumber)(), _dec131 = (0, _classValidator.IsOptional)(), _dec132 = (0, _classValidator.IsNumber)(), _class = class Environment {
  constructor() {
    /**
     * The current environment name.
     */
    _initializerDefineProperty(this, "ENVIRONMENT", _descriptor, this);
    /**
     * The secret key is used for encrypting data. Do not change this value once
     * set or your users will be unable to login.
     */
    _initializerDefineProperty(this, "SECRET_KEY", _descriptor2, this);
    /**
     * The secret that should be passed to the cron utility endpoint to enable
     * triggering of scheduled tasks.
     */
    _initializerDefineProperty(this, "UTILS_SECRET", _descriptor3, this);
    /**
     * The url of the database.
     */
    _initializerDefineProperty(this, "DATABASE_URL", _descriptor4, this);
    /**
     * Optional database URL for read replica to distribute read queries
     * and reduce load on primary database.
     */
    _initializerDefineProperty(this, "DATABASE_READ_ONLY_URL", _descriptor5, this);
    /**
     * Database host for individual component configuration.
     */
    _initializerDefineProperty(this, "DATABASE_HOST", _descriptor6, this);
    /**
     * Database port for individual component configuration.
     */
    _initializerDefineProperty(this, "DATABASE_PORT", _descriptor7, this);
    /**
     * Database name for individual component configuration.
     */
    _initializerDefineProperty(this, "DATABASE_NAME", _descriptor8, this);
    /**
     * Database user for individual component configuration.
     */
    _initializerDefineProperty(this, "DATABASE_USER", _descriptor9, this);
    /**
     * Database password for individual component configuration.
     */
    _initializerDefineProperty(this, "DATABASE_PASSWORD", _descriptor0, this);
    /**
     * An optional database schema.
     */
    _initializerDefineProperty(this, "DATABASE_SCHEMA", _descriptor1, this);
    /**
     * The url of the database pool.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_URL", _descriptor10, this);
    /**
     * Database connection pool configuration.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_MIN", _descriptor11, this);
    /**
     * Database connection pool configuration.
     */
    _initializerDefineProperty(this, "DATABASE_CONNECTION_POOL_MAX", _descriptor12, this);
    /**
     * Set to "disable" to disable SSL connection to the database. This option is
     * passed through to Postgres. See:
     *
     * https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNECT-SSLMODE
     */
    _initializerDefineProperty(this, "PGSSLMODE", _descriptor13, this);
    /**
     * The url of redis. Note that redis does not have a database after the port.
     * Note: More extensive validation isn't included here due to our support for
     * base64-encoded configuration.
     */
    _initializerDefineProperty(this, "REDIS_URL", _descriptor14, this);
    /**
     * The url of redis for horizontally scaling the collaboration service. If not
     * set then the collaboration service must be ran as a singleton.
     */
    _defineProperty(this, "REDIS_COLLABORATION_URL", _environment.default.REDIS_COLLABORATION_URL);
    /**
     * The interval in milliseconds between redis connection healthchecks. Each
     * healthcheck issues a PING and forces a reconnect if it fails.
     */
    _initializerDefineProperty(this, "REDIS_HEALTHCHECK_INTERVAL", _descriptor15, this);
    /**
     * The timeout in milliseconds for a redis healthcheck PING before the
     * connection is considered stuck and forcibly reconnected.
     */
    _initializerDefineProperty(this, "REDIS_HEALTHCHECK_TIMEOUT", _descriptor16, this);
    /**
     * The fully qualified, external facing domain name of the server.
     * If not set, will be derived from HEROKU_APP_NAME for Heroku deployments.
     */
    _initializerDefineProperty(this, "URL", _descriptor17, this);
    /**
     * If using a Cloudfront/Cloudflare distribution or similar it can be set below.
     * This will cause paths to javascript, stylesheets, and images to be updated to
     * the hostname defined in CDN_URL. In your CDN configuration the origin server
     * should be set to the same as URL.
     */
    _initializerDefineProperty(this, "CDN_URL", _descriptor18, this);
    /**
     * The fully qualified, external facing domain name of the collaboration
     * service, if different (unlikely)
     */
    _initializerDefineProperty(this, "COLLABORATION_URL", _descriptor19, this);
    /**
     * The maximum number of network clients that can be connected to a single
     * document at once. Defaults to 100.
     */
    _initializerDefineProperty(this, "COLLABORATION_MAX_CLIENTS_PER_DOCUMENT", _descriptor20, this);
    /**
     * The port that the server will listen on, defaults to 3000.
     */
    _initializerDefineProperty(this, "PORT", _descriptor21, this);
    /**
     * Optional extra debugging. Comma separated
     */
    _defineProperty(this, "DEBUG", _environment.default.DEBUG || "");
    /**
     * Configure lowest severity level for server logs
     */
    _initializerDefineProperty(this, "LOG_LEVEL", _descriptor22, this);
    /**
     * How many processes should be spawned. As a reasonable rule divide your
     * server's available memory by 512 for a rough estimate
     */
    _initializerDefineProperty(this, "WEB_CONCURRENCY", _descriptor23, this);
    /**
     * How long a request should be processed before giving up and returning an
     * error response to the client, defaults to 10s
     */
    _initializerDefineProperty(this, "REQUEST_TIMEOUT", _descriptor24, this);
    /**
     * Base64 encoded protected key if Outline is to perform SSL termination.
     */
    _initializerDefineProperty(this, "SSL_KEY", _descriptor25, this);
    /**
     * Base64 encoded public certificate if Outline is to perform SSL termination.
     */
    _initializerDefineProperty(this, "SSL_CERT", _descriptor26, this);
    /**
     * The default interface language. See translate.getoutline.com for a list of
     * available language codes and their percentage translated.
     */
    _initializerDefineProperty(this, "DEFAULT_LANGUAGE", _descriptor27, this);
    /**
     * A comma list of which services should be enabled on this instance – defaults to all.
     *
     * If a services flag is passed it takes priority over the environment variable
     * for example: --services=web,worker
     */
    _defineProperty(this, "SERVICES", (0, _compat.uniq)(((0, _args.getArg)("services") ?? _environment.default.SERVICES ?? "collaboration,websockets,worker,web").split(",").map(service => service.toLowerCase().trim())));
    /**
     * Auto-redirect to https in production. The default is true but you may set
     * to false if you can be sure that SSL is terminated at an external
     * loadbalancer.
     */
    _initializerDefineProperty(this, "FORCE_HTTPS", _descriptor28, this);
    /**
     * When the app is behind a proxy, sets the HTTP header used for the client IP.
     * The default value is "X-Forwarded-For", common values are "X-Real-IP"
     * and "X-Client-IP".
     */
    _initializerDefineProperty(this, "PROXY_IP_HEADER", _descriptor29, this);
    /**
     * Whether to trust the X-Forwarded-* headers (e.g. X-Forwarded-For,
     * X-Forwarded-Proto) set by an upstream proxy or load balancer. Defaults to
     * true for backwards compat. Set to false if not running behind a proxy in production.
     */
    _initializerDefineProperty(this, "PROXY_HEADERS_TRUSTED", _descriptor30, this);
    /**
     * Should the installation send anonymized statistics to the maintainers.
     * Defaults to true.
     */
    _initializerDefineProperty(this, "TELEMETRY", _descriptor31, this);
    // Third-party services
    /**
     * The host of your SMTP server for enabling emails.
     */
    _initializerDefineProperty(this, "SMTP_HOST", _descriptor32, this);
    /**
     * The service name of a well-known SMTP service for nodemailer.
     * See https://community.nodemailer.com/2-0-0-beta/setup-smtp/well-known-services/
     */
    _initializerDefineProperty(this, "SMTP_SERVICE", _descriptor33, this);
    _initializerDefineProperty(this, "EMAIL_ENABLED", _descriptor34, this);
    /**
     * Optional hostname of the client, used for identifying to the server
     * defaults to hostname of the machine.
     */
    _defineProperty(this, "SMTP_NAME", _environment.default.SMTP_NAME);
    /**
     * The port of your SMTP server.
     */
    _initializerDefineProperty(this, "SMTP_PORT", _descriptor35, this);
    /**
     * The username of your SMTP server, if any.
     */
    _defineProperty(this, "SMTP_USERNAME", _environment.default.SMTP_USERNAME);
    /**
     * The password for the SMTP username, if any.
     */
    _defineProperty(this, "SMTP_PASSWORD", _environment.default.SMTP_PASSWORD);
    /**
     * The email address from which emails are sent.
     */
    _initializerDefineProperty(this, "SMTP_FROM_EMAIL", _descriptor36, this);
    /**
     * The reply-to address for emails sent from Outline. If unset the from
     * address is used by default.
     */
    _initializerDefineProperty(this, "SMTP_REPLY_EMAIL", _descriptor37, this);
    /**
     * Override the cipher used for SMTP SSL connections.
     */
    _defineProperty(this, "SMTP_TLS_CIPHERS", this.toOptionalString(_environment.default.SMTP_TLS_CIPHERS));
    /**
     * If true (the default) the connection will use TLS when connecting to server.
     * If false then TLS is used only if server supports the STARTTLS extension.
     *
     * Setting secure to false therefore does not mean that you would not use an
     * encrypted connection.
     */
    _defineProperty(this, "SMTP_SECURE", this.toBoolean(_environment.default.SMTP_SECURE ?? "true"));
    /**
     * If true then STARTTLS is disabled even if the server supports it.
     * If false (the default) then STARTTLS is used if server supports it.
     *
     * Setting secure to false therefore does not mean that you would not use an
     * encrypted connection.
     */
    _defineProperty(this, "SMTP_DISABLE_STARTTLS", this.toBoolean(_environment.default.SMTP_DISABLE_STARTTLS ?? "false"));
    /**
     * Dropbox app key for embedding Dropbox files
     */
    _initializerDefineProperty(this, "DROPBOX_APP_KEY", _descriptor38, this);
    /**
     * Sentry DSN for capturing errors and frontend performance.
     */
    _initializerDefineProperty(this, "SENTRY_DSN", _descriptor39, this);
    /**
     * Sentry tunnel URL for bypassing ad blockers
     */
    _initializerDefineProperty(this, "SENTRY_TUNNEL", _descriptor40, this);
    /**
     * A release SHA or other identifier for Sentry.
     */
    _defineProperty(this, "RELEASE", this.toOptionalString(_environment.default.RELEASE));
    /**
     * A Google Analytics tracking ID, supports v3 or v4 properties.
     */
    _initializerDefineProperty(this, "GOOGLE_ANALYTICS_ID", _descriptor41, this);
    /**
     * A DataDog API key for tracking server metrics.
     */
    _defineProperty(this, "DD_API_KEY", _environment.default.DD_API_KEY);
    /**
     * The name of the service to use in DataDog.
     */
    _defineProperty(this, "DD_SERVICE", _environment.default.DD_SERVICE ?? "outline");
    /**
     * A string representing the version of the software.
     *
     * SOURCE_COMMIT is used by Docker Hub
     * SOURCE_VERSION is used by Heroku
     */
    _initializerDefineProperty(this, "VERSION", _descriptor42, this);
    /**
     * The maximum number of concurrent events processed per-worker. To get total
     * concurrency you should multiply this by the number of workers.
     */
    _initializerDefineProperty(this, "WORKER_CONCURRENCY_EVENTS", _descriptor43, this);
    /**
     * The maximum number of concurrent tasks processed per-worker. To get total
     * concurrency you should multiply this by the number of workers.
     */
    _initializerDefineProperty(this, "WORKER_CONCURRENCY_TASKS", _descriptor44, this);
    /**
     * A boolean switch to toggle the rate limiter at application web server.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_ENABLED", _descriptor45, this);
    /**
     * Set max allowed requests in a given duration for default rate limiter to
     * trigger throttling, per IP address.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_REQUESTS", _descriptor46, this);
    /**
     * Set max allowed realtime connections before throttling. Defaults to 50
     * requests/ip/duration window.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_COLLABORATION_REQUESTS", _descriptor47, this);
    /**
     * Set fixed duration window(in secs) for default rate limiter, elapsing which
     * the request quota is reset (the bucket is refilled with tokens).
     */
    _initializerDefineProperty(this, "RATE_LIMITER_DURATION_WINDOW", _descriptor48, this);
    /**
     * Multiplier applied to the per-endpoint API rate limits. Allows operators to
     * uniformly scale the hard-coded route-level limits up or down without
     * touching code. A value of 1 (the default) preserves the built-in limits.
     * Effective per-endpoint limits are scaled by this value, rounded to the
     * nearest integer, and clamped to a minimum of 1.
     */
    _initializerDefineProperty(this, "RATE_LIMITER_MULTIPLIER", _descriptor49, this);
    /**
     * Set max allowed upload size for file attachments.
     * @deprecated Use FILE_STORAGE_UPLOAD_MAX_SIZE instead
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_MAX_SIZE", _descriptor50, this);
    /**
     * Access key ID for AWS S3.
     */
    _initializerDefineProperty(this, "AWS_ACCESS_KEY_ID", _descriptor51, this);
    /**
     * Secret key for AWS S3.
     */
    _initializerDefineProperty(this, "AWS_SECRET_ACCESS_KEY", _descriptor52, this);
    /**
     * The name of the AWS S3 region to use.
     */
    _initializerDefineProperty(this, "AWS_REGION", _descriptor53, this);
    /**
     * Optional AWS S3 endpoint URL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_ACCELERATE_URL", _descriptor54, this);
    /**
     * Optional CloudFront distribution URL for serving attachment downloads.
     * Uploads continue to use the S3 endpoint directly. When set together with
     * AWS_CLOUDFRONT_KEY_PAIR_ID and a private key, signed CloudFront URLs are
     * used for downloads. If signing credentials are missing, S3 presigned URLs
     * are used instead.
     * Example: https://d1a2b3c4d5e6f.cloudfront.net (no trailing slash)
     */
    _initializerDefineProperty(this, "AWS_CLOUDFRONT_URL", _descriptor55, this);
    /**
     * CloudFront key pair ID for signed download URLs. Required together with a
     * private key when AWS_CLOUDFRONT_URL is set.
     */
    _initializerDefineProperty(this, "AWS_CLOUDFRONT_KEY_PAIR_ID", _descriptor56, this);
    /**
     * PEM-encoded RSA private key for CloudFront signed URLs, or a base64-encoded
     * PEM string on a single line. Use a YAML block scalar in docker-compose for
     * multi-line PEM values.
     */
    _initializerDefineProperty(this, "AWS_CLOUDFRONT_PRIVATE_KEY", _descriptor57, this);
    /**
     * Optional AWS S3 endpoint URL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_BUCKET_URL", _descriptor58, this);
    /**
     * The bucket name to store file attachments in.
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_BUCKET_NAME", _descriptor59, this);
    /**
     * Whether to force path style URLs for S3 objects, this is required for some
     * S3-compatible storage providers.
     */
    _initializerDefineProperty(this, "AWS_S3_FORCE_PATH_STYLE", _descriptor60, this);
    /**
     * Set default AWS S3 ACL for file attachments.
     */
    _initializerDefineProperty(this, "AWS_S3_ACL", _descriptor61, this);
    /**
     * Which HTTP method to use for presigned uploads to S3-compatible storage.
     * "post" uses multipart form upload (traditional S3 presigned POST).
     * "put" uses a single PUT request with a presigned URL (required for
     * providers like Cloudflare R2 that do not support presigned POST).
     */
    _initializerDefineProperty(this, "AWS_S3_UPLOAD_METHOD", _descriptor62, this);
    /**
     * Which file storage system to use
     */
    _initializerDefineProperty(this, "FILE_STORAGE", _descriptor63, this);
    /**
     * Set default root dir path for local file storage
     */
    _defineProperty(this, "FILE_STORAGE_LOCAL_ROOT_DIR", this.toOptionalString(_environment.default.FILE_STORAGE_LOCAL_ROOT_DIR) ?? "/var/lib/outline/data");
    /**
     * Set max allowed upload size for file attachments.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_UPLOAD_MAX_SIZE", _descriptor64, this);
    /**
     * Set max allowed upload size for document imports.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_IMPORT_MAX_SIZE", _descriptor65, this);
    /**
     * Timeout in milliseconds for downloading files from remote locations to file storage.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_IMPORT_TIMEOUT", _descriptor66, this);
    /**
     * Set max allowed upload size for imports at workspace level.
     */
    _initializerDefineProperty(this, "FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE", _descriptor67, this);
    /**
     * Because imports can be much larger than regular file attachments and are
     * deleted automatically we allow an optional separate limit on the size of
     * imports.
     *
     * @deprecated Use `FILE_STORAGE_IMPORT_MAX_SIZE` or `FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE` instead
     */
    _initializerDefineProperty(this, "MAXIMUM_IMPORT_SIZE", _descriptor68, this);
    /**
     * Limit on export size in bytes. Defaults to the total memory available to
     * the container.
     */
    _initializerDefineProperty(this, "MAXIMUM_EXPORT_SIZE", _descriptor69, this);
    /**
     * The number of seconds access tokens issue by the OAuth provider are valid.
     */
    _initializerDefineProperty(this, "OAUTH_PROVIDER_ACCESS_TOKEN_LIFETIME", _descriptor70, this);
    /**
     * The number of seconds refresh tokens issue by the OAuth provider are valid.
     */
    _initializerDefineProperty(this, "OAUTH_PROVIDER_REFRESH_TOKEN_LIFETIME", _descriptor71, this);
    /**
     * The number of seconds authorization codes issue by the OAuth provider are valid.
     */
    _initializerDefineProperty(this, "OAUTH_PROVIDER_AUTHORIZATION_CODE_LIFETIME", _descriptor72, this);
    /**
     * Whether to disable OAuth Dynamic Client Registration (DCR). When set to
     * true, the POST /oauth/register endpoint will be unavailable.
     */
    _initializerDefineProperty(this, "OAUTH_DISABLE_DCR", _descriptor73, this);
    /**
     * Enable unsafe-inline in script-src CSP directive
     */
    _initializerDefineProperty(this, "DEVELOPMENT_UNSAFE_INLINE_CSP", _descriptor74, this);
    /**
     * Time window in seconds to analyze webhook failures for disabling decision.
     * Defaults to 86400 seconds (24 hours).
     */
    _initializerDefineProperty(this, "WEBHOOK_FAILURE_TIME_WINDOW", _descriptor75, this);
    /**
     * Percentage threshold of failures within the time window that triggers
     * webhook disabling. Defaults to 80%.
     */
    _initializerDefineProperty(this, "WEBHOOK_FAILURE_RATE_THRESHOLD", _descriptor76, this);
    /**
     * Comma-separated list of IP addresses or CIDR ranges that are allowed to be accessed
     * even if they are private IP addresses. This is useful for allowing
     * connections to OIDC providers or webhooks on private networks.
     * Supports both individual IP addresses and CIDR notation.
     * Example: "10.0.0.1,192.168.1.0/24,172.16.0.1"
     */
    _initializerDefineProperty(this, "ALLOWED_PRIVATE_IP_ADDRESSES", _descriptor77, this);
    /**
     * The search provider to use. Defaults to "postgres" which uses PostgreSQL
     * full-text search. Alternative providers can be registered via plugins.
     */
    _initializerDefineProperty(this, "SEARCH_PROVIDER", _descriptor78, this);
    /**
     * The product name
     */
    _initializerDefineProperty(this, "APP_NAME", _descriptor79, this);
    /**
     * Gravity constant for time decay in popularity scoring. Higher values cause
     * faster decay of older content. Default is 0.7.
     */
    _initializerDefineProperty(this, "POPULARITY_GRAVITY", _descriptor80, this);
    /**
     * Number of weeks of activity to consider when calculating popularity scores.
     * Default is 2 weeks.
     */
    _initializerDefineProperty(this, "POPULARITY_ACTIVITY_THRESHOLD_WEEKS", _descriptor81, this);
    /**
     * Interval in hours at which popularity scores are recalculated.
     * Default is 12 hours.
     */
    _initializerDefineProperty(this, "POPULARITY_UPDATE_INTERVAL_HOURS", _descriptor82, this);
    process.nextTick(() => {
      void (0, _classValidator.validate)(this).then(errors => {
        if (errors.length > 0) {
          let output = "Environment configuration is invalid, please check the following:\n\n";
          output += errors.map(error => "- " + Object.values(error.constraints ?? {}).join(", "));
          console.warn(output);
          process.exit(1);
        }
      });
    });
    _Public.PublicEnvironmentRegister.registerEnv(this);
  }

  /**
   * Returns an object consisting of env vars annotated with `@Public` decorator
   */
  get public() {
    return _Public.PublicEnvironmentRegister.getEnv();
  }
  /**
   * Returns true if the current installation is the cloud hosted version at
   * getoutline.com
   */
  get isCloudHosted() {
    return ["https://app.getoutline.com", "https://app.outline.dev", "https://app.outline.dev:3000"].includes(this.URL);
  }

  /**
   * Returns true if the current installation is running in production.
   */
  get isProduction() {
    return this.ENVIRONMENT === "production";
  }

  /**
   * Returns true if the current installation is running in the development environment.
   */
  get isDevelopment() {
    return this.ENVIRONMENT === "development";
  }

  /**
   * Returns true if the current installation is running in a test environment.
   */
  get isTest() {
    return this.ENVIRONMENT === "test";
  }
  toOptionalString(value) {
    return value ? value : undefined;
  }
  toOptionalCommaList(value) {
    return value ? value.split(",").map(item => item.trim()) : undefined;
  }
  toOptionalNumber(value) {
    return value ? parseInt(value, 10) : undefined;
  }
  toOptionalFloat(value) {
    return value ? parseFloat(value) : undefined;
  }

  /**
   * Convert a string to a boolean. Supports the following:
   *
   * 0 = false
   * 1 = true
   * "true" = true
   * "false" = false
   * "" = false
   *
   * @param value The string to convert
   * @returns A boolean
   */
  toBoolean(value) {
    try {
      return value ? !!JSON.parse(value) : false;
    } catch (_err) {
      throw new Error(`"${value}" could not be parsed as a boolean, must be "true" or "false"`);
    }
  }

  /**
   * Convert a string to an optional boolean. Supports the following:
   *
   * 0 = false
   * 1 = true
   * "true" = true
   * "false" = false
   * "" = undefined
   *
   * @param value The string to convert
   * @returns A boolean or undefined
   */
  toOptionalBoolean(value) {
    try {
      return value ? !!JSON.parse(value) : undefined;
    } catch (_err) {
      return undefined;
    }
  }
}, _descriptor = _applyDecoratedDescriptor(_class.prototype, "ENVIRONMENT", [_Public.Public, _dec], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.NODE_ENV ?? "production";
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "SECRET_KEY", [_dec2, _dec3], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.SECRET_KEY ?? "";
  }
}), _descriptor3 = _applyDecoratedDescriptor(_class.prototype, "UTILS_SECRET", [_dec4], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.UTILS_SECRET ?? "";
  }
}), _descriptor4 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_URL", [_dec5, _dec6, _dec7], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_URL);
  }
}), _descriptor5 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_READ_ONLY_URL", [_dec8, _dec9], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(
    // Support deprecated variable name for backwards compatibility
    _environment.default.DATABASE_READ_ONLY_URL ?? _environment.default.DATABASE_URL_READ_ONLY);
  }
}), _descriptor6 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_HOST", [_dec0, _dec1], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_HOST);
  }
}), _descriptor7 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_PORT", [_dec10, _dec11, _dec12], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.DATABASE_PORT);
  }
}), _descriptor8 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_NAME", [_dec13, _dec14], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_NAME);
  }
}), _descriptor9 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_USER", [_dec15, _dec16], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_USER);
  }
}), _descriptor0 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_PASSWORD", [_dec17, _dec18], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_PASSWORD);
  }
}), _descriptor1 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_SCHEMA", [_dec19], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_SCHEMA);
  }
}), _descriptor10 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_URL", [_dec20, _dec21], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DATABASE_CONNECTION_POOL_URL);
  }
}), _descriptor11 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_MIN", [_dec22, _dec23], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.DATABASE_CONNECTION_POOL_MIN);
  }
}), _descriptor12 = _applyDecoratedDescriptor(_class.prototype, "DATABASE_CONNECTION_POOL_MAX", [_dec24, _dec25], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.DATABASE_CONNECTION_POOL_MAX);
  }
}), _descriptor13 = _applyDecoratedDescriptor(_class.prototype, "PGSSLMODE", [_dec26, _dec27], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.PGSSLMODE;
  }
}), _descriptor14 = _applyDecoratedDescriptor(_class.prototype, "REDIS_URL", [_dec28], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.REDIS_URL;
  }
}), _descriptor15 = _applyDecoratedDescriptor(_class.prototype, "REDIS_HEALTHCHECK_INTERVAL", [_dec29, _dec30], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return parseInt(_environment.default.REDIS_HEALTHCHECK_INTERVAL || "30000", 10);
  }
}), _descriptor16 = _applyDecoratedDescriptor(_class.prototype, "REDIS_HEALTHCHECK_TIMEOUT", [_dec31, _dec32], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return parseInt(_environment.default.REDIS_HEALTHCHECK_TIMEOUT || "5000", 10);
  }
}), _descriptor17 = _applyDecoratedDescriptor(_class.prototype, "URL", [_Public.Public, _dec33, _dec34], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return (_environment.default.URL ?? (_environment.default.HEROKU_APP_NAME ? `https://${_environment.default.HEROKU_APP_NAME}.herokuapp.com` : "")).replace(/\/$/, "");
  }
}), _descriptor18 = _applyDecoratedDescriptor(_class.prototype, "CDN_URL", [_Public.Public, _dec35, _dec36], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.CDN_URL ? _environment.default.CDN_URL.replace(/\/$/, "") : undefined);
  }
}), _descriptor19 = _applyDecoratedDescriptor(_class.prototype, "COLLABORATION_URL", [_Public.Public, _dec37, _dec38], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return (_environment.default.COLLABORATION_URL || this.URL).replace(/\/$/, "").replace(/^http/, "ws");
  }
}), _descriptor20 = _applyDecoratedDescriptor(_class.prototype, "COLLABORATION_MAX_CLIENTS_PER_DOCUMENT", [_dec39, _dec40], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return parseInt(_environment.default.COLLABORATION_MAX_CLIENTS_PER_DOCUMENT || "100", 10);
  }
}), _descriptor21 = _applyDecoratedDescriptor(_class.prototype, "PORT", [_dec41, _dec42], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.PORT) ?? 3000;
  }
}), _descriptor22 = _applyDecoratedDescriptor(_class.prototype, "LOG_LEVEL", [_dec43], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.LOG_LEVEL || "info";
  }
}), _descriptor23 = _applyDecoratedDescriptor(_class.prototype, "WEB_CONCURRENCY", [_dec44, _dec45], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WEB_CONCURRENCY);
  }
}), _descriptor24 = _applyDecoratedDescriptor(_class.prototype, "REQUEST_TIMEOUT", [_dec46, _dec47], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.REQUEST_TIMEOUT) ?? 10 * 1000;
  }
}), _descriptor25 = _applyDecoratedDescriptor(_class.prototype, "SSL_KEY", [_dec48, _dec49], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SSL_KEY);
  }
}), _descriptor26 = _applyDecoratedDescriptor(_class.prototype, "SSL_CERT", [_dec50, _dec51], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SSL_CERT);
  }
}), _descriptor27 = _applyDecoratedDescriptor(_class.prototype, "DEFAULT_LANGUAGE", [_Public.Public, _dec52], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.DEFAULT_LANGUAGE ?? "en_US";
  }
}), _descriptor28 = _applyDecoratedDescriptor(_class.prototype, "FORCE_HTTPS", [_dec53], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.FORCE_HTTPS ?? "true");
  }
}), _descriptor29 = _applyDecoratedDescriptor(_class.prototype, "PROXY_IP_HEADER", [_dec54], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.PROXY_IP_HEADER);
  }
}), _descriptor30 = _applyDecoratedDescriptor(_class.prototype, "PROXY_HEADERS_TRUSTED", [_dec55], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.PROXY_HEADERS_TRUSTED ?? "true");
  }
}), _descriptor31 = _applyDecoratedDescriptor(_class.prototype, "TELEMETRY", [_dec56], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.ENABLE_UPDATES ?? _environment.default.TELEMETRY ?? "true");
  }
}), _descriptor32 = _applyDecoratedDescriptor(_class.prototype, "SMTP_HOST", [_dec57], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_HOST);
  }
}), _descriptor33 = _applyDecoratedDescriptor(_class.prototype, "SMTP_SERVICE", [_dec58, _dec59], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_SERVICE);
  }
}), _descriptor34 = _applyDecoratedDescriptor(_class.prototype, "EMAIL_ENABLED", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return !!(this.SMTP_HOST || this.SMTP_SERVICE) || this.isDevelopment;
  }
}), _descriptor35 = _applyDecoratedDescriptor(_class.prototype, "SMTP_PORT", [_dec60, _dec61, _dec62], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.SMTP_PORT);
  }
}), _descriptor36 = _applyDecoratedDescriptor(_class.prototype, "SMTP_FROM_EMAIL", [_dec63, _dec64], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_FROM_EMAIL);
  }
}), _descriptor37 = _applyDecoratedDescriptor(_class.prototype, "SMTP_REPLY_EMAIL", [_dec65, _dec66], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SMTP_REPLY_EMAIL);
  }
}), _descriptor38 = _applyDecoratedDescriptor(_class.prototype, "DROPBOX_APP_KEY", [_Public.Public, _dec67], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.DROPBOX_APP_KEY);
  }
}), _descriptor39 = _applyDecoratedDescriptor(_class.prototype, "SENTRY_DSN", [_Public.Public, _dec68, _dec69], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SENTRY_DSN);
  }
}), _descriptor40 = _applyDecoratedDescriptor(_class.prototype, "SENTRY_TUNNEL", [_Public.Public, _dec70, _dec71], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SENTRY_TUNNEL);
  }
}), _descriptor41 = _applyDecoratedDescriptor(_class.prototype, "GOOGLE_ANALYTICS_ID", [_Public.Public, _dec72], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.GOOGLE_ANALYTICS_ID);
  }
}), _descriptor42 = _applyDecoratedDescriptor(_class.prototype, "VERSION", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SOURCE_COMMIT || _environment.default.SOURCE_VERSION);
  }
}), _descriptor43 = _applyDecoratedDescriptor(_class.prototype, "WORKER_CONCURRENCY_EVENTS", [_dec73, _dec74], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WORKER_CONCURRENCY_EVENTS) ?? 10;
  }
}), _descriptor44 = _applyDecoratedDescriptor(_class.prototype, "WORKER_CONCURRENCY_TASKS", [_dec75, _dec76], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WORKER_CONCURRENCY_TASKS) ?? 10;
  }
}), _descriptor45 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_ENABLED", [_dec77, _dec78], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.RATE_LIMITER_ENABLED ?? "true");
  }
}), _descriptor46 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_REQUESTS", [_dec79, _dec80, _dec81], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_REQUESTS) ?? 1000;
  }
}), _descriptor47 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_COLLABORATION_REQUESTS", [_dec82, _dec83], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_COLLABORATION_REQUESTS) ?? 50;
  }
}), _descriptor48 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_DURATION_WINDOW", [_dec84, _dec85, _dec86], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.RATE_LIMITER_DURATION_WINDOW) ?? 60;
  }
}), _descriptor49 = _applyDecoratedDescriptor(_class.prototype, "RATE_LIMITER_MULTIPLIER", [_dec87, _dec88, _dec89, _dec90], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalFloat(_environment.default.RATE_LIMITER_MULTIPLIER) ?? 1;
  }
}), _descriptor50 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_MAX_SIZE", [_dec91, _dec92, _dec93], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.AWS_S3_UPLOAD_MAX_SIZE);
  }
}), _descriptor51 = _applyDecoratedDescriptor(_class.prototype, "AWS_ACCESS_KEY_ID", [_dec94], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_ACCESS_KEY_ID);
  }
}), _descriptor52 = _applyDecoratedDescriptor(_class.prototype, "AWS_SECRET_ACCESS_KEY", [_dec95, _dec96], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_SECRET_ACCESS_KEY);
  }
}), _descriptor53 = _applyDecoratedDescriptor(_class.prototype, "AWS_REGION", [_dec97], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_REGION);
  }
}), _descriptor54 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_ACCELERATE_URL", [_Public.Public, _dec98], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_ACCELERATE_URL ?? "";
  }
}), _descriptor55 = _applyDecoratedDescriptor(_class.prototype, "AWS_CLOUDFRONT_URL", [_dec99], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_CLOUDFRONT_URL);
  }
}), _descriptor56 = _applyDecoratedDescriptor(_class.prototype, "AWS_CLOUDFRONT_KEY_PAIR_ID", [_dec100], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_CLOUDFRONT_KEY_PAIR_ID);
  }
}), _descriptor57 = _applyDecoratedDescriptor(_class.prototype, "AWS_CLOUDFRONT_PRIVATE_KEY", [_dec101], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_CLOUDFRONT_PRIVATE_KEY);
  }
}), _descriptor58 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_BUCKET_URL", [_Public.Public, _dec102], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_UPLOAD_BUCKET_URL ?? "";
  }
}), _descriptor59 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_BUCKET_NAME", [_dec103], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_S3_UPLOAD_BUCKET_NAME);
  }
}), _descriptor60 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_FORCE_PATH_STYLE", [_dec104], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.AWS_S3_FORCE_PATH_STYLE ?? "true");
  }
}), _descriptor61 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_ACL", [_dec105], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return _environment.default.AWS_S3_ACL ?? "private";
  }
}), _descriptor62 = _applyDecoratedDescriptor(_class.prototype, "AWS_S3_UPLOAD_METHOD", [_dec106], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.AWS_S3_UPLOAD_METHOD) ?? "post";
  }
}), _descriptor63 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE", [_dec107], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.FILE_STORAGE) ?? "s3";
  }
}), _descriptor64 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_UPLOAD_MAX_SIZE", [_dec108], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.AWS_S3_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor65 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_IMPORT_MAX_SIZE", [_Public.Public, _dec109], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_IMPORT_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE) ?? this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor66 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_IMPORT_TIMEOUT", [_dec110], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_IMPORT_TIMEOUT) ?? 60000;
  }
}), _descriptor67 = _applyDecoratedDescriptor(_class.prototype, "FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE", [_dec111], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.FILE_STORAGE_WORKSPACE_IMPORT_MAX_SIZE) ?? this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE) ?? this.toOptionalNumber(_environment.default.FILE_STORAGE_UPLOAD_MAX_SIZE) ?? 1000000;
  }
}), _descriptor68 = _applyDecoratedDescriptor(_class.prototype, "MAXIMUM_IMPORT_SIZE", [_dec112, _dec113, _dec114], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.MAXIMUM_IMPORT_SIZE);
  }
}), _descriptor69 = _applyDecoratedDescriptor(_class.prototype, "MAXIMUM_EXPORT_SIZE", [_dec115], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.MAXIMUM_EXPORT_SIZE) ?? _nodeOs.default.totalmem();
  }
}), _descriptor70 = _applyDecoratedDescriptor(_class.prototype, "OAUTH_PROVIDER_ACCESS_TOKEN_LIFETIME", [_dec116], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.OAUTH_PROVIDER_ACCESS_TOKEN_LIFETIME) ?? _time.Hour.seconds;
  }
}), _descriptor71 = _applyDecoratedDescriptor(_class.prototype, "OAUTH_PROVIDER_REFRESH_TOKEN_LIFETIME", [_dec117], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.OAUTH_PROVIDER_REFRESH_TOKEN_LIFETIME) ?? 30 * _time.Day.seconds;
  }
}), _descriptor72 = _applyDecoratedDescriptor(_class.prototype, "OAUTH_PROVIDER_AUTHORIZATION_CODE_LIFETIME", [_dec118], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.OAUTH_PROVIDER_AUTHORIZATION_CODE_LIFETIME) ?? 300;
  }
}), _descriptor73 = _applyDecoratedDescriptor(_class.prototype, "OAUTH_DISABLE_DCR", [_dec119], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.OAUTH_DISABLE_DCR ?? "false");
  }
}), _descriptor74 = _applyDecoratedDescriptor(_class.prototype, "DEVELOPMENT_UNSAFE_INLINE_CSP", [_dec120], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toBoolean(_environment.default.DEVELOPMENT_UNSAFE_INLINE_CSP ?? "false");
  }
}), _descriptor75 = _applyDecoratedDescriptor(_class.prototype, "WEBHOOK_FAILURE_TIME_WINDOW", [_dec121, _dec122], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WEBHOOK_FAILURE_TIME_WINDOW) ?? 86400;
  }
}), _descriptor76 = _applyDecoratedDescriptor(_class.prototype, "WEBHOOK_FAILURE_RATE_THRESHOLD", [_dec123, _dec124], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.WEBHOOK_FAILURE_RATE_THRESHOLD) ?? 80;
  }
}), _descriptor77 = _applyDecoratedDescriptor(_class.prototype, "ALLOWED_PRIVATE_IP_ADDRESSES", [_dec125], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalCommaList(_environment.default.ALLOWED_PRIVATE_IP_ADDRESSES);
  }
}), _descriptor78 = _applyDecoratedDescriptor(_class.prototype, "SEARCH_PROVIDER", [_dec126], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalString(_environment.default.SEARCH_PROVIDER) ?? "postgres";
  }
}), _descriptor79 = _applyDecoratedDescriptor(_class.prototype, "APP_NAME", [_Public.Public], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return "Outline";
  }
}), _descriptor80 = _applyDecoratedDescriptor(_class.prototype, "POPULARITY_GRAVITY", [_dec127, _dec128], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.POPULARITY_GRAVITY) ?? 0.7;
  }
}), _descriptor81 = _applyDecoratedDescriptor(_class.prototype, "POPULARITY_ACTIVITY_THRESHOLD_WEEKS", [_dec129, _dec130], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.POPULARITY_ACTIVITY_THRESHOLD_WEEKS) ?? 2;
  }
}), _descriptor82 = _applyDecoratedDescriptor(_class.prototype, "POPULARITY_UPDATE_INTERVAL_HOURS", [_dec131, _dec132], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return this.toOptionalNumber(_environment.default.POPULARITY_UPDATE_INTERVAL_HOURS) ?? 12;
  }
}), _class);
var _default = exports.default = new Environment();