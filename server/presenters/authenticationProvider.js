"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = presentAuthenticationProvider;
/**
 * Presents an AuthenticationProvider model for API responses.
 *
 * @param authenticationProvider - the authentication provider to present.
 * @returns a plain object for serialization.
 */
function presentAuthenticationProvider(authenticationProvider) {
  return {
    id: authenticationProvider.id,
    name: authenticationProvider.name,
    providerId: authenticationProvider.providerId,
    createdAt: authenticationProvider.createdAt,
    isEnabled: authenticationProvider.enabled,
    isConnected: true,
    settings: authenticationProvider.settings ?? undefined
  };
}