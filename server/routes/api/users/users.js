"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _koaRouter = _interopRequireDefault(require("koa-router"));
var _sequelize = require("sequelize");
var _types = require("../../../../shared/types");
var _UserRoleHelper = require("../../../../shared/utils/UserRoleHelper");
var _routeHelpers = require("../../../../shared/utils/routeHelpers");
var _validations = require("../../../../shared/validations");
var _userInviter = _interopRequireDefault(require("../../../commands/userInviter"));
var _ConfirmUpdateEmail = _interopRequireDefault(require("../../../emails/templates/ConfirmUpdateEmail"));
var _ConfirmUserDeleteEmail = _interopRequireDefault(require("../../../emails/templates/ConfirmUserDeleteEmail"));
var _InviteEmail = _interopRequireDefault(require("../../../emails/templates/InviteEmail"));
var _env = _interopRequireDefault(require("../../../env"));
var _errors = require("../../../errors");
var _Logger = _interopRequireDefault(require("../../../logging/Logger"));
var _authentication = _interopRequireDefault(require("../../../middlewares/authentication"));
var _rateLimiter = require("../../../middlewares/rateLimiter");
var _transaction = require("../../../middlewares/transaction");
var _validate = _interopRequireDefault(require("../../../middlewares/validate"));
var _models = require("../../../models");
var _User = require("../../../models/User");
var _policies = require("../../../policies");
var _presenters = require("../../../presenters");
var _RateLimiter = require("../../../utils/RateLimiter");
var _crypto = require("../../../utils/crypto");
var _jwt = require("../../../utils/jwt");
var _pagination = _interopRequireDefault(require("../middlewares/pagination"));
var T = _interopRequireWildcard(require("./schema"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const router = new _koaRouter.default();
router.post("users.list", (0, _authentication.default)(), (0, _pagination.default)(), (0, _validate.default)(T.UsersListSchema), async ctx => {
  const {
    sort,
    direction,
    query,
    role,
    filter,
    ids,
    emails
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  let where = {
    teamId: actor.teamId
  };

  // Filter out suspended users if we're not an admin
  if (!actor.isAdmin) {
    where = {
      ...where,
      suspendedAt: {
        [_sequelize.Op.eq]: null
      }
    };
  }
  switch (filter) {
    case "invited":
      {
        where = {
          ...where,
          lastActiveAt: null
        };
        break;
      }
    case "viewers":
      {
        where = {
          ...where,
          role: _types.UserRole.Viewer
        };
        break;
      }
    case "admins":
      {
        where = {
          ...where,
          role: _types.UserRole.Admin
        };
        break;
      }
    case "members":
      {
        where = {
          ...where,
          role: _types.UserRole.Member
        };
        break;
      }
    case "suspended":
      {
        if (actor.isAdmin) {
          where = {
            ...where,
            suspendedAt: {
              [_sequelize.Op.ne]: null
            }
          };
        }
        break;
      }
    case "active":
      {
        where = {
          ...where,
          lastActiveAt: {
            [_sequelize.Op.ne]: null
          },
          suspendedAt: {
            [_sequelize.Op.is]: null
          }
        };
        break;
      }
    case "all":
      {
        break;
      }
    default:
      {
        where = {
          ...where,
          suspendedAt: {
            [_sequelize.Op.is]: null
          }
        };
        break;
      }
  }
  if (role) {
    where = {
      ...where,
      role
    };
  }
  if (query) {
    where = {
      ...where,
      [_sequelize.Op.and]: {
        [_sequelize.Op.or]: [_sequelize.Sequelize.literal(`unaccent(LOWER(email)) like unaccent(LOWER(:query))`), _sequelize.Sequelize.literal(`unaccent(LOWER(name)) like unaccent(LOWER(:query))`)]
      }
    };
  }
  if (ids) {
    where = {
      ...where,
      id: ids
    };
  }
  if (emails) {
    where = {
      ...where,
      email: emails
    };
  }
  const replacements = {
    query: `%${query}%`
  };
  const [users, total] = await Promise.all([_models.User.findAll({
    where,
    replacements,
    order: [[sort, direction]],
    offset: ctx.state.pagination.offset,
    limit: ctx.state.pagination.limit
  }), _models.User.count({
    where,
    // @ts-expect-error Types are incorrect for count
    replacements
  })]);
  ctx.body = {
    pagination: {
      ...ctx.state.pagination,
      total
    },
    data: users.map(user => (0, _presenters.presentUser)(user, {
      includeEmail: !!(0, _policies.can)(actor, "readEmail", user),
      includeDetails: !!(0, _policies.can)(actor, "readDetails", user)
    })),
    policies: (0, _presenters.presentPolicies)(actor, users)
  };
});
router.post("users.info", (0, _authentication.default)(), (0, _validate.default)(T.UsersInfoSchema), async ctx => {
  const {
    id
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  const user = id ? await _models.User.findByPk(id) : actor;
  (0, _policies.authorize)(actor, "read", user);
  const includeDetails = !!(0, _policies.can)(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.updateEmail", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UsersUpdateEmailSchema), async ctx => {
  if (!_env.default.EMAIL_ENABLED) {
    throw (0, _errors.ValidationError)("Email support is not setup for this instance");
  }
  const {
    user: actor
  } = ctx.state.auth;
  const {
    id
  } = ctx.input.body;
  const {
    team
  } = actor;
  const user = id ? await _models.User.findByPk(id) : actor;
  const email = ctx.input.body.email.trim().toLowerCase();
  (0, _policies.authorize)(actor, "update", user);

  // Check if email domain is allowed
  if (!(await team.isDomainAllowed(email))) {
    throw (0, _errors.ValidationError)("The domain is not allowed for this workspace");
  }

  // Check if email already exists in workspace
  if (await _models.User.findByEmail(ctx, email)) {
    throw (0, _errors.ValidationError)("User with email already exists");
  }
  await new _ConfirmUpdateEmail.default({
    to: email,
    language: user.language,
    previous: user.email,
    code: user.getEmailUpdateToken(email),
    teamUrl: team.url
  }).schedule();
  ctx.body = {
    success: true
  };
});
router.get("users.updateEmail", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _transaction.transaction)(), (0, _validate.default)(T.UsersUpdateEmailConfirmSchema), async ctx => {
  if (!_env.default.EMAIL_ENABLED) {
    throw (0, _errors.ValidationError)("Email support is not setup for this instance");
  }
  const {
    transaction
  } = ctx.state;
  const {
    code,
    follow
  } = ctx.input.query;

  // The link in the email does not include the follow query param, this
  // is to help prevent anti-virus, and email clients from pre-fetching the link
  if (!follow) {
    return ctx.redirectOnClient(ctx.request.href + "&follow=true");
  }
  let user;
  let email;
  try {
    const res = await (0, _jwt.getDetailsForEmailUpdateToken)(code, {
      transaction,
      lock: transaction.LOCK.UPDATE
    });
    user = res.user;
    email = res.email;
  } catch (_err) {
    ctx.redirect(`/?notice=expired-token`);
    return;
  }
  const {
    user: actor
  } = ctx.state.auth;
  (0, _policies.authorize)(actor, "update", user);

  // Check if email domain is allowed
  if (!(await actor.team.isDomainAllowed(email))) {
    throw (0, _errors.ValidationError)("The domain is not allowed for this workspace");
  }

  // Check if email already exists in workspace
  if (await _models.User.findByEmail(ctx, email)) {
    throw (0, _errors.ValidationError)("User with email already exists");
  }
  await user.updateWithCtx(ctx, {
    email
  });
  ctx.redirect((0, _routeHelpers.settingsPath)());
});
router.post("users.update", (0, _authentication.default)(), (0, _validate.default)(T.UsersUpdateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    auth,
    transaction
  } = ctx.state;
  const actor = auth.user;
  const {
    id,
    name,
    avatarUrl,
    language,
    preferences,
    timezone
  } = ctx.input.body;
  let user = actor;
  if (id) {
    user = await _models.User.findByPk(id, {
      rejectOnEmpty: true,
      transaction,
      lock: transaction.LOCK.UPDATE
    });
  }
  (0, _policies.authorize)(actor, "update", user);
  const includeDetails = !!(0, _policies.can)(actor, "readDetails", user);
  if (name) {
    user.name = name;
  }
  if (avatarUrl !== undefined) {
    user.avatarUrl = avatarUrl;

    // Mark that the user has manually changed their avatar
    // This prevents automatic syncing from identity providers
    user.setFlag(_User.UserFlag.AvatarUpdated, avatarUrl ? true : false);
  }
  if (language) {
    user.language = language;
  }
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences
    };
  }
  if (timezone) {
    user.timezone = timezone;
  }
  await user.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    })
  };
});

