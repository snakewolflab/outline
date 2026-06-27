"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentGroup;
var _externalGroup = _interopRequireDefault(require("./externalGroup"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Presents a group for the API response.
 *
 * @param group - the group to present.
 * @returns the presented group object.
 */
async function presentGroup(group) {
  const externalGroup = group.externalGroups?.[0];
  return {
    id: group.id,
    name: group.name,
    description: group.description,
    externalId: group.externalId,
    memberCount: await group.memberCount,
    disableMentions: group.disableMentions,
    externalGroup: externalGroup ? (0, _externalGroup.default)(externalGroup) : undefined,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt
  };
}