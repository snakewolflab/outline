"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createSubscriptionsForDocument = void 0;
exports.default = subscriptionCreator;
exports.subscribeUsersToDocument = exports.subscribeUserToDocument = void 0;
var _sequelize = require("sequelize");
var _types = require("../../shared/types");
var _context = require("../context");
var _models = require("../models");
var _database = require("../storage/database");
/**
 * This command creates a subscription of a user to a document.
 *
 * @returns The subscription that was created
 */
async function subscriptionCreator(_ref) {
  let {
    ctx,
    documentId,
    collectionId,
    event,
    resubscribe = true
  } = _ref;
  const {
    user
  } = ctx.state.auth;
  let rows;
  const now = new Date();
  if (documentId) {
    rows = await _database.sequelize.query(`INSERT INTO subscriptions ("id", "userId", "documentId", "event", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :userId, :documentId, :event, :now, :now)
       ON CONFLICT ("userId", "documentId", "event")
       DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt"
       RETURNING *`, {
      replacements: {
        userId: user.id,
        documentId,
        event,
        now
      },
      type: _sequelize.QueryTypes.SELECT,
      transaction: ctx.state.transaction
    });
  } else if (collectionId) {
    rows = await _database.sequelize.query(`INSERT INTO subscriptions ("id", "userId", "collectionId", "event", "createdAt", "updatedAt")
       VALUES (gen_random_uuid(), :userId, :collectionId, :event, :now, :now)
       ON CONFLICT ("userId", "collectionId", "event")
       DO UPDATE SET "updatedAt" = EXCLUDED."updatedAt"
       RETURNING *`, {
      replacements: {
        userId: user.id,
        collectionId,
        event,
        now
      },
      type: _sequelize.QueryTypes.SELECT,
      transaction: ctx.state.transaction
    });
  } else {
    throw new Error("Either documentId or collectionId must be provided");
  }
  if (!rows || rows.length === 0) {
    throw new Error("Failed to create or find subscription");
  }

  // Build subscription instance from the returned row
  const subscription = _models.Subscription.build(rows[0], {
    isNewRecord: false,
    include: [],
    raw: true
  });
  const isNew = subscription.createdAt.getTime() === now.getTime();
  if (isNew) {
    await _models.Event.createFromContext(ctx, {
      name: "subscriptions.create",
      modelId: subscription.id,
      userId: subscription.userId,
      collectionId: subscription.collectionId,
      documentId: subscription.documentId
    });
  }

  // If the subscription was deleted, then just restore the existing row.
  if (subscription.deletedAt && resubscribe) {
    await subscription.restoreWithCtx(ctx);
  }
  return subscription;
}

/**
 * Subscribe a single user to a document. The subscription is created if it
 * does not exist; an existing subscription that has been deleted is left as-is
 * so that the user's prior unsubscribe is respected.
 *
 * @param user The user to subscribe.
 * @param document The document to subscribe the user to.
 * @param event The event that triggered the subscription creation.
 * @param options.transaction An existing transaction to run within. When
 * subscribing many users in a row, callers should open a single transaction
 * and pass it in to avoid the overhead of one BEGIN/COMMIT per call.
 */
const subscribeUserToDocument = async function (user, document, event) {
  let options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  const run = transaction => subscriptionCreator({
    ctx: (0, _context.createContext)({
      user,
      authType: event.authType,
      ip: event.ip,
      transaction
    }),
    documentId: document.id,
    event: _types.SubscriptionType.Document,
    resubscribe: false
  });
  if (options.transaction) {
    await run(options.transaction);
    return;
  }
  await _database.sequelize.transaction(run);
};

/**
 * Subscribe a batch of users to a document inside a single transaction.
 *
 * @param users The users to subscribe.
 * @param document The document to subscribe the users to.
 * @param event The event that triggered the subscription creation.
 */
exports.subscribeUserToDocument = subscribeUserToDocument;
const subscribeUsersToDocument = async (users, document, event) => {
  if (!users.length) {
    return;
  }
  await _database.sequelize.transaction(async transaction => {
    for (const user of users) {
      await subscribeUserToDocument(user, document, event, {
        transaction
      });
    }
  });
};

/**
 * Create any new subscriptions that might be missing for collaborators in the
 * document on publish and revision creation. This does mean that there is a
 * short period of time where the user is not subscribed after editing until a
 * revision is created.
 *
 * @param document The document to create subscriptions for.
 * @param event The event that triggered the subscription creation.
 */
exports.subscribeUsersToDocument = subscribeUsersToDocument;
const createSubscriptionsForDocument = async (document, event) => {
  const users = await document.collaborators();
  await subscribeUsersToDocument(users, document, event);
};
exports.createSubscriptionsForDocument = createSubscriptionsForDocument;