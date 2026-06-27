"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentUserPasskey;
function presentUserPasskey(userPasskey) {
  return {
    id: userPasskey.id,
    createdAt: userPasskey.createdAt,
    updatedAt: userPasskey.updatedAt,
    lastActiveAt: userPasskey.lastActiveAt,
    name: userPasskey.name,
    userAgent: userPasskey.userAgent,
    aaguid: userPasskey.aaguid
  };
}