// Admin specific

/**
 * Promote a user to an admin.
 *
 * @deprecated Use `users.update_role` instead.
 */
router.post("users.promote", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.UsersPromoteSchema), (0, _transaction.transaction)(), ctx => {
  const forward = ctx;
  forward.input = {
    ...ctx.input,
    body: {
      id: ctx.input.body.id,
      role: _types.UserRole.Admin
    }
  };
  return updateRole(forward);
});

/**
 * Demote a user to another role.
 *
 * @deprecated Use `users.update_role` instead.
 */
router.post("users.demote", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.UsersDemoteSchema), (0, _transaction.transaction)(), ctx => {
  const forward = ctx;
  forward.input = {
    ...ctx.input,
    body: {
      id: ctx.input.body.id,
      role: ctx.input.body.to
    }
  };
  return updateRole(forward);
});
router.post("users.update_role", (0, _authentication.default)({
  role: _types.UserRole.Admin
}), (0, _validate.default)(T.UsersChangeRoleSchema), (0, _transaction.transaction)(), updateRole);
async function updateRole(ctx) {
  const {
    transaction
  } = ctx.state;
  const userId = ctx.input.body.id;
  const role = ctx.input.body.role;
  const actor = ctx.state.auth.user;
  const user = await _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  await _models.Team.findByPk(user.teamId, {
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  let name;
  if (user.role === role) {
    throw (0, _errors.ValidationError)("User is already in that role");
  }
  if (user.id === actor.id) {
    throw (0, _errors.ValidationError)("You cannot change your own role");
  }
  if (_UserRoleHelper.UserRoleHelper.canDemote(user, role)) {
    name = "demote";
    (0, _policies.authorize)(actor, "demote", user);
  }
  if (_UserRoleHelper.UserRoleHelper.canPromote(user, role)) {
    name = "promote";
    (0, _policies.authorize)(actor, "promote", user);
  }
  await user.updateWithCtx(ctx, {
    role
  }, {
    name
  });
  const includeDetails = !!(0, _policies.can)(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
}
router.post("users.suspend", (0, _authentication.default)(), (0, _validate.default)(T.UsersSuspendSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const userId = ctx.input.body.id;
  const actor = ctx.state.auth.user;
  const user = await _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(actor, "suspend", user);
  await user.updateWithCtx(ctx, {
    suspendedById: actor.id,
    suspendedAt: new Date()
  }, {
    name: "suspend"
  });
  const includeDetails = !!(0, _policies.can)(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.activate", (0, _authentication.default)(), (0, _validate.default)(T.UsersActivateSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const userId = ctx.input.body.id;
  const actor = ctx.state.auth.user;
  const user = await _models.User.findByPk(userId, {
    rejectOnEmpty: true,
    transaction,
    lock: transaction.LOCK.UPDATE
  });
  (0, _policies.authorize)(actor, "activate", user);
  await user.updateWithCtx(ctx, {
    suspendedById: null,
    suspendedAt: null
  }, {
    name: "activate"
  });
  const includeDetails = !!(0, _policies.can)(actor, "readDetails", user);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails
    }),
    policies: (0, _presenters.presentPolicies)(actor, [user])
  };
});
router.post("users.invite", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FiftyPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UsersInviteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    invites,
    suppressEmail
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  if (invites.length > _validations.UserValidation.maxInvitesPerRequest) {
    throw (0, _errors.ValidationError)(`You can only invite up to ${_validations.UserValidation.maxInvitesPerRequest} users at a time`);
  }
  (0, _policies.authorize)(user, "inviteUser", user.team);
  const response = await (0, _userInviter.default)(ctx, {
    invites,
    suppressEmail
  });
  ctx.body = {
    data: {
      sent: response.sent,
      unsent: response.unsent,
      users: response.users.map(user => (0, _presenters.presentUser)(user, {
        includeEmail: !!(0, _policies.can)(user, "readEmail", user)
      }))
    }
  };
});
router.post("users.resendInvite", (0, _authentication.default)(), (0, _validate.default)(T.UsersResendInviteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    id
  } = ctx.input.body;
  const {
    auth,
    transaction
  } = ctx.state;
  const actor = auth.user;
  const user = await _models.User.findByPk(id, {
    lock: transaction.LOCK.UPDATE,
    transaction
  });
  (0, _policies.authorize)(actor, "resendInvite", user);
  if (user.getFlag(_User.UserFlag.InviteSent) > 2) {
    throw (0, _errors.ValidationError)("This invite has been sent too many times");
  }
  await new _InviteEmail.default({
    to: user.email,
    language: user.language,
    name: user.name,
    actorName: actor.name,
    actorEmail: actor.email,
    teamName: actor.team.name,
    teamUrl: actor.team.url
  }).schedule();
  user.incrementFlag(_User.UserFlag.InviteSent);
  await user.save({
    transaction
  });
  if (_env.default.isDevelopment) {
    _Logger.default.info("email", `Sign in immediately: ${_env.default.URL}/auth/email.callback?token=${user.getEmailSigninToken(ctx)}`);
  }
  ctx.body = {
    success: true
  };
});
router.post("users.requestDelete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.FivePerHour), (0, _authentication.default)(), async ctx => {
  if (!_env.default.EMAIL_ENABLED) {
    throw (0, _errors.ValidationError)("Email support is not setup for this instance");
  }
  const {
    user
  } = ctx.state.auth;
  (0, _policies.authorize)(user, "delete", user);
  await new _ConfirmUserDeleteEmail.default({
    to: user.email,
    language: user.language,
    deleteConfirmationCode: user.deleteConfirmationCode,
    teamName: user.team.name,
    teamUrl: user.team.url
  }).schedule();
  ctx.body = {
    success: true
  };
});
router.post("users.delete", (0, _rateLimiter.rateLimiter)(_RateLimiter.RateLimiterStrategy.TenPerHour), (0, _authentication.default)(), (0, _validate.default)(T.UsersDeleteSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    transaction
  } = ctx.state;
  const {
    id,
    code
  } = ctx.input.body;
  const actor = ctx.state.auth.user;
  let user;
  if (id) {
    user = await _models.User.findByPk(id, {
      rejectOnEmpty: true,
      transaction,
      lock: transaction.LOCK.UPDATE
    });
  } else {
    user = actor;
  }
  (0, _policies.authorize)(actor, "delete", user);

  // If we're attempting to delete our own account then a confirmation code
  // is required. This acts as CSRF protection.
  if ((!id || id === actor.id) && _env.default.EMAIL_ENABLED) {
    const deleteConfirmationCode = user.deleteConfirmationCode;
    if (!(0, _crypto.safeEqual)(code, deleteConfirmationCode)) {
      throw (0, _errors.ValidationError)("The confirmation code was incorrect");
    }
  }
  await user.destroyWithCtx(ctx);
  ctx.body = {
    success: true
  };
});
router.post("users.notificationsSubscribe", (0, _authentication.default)(), (0, _validate.default)(T.UsersNotificationsSubscribeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    eventType
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const eventTypes = eventType ? [eventType] : Object.values(_types.NotificationEventType);
  for (const type of eventTypes) {
    user.setNotificationEventType(type, true);
  }
  await user.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails: true
    })
  };
});
router.post("users.notificationsUnsubscribe", (0, _authentication.default)(), (0, _validate.default)(T.UsersNotificationsUnsubscribeSchema), (0, _transaction.transaction)(), async ctx => {
  const {
    eventType
  } = ctx.input.body;
  const {
    user
  } = ctx.state.auth;
  const eventTypes = eventType ? [eventType] : Object.values(_types.NotificationEventType);
  for (const type of eventTypes) {
    user.setNotificationEventType(type, false);
  }
  await user.saveWithCtx(ctx);
  ctx.body = {
    data: (0, _presenters.presentUser)(user, {
      includeDetails: true
    })
  };
});
var _default = exports.default = router;