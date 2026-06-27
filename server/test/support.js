"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTestServer = getTestServer;
exports.mockTaskSchedule = mockTaskSchedule;
exports.setSelfHosted = setSelfHosted;
exports.toFormData = toFormData;
exports.withAPIContext = withAPIContext;
var _faker = require("@faker-js/faker");
var _vitest = require("vitest");
var _env = _interopRequireDefault(require("../../shared/env"));
var _context = require("../context");
var _env2 = _interopRequireDefault(require("../env"));
var _onerror = _interopRequireDefault(require("../onerror"));
var _BaseTask = require("../queues/tasks/base/BaseTask");
var _web = _interopRequireDefault(require("../services/web"));
var _database = require("../storage/database");
var _types = require("../types");
var _TestServer = _interopRequireDefault(require("./TestServer"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function getTestServer() {
  const app = (0, _web.default)();
  (0, _onerror.default)(app);
  const server = new _TestServer.default(app);
  const disconnect = async () => {
    await _database.sequelize.close();
    return server.close();
  };
  afterAll(disconnect);
  return server;
}

/**
 * Set the environment to be self hosted.
 */
function setSelfHosted() {
  _env2.default.URL = _env.default.URL = `https://${_faker.faker.internet.domainName()}`;
}

/**
 * Mock scheduling for all task subclasses in the current test file.
 *
 * @returns the schedule mock for assertions.
 */
function mockTaskSchedule() {
  const schedule = _vitest.vi.fn();
  (0, _vitest.beforeEach)(() => {
    schedule.mockReset();
    _vitest.vi.spyOn(_BaseTask.BaseTask.prototype, "schedule").mockImplementation(schedule);
  });
  (0, _vitest.afterEach)(() => {
    _vitest.vi.restoreAllMocks();
  });
  return schedule;
}
function withAPIContext(user, fn) {
  return _database.sequelize.transaction(async transaction => {
    const state = {
      auth: {
        user,
        type: _types.AuthenticationType.APP,
        token: user.getSessionToken()
      },
      transaction
    };
    return fn({
      ...(0, _context.createContext)({
        user,
        transaction
      }),
      state,
      request: {
        ip: _faker.faker.internet.ip()
      }
    });
  });
}

/**
 * Helper function to convert an object to form-urlencoded string.
 * Useful for testing OAuth endpoints that expect application/x-www-form-urlencoded content type.
 *
 * @param obj Object to convert to form-urlencoded string
 * @returns Form-urlencoded string representation of the object
 */
function toFormData(obj) {
  return Object.entries(obj).filter(entry => entry[1] !== undefined && entry[1] !== null).map(_ref => {
    let [key, value] = _ref;
    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }).join("&");
}