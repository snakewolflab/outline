"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canUseElementFullscreen = canUseElementFullscreen;
exports.getSafeAreaInsets = getSafeAreaInsets;
exports.isMac = exports.isFirefox = exports.isBrowser = void 0;
exports.isMobile = isMobile;
exports.isSafari = exports.isPWA = exports.isNode = void 0;
exports.isTouchDevice = isTouchDevice;
exports.supportsPassiveListener = exports.isWindows = void 0;
/**
 * Is true if we're running in the browser. Note that this will return true when rendering on the server
 * with a tool like JSDOM as we patch the global window object.
 */
const isBrowser = exports.isBrowser = typeof window !== "undefined";

/**
 * Is true when running on the server, always.
 */
const isNode = exports.isNode = typeof process !== "undefined" && process.versions !== null && process.versions.node !== null;

/**
 * Is true if the browser is running as an installed PWA on mobile or desktop
 */
const isPWA = exports.isPWA = typeof window !== "undefined" && window.matchMedia?.("(display-mode: standalone)").matches;

/**
 * Returns true if the client only supports touch input.
 * Note that this will return false for hybrid devices which support both touch and mouse input.
 */
function isTouchDevice() {
  if (!isBrowser) {
    return false;
  }
  return window.matchMedia?.("(any-hover: none) and (pointer: coarse)")?.matches;
}

/**
 * Returns true if the client is the size of a mobile device.
 */
function isMobile() {
  if (!isBrowser) {
    return false;
  }

  // Matches breakpoints.tablet - 1 but not imported to avoid circular dependency
  return window.matchMedia?.(`(max-width: ${736}px)`)?.matches;
}

/**
 * Returns the safe area insets for the current device.
 */
function getSafeAreaInsets() {
  // Check if CSS environment variables are supported
  const style = getComputedStyle(document.documentElement);
  const supportsEnv = window.CSS?.supports?.("top", "env(safe-area-inset-top)");
  if (supportsEnv) {
    return {
      top: parseFloat(style.getPropertyValue("--sat") || "0"),
      right: parseFloat(style.getPropertyValue("--sar") || "0"),
      bottom: parseFloat(style.getPropertyValue("--sab") || "0"),
      left: parseFloat(style.getPropertyValue("--sal") || "0")
    };
  }

  // Fallback to zero if not supported
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  };
}

/**
 * Is true if the client is running on a Mac.
 */
const isMac = exports.isMac = isBrowser && window.navigator.platform === "MacIntel";

/**
 * Is true if the client is running on Windows.
 */
const isWindows = exports.isWindows = isBrowser && window.navigator.platform === "Win32";

/**
 * Is true if the client is running Safari.
 */
const isSafari = exports.isSafari = isBrowser && window.navigator.userAgent.includes("Safari") && !window.navigator.userAgent.includes("Chrome") && !window.navigator.userAgent.includes("Chromium");

/**
 * Is true if the client is running Firefox.
 */
const isFirefox = exports.isFirefox = isBrowser && window.navigator.userAgent.includes("Firefox");

/**
 * Returns true if the browser supports the Element Fullscreen API. This is
 * false on iOS Safari which does not implement it.
 *
 * @returns whether element fullscreen is available.
 */
function canUseElementFullscreen() {
  if (!isBrowser) {
    return false;
  }
  const doc = document;
  const fullscreenAPI = doc.fullscreenEnabled ?? doc.webkitFullscreenEnabled ?? doc.msFullscreenEnabled;
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return !!fullscreenAPI && !isIOS;
}
let supportsPassive = false;
try {
  const opts = Object.defineProperty({}, "passive", {
    get() {
      supportsPassive = true;
    }
  });
  // @ts-expect-error ts-migrate(2769) testPassive is not a real event
  window.addEventListener("testPassive", null, opts);
  // @ts-expect-error ts-migrate(2769) testPassive is not a real event
  window.removeEventListener("testPassive", null, opts);
} catch (_err) {
  // Ignore
}

/**
 * Returns true if the client supports passive event listeners
 */
const supportsPassiveListener = exports.supportsPassiveListener = supportsPassive;