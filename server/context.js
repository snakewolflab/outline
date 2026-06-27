"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createContext = createContext;
var _types = require("./types");
/**
 * Factory to create a new API context.
 */
function createContext(_ref) {
  let {
    user,
    authType = _types.AuthenticationType.APP,
    ip,
    transaction
  } = _ref;
  const auth = {
    user,
    type: authType
  };
  return {
    state: {
      auth,
      transaction
    },
    context: {
      auth,
      ip: ip ?? user?.lastActiveIp,
      transaction
    }
  };
}