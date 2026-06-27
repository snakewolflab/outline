"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _compat = require("es-toolkit/compat");
var _env = _interopRequireDefault(require("../../env"));
var _User = _interopRequireDefault(require("../User"));
var _UserPasskey = _interopRequireDefault(require("../UserPasskey"));
var _PluginManager = require("../../utils/PluginManager");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/* oxlint-disable @typescript-eslint/no-var-requires */

class AuthenticationHelper {
  /**
   * Returns the enabled authentication provider configurations for the current
   * installation.
   *
   * @returns A list of authentication providers
   */
  static get providers() {
    return _PluginManager.PluginManager.getHooks(_PluginManager.Hook.AuthProvider);
  }

  /**
   * Returns the human-readable display name for an authentication provider.
   *
   * @param id The authentication provider id, eg "google".
   * @returns The display name if known, otherwise the provided id.
   */
  static getProviderName(id) {
    const provider = AuthenticationHelper.providers.find(hook => hook.value.id === id);
    return provider?.name ?? id;
  }

  /**
   * Returns the enabled authentication provider configurations for a team,
   * if given otherwise all enabled providers are returned.
   *
   * @param team The team to get enabled providers for
   * @returns A promise resolving to a list of authentication providers
   */
  static async providersForTeam(team) {
    const isCloudHosted = _env.default.isCloudHosted;

    // Only check passkeys count if the team has passkeys enabled, to avoid
    // an unnecessary database query in the common case.
    let teamHasPasskeys = false;
    if (team?.passkeysEnabled) {
      const count = await _UserPasskey.default.count({
        include: [{
          model: _User.default,
          where: {
            teamId: team.id
          },
          required: true
        }]
      });
      teamHasPasskeys = count > 0;
    }
    return AuthenticationHelper.providers.sort(hook => hook.value.id === "email" || hook.value.id === "passkeys" ? 1 : -1).filter(hook => {
      // Email sign-in is an exception as it does not have an authentication
      // provider using passport, instead it exists as a boolean option.
      if (hook.value.id === "email") {
        return team?.emailSigninEnabled;
      }

      // Passkeys is an exception as it does not have an authentication
      // provider using passport, instead it exists as a boolean option.
      // Only include passkeys if there is at least one passkey registered
      // for the team, to avoid showing an unusable sign-in option.
      if (hook.value.id === "passkeys") {
        return team?.passkeysEnabled && teamHasPasskeys;
      }

      // If no team return all possible authentication providers except email and passkeys.
      if (!team) {
        return true;
      }
      const authProvider = (0, _compat.find)(team.authenticationProviders, {
        name: hook.value.id
      });

      // If cloud hosted then the auth provider must be enabled for the team,
      // If self-hosted then it must not be actively disabled, otherwise all
      // providers are considered.
      return !isCloudHosted && authProvider?.enabled !== false || isCloudHosted && authProvider?.enabled;
    });
  }
}
exports.default = AuthenticationHelper;