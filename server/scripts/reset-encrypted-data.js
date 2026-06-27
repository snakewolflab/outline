"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = main;
require("./bootstrap");
var readline = _interopRequireWildcard(require("node:readline"));
var _sequelize = require("sequelize");
var _models = require("../models");
var _database = require("../storage/database");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Helper function to prompt user for input
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Helper function to pause and wait for user confirmation
async function waitForConfirmation(message) {
  const answer = await askQuestion(`${message} (y/N): `);
  return answer === "y" || answer === "yes";
}
async function main() {
  console.log("🔐 Reset Encrypted Data Script");
  console.log("This script will:");
  console.log("- Delete all user authentication tokens");
  console.log("- Rotate webhook signing secrets");
  console.log("- Rotate OAuth client secrets");
  console.log("- Rotate JWT secrets for all users (logging them out)");
  console.log("");
  const shouldContinue = await waitForConfirmation("⚠️  This will log out all users and invalidate tokens. Continue?");
  if (!shouldContinue) {
    console.log("❌ Operation cancelled.");
    process.exit(0);
  }
  await _database.sequelize.transaction(async transaction => {
    await _models.UserAuthentication.destroy({
      where: {},
      transaction
    });
    const webhooks = await _models.WebhookSubscription.findAll({
      lock: _sequelize.Transaction.LOCK.UPDATE,
      transaction
    });
    for (const webhook of webhooks) {
      try {
        webhook.rotateSecret();
        await webhook.save({
          transaction
        });
      } catch (err) {
        console.error(`Failed to rotate webhook signing secret for webhook ${webhook.id}:`, err);
        continue;
      }
    }
    const oauthClients = await _models.OAuthClient.findAll({
      lock: _sequelize.Transaction.LOCK.UPDATE,
      transaction
    });
    for (const client of oauthClients) {
      try {
        client.rotateClientSecret();
        await client.save({
          transaction
        });
      } catch (err) {
        console.error(`Failed to rotate OAuth client secret for client ${client.id}:`, err);
        continue;
      }
    }
    const users = await _models.User.findAll({
      lock: _sequelize.Transaction.LOCK.UPDATE,
      transaction
    });
    for (const user of users) {
      try {
        await user.rotateJwtSecret({
          transaction
        });
      } catch (err) {
        console.error(`Failed to rotate JWT secret for user ${user.id}:`, err);
        continue;
      }
    }
    console.log(`Reset encrypted data, logged out ${users.length} users`);
  });
  process.exit(0);
}

// In the test suite we import the script rather than run via node CLI
if (process.env.NODE_ENV !== "test") {
  void main();
}