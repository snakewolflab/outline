"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentExternalGroup;
/**
 * Presents an ExternalGroup model for API responses.
 *
 * @param externalGroup - the external group to present.
 * @returns a plain object for serialization.
 */
function presentExternalGroup(externalGroup) {
  return {
    id: externalGroup.id,
    externalId: externalGroup.externalId,
    name: externalGroup.name,
    groupId: externalGroup.groupId,
    provider: externalGroup.authenticationProvider?.name,
    displayName: externalGroup.authenticationProvider?.displayName,
    authenticationProviderId: externalGroup.authenticationProviderId,
    lastSyncedAt: externalGroup.lastSyncedAt,
    createdAt: externalGroup.createdAt,
    updatedAt: externalGroup.updatedAt
  };
}