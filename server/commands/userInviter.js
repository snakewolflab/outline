"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = userInviter;
var _compat = require("es-toolkit/compat");
var _types = require("../../shared/types");
var _InviteEmail = _interopRequireDefault(require("../emails/templates/InviteEmail"));
var _env = _interopRequireDefault(require("../env"));
var _Logger = _interopRequireDefault(require("../logging/Logger"));
var _models = require("../models");
var _User = require("../models/User");
var _errors = require("../errors");
var _policies = require("../policies");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
async function userInviter(ctx, _ref) {
  let {
    invites,
    suppressEmail
  } = _ref;
  const {
    user
  } = ctx.state.auth;
  const team = await _models.Team.findByPk(user.teamId, {
    rejectOnEmpty: true
  });

  // filter out empties and obvious non-emails
  const compactedInvites = invites.filter(invite => !!invite.email.trim() && invite.email.match("@"));
  // normalize to lowercase and remove duplicates
  const normalizedInvites = (0, _compat.uniqBy)(compactedInvites.map(invite => ({
    ...invite,
    email: invite.email.toLowerCase()
  })), "email");
  // filter out any existing users in the system
  const emails = normalizedInvites.map(invite => invite.email);
  if (!(0, _policies.can)(user, "update", team)) {
    for (const email of emails) {
      if (!(await team.isDomainAllowed(email))) {
        throw (0, _errors.DomainNotAllowedError)();
      }
    }
  }
  const existingUsers = await _models.User.findAll({
    where: {
      teamId: user.teamId,
      email: emails
    }
  });
  const existingEmails = existingUsers.map(existingUser => existingUser.email);
  const [existingInvites, filteredInvites] = (0, _compat.partition)(normalizedInvites, invite => existingEmails.includes(invite.email));
  const users = [];

  // send and record remaining invites
  for (const invite of filteredInvites) {
    const newUser = await _models.User.createWithCtx(ctx, {
      teamId: user.teamId,
      name: invite.name,
      email: invite.email,
      role: user.isAdmin && invite.role === _types.UserRole.Admin ? _types.UserRole.Admin : user.isViewer || invite.role === _types.UserRole.Viewer ? _types.UserRole.Viewer : _types.UserRole.Member,
      invitedById: user.id,
      flags: suppressEmail ? undefined : {
        [_User.UserFlag.InviteSent]: 1
      }
    }, {
      name: "invite"
    });
    users.push(newUser);
    if (!suppressEmail) {
      await new _InviteEmail.default({
        to: invite.email,
        language: newUser.language,
        name: invite.name,
        actorName: user.name,
        actorEmail: user.email,
        teamName: team.name,
        teamUrl: team.url
      }).schedule();
    }
    if (_env.default.isDevelopment) {
      _Logger.default.info("email", `Sign in immediately: ${_env.default.URL}/auth/email.callback?token=${newUser.getEmailSigninToken(ctx)}`);
    }
  }
  return {
    sent: filteredInvites,
    unsent: existingInvites,
    users
  };
}