"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dateLocale = dateLocale;
exports.dateToReadable = dateToReadable;
exports.dateToRelative = dateToRelative;
exports.dateToRelativeReadable = dateToRelativeReadable;
exports.getCurrentDateAsString = getCurrentDateAsString;
exports.getCurrentDateTimeAsString = getCurrentDateTimeAsString;
exports.getCurrentTimeAsString = getCurrentTimeAsString;
exports.locales = void 0;
exports.parseDate = parseDate;
exports.parseISODate = parseISODate;
exports.subtractDate = subtractDate;
exports.toISODate = toISODate;
exports.unicodeBCP47toCLDR = unicodeBCP47toCLDR;
exports.unicodeCLDRtoBCP47 = unicodeCLDRtoBCP47;
exports.unicodeCLDRtoISO639 = unicodeCLDRtoISO639;
exports.usesMonthFirstFormat = usesMonthFirstFormat;
var _dateFns = require("date-fns");
var _locale = require("date-fns/locale");
var _browser = require("./browser");
/* oxlint-disable import/no-duplicates */

/**
 * Determines if the user's locale uses month-first date format (MM/dd).
 *
 * @returns true if locale uses MM/dd format, false for dd/MM format.
 */
function usesMonthFirstFormat() {
  if (!_browser.isBrowser || typeof Intl === "undefined") {
    return false;
  }

  // Format a known date and check if month comes before day
  const formatted = new Intl.DateTimeFormat(undefined, {
    month: "2-digit",
    day: "2-digit"
  }).format(new Date(2000, 11, 25)); // Dec 25, 2000

  // If it starts with "12", month comes first
  return formatted.startsWith("12");
}

/**
 * Attempts to parse a date string in various common formats.
 *
 * @param dateStr The date string to parse.
 * @returns a Date object if parsing is successful, null otherwise.
 */
function parseDate(dateStr) {
  if (!dateStr) {
    return null;
  }

  // Remove any trailing alphabetic text (e.g., "Uhr", "at", "o'clock", etc.)
  const cleaned = dateStr.trim().replace(/\s*[a-zA-Z]+\s*$/, "");
  const monthFirst = ["MM/dd/yyyy HH:mm:ss", "MM/dd/yyyy HH:mm", "MM/dd/yyyy", "MM/dd HH:mm:ss", "MM/dd HH:mm", "MM/dd"];
  const dayFirst = ["dd/MM/yyyy HH:mm:ss", "dd/MM/yyyy HH:mm", "dd/MM/yyyy", "dd/MM HH:mm:ss", "dd/MM HH:mm", "dd/MM"];

  // Ambiguous slash formats - order based on user's locale
  const slashFormats = usesMonthFirstFormat() ? [...monthFirst, ...dayFirst] : [...dayFirst, ...monthFirst];

  // Common date formats used in tables (with and without time, with and without year)
  const formats = [
  // ISO formats
  "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd",
  // European dot formats
  "dd.MM.yyyy HH:mm:ss", "dd.MM.yyyy HH:mm", "dd.MM.yyyy", "dd.MM. HH:mm:ss", "dd.MM. HH:mm", "dd.MM.", "d.M.yyyy HH:mm:ss", "d.M.yyyy HH:mm", "d.M.yyyy", "d.M. HH:mm:ss", "d.M. HH:mm", "d.M.",
  // Locale-dependent slash formats
  ...slashFormats];
  const referenceDate = new Date();
  for (const format of formats) {
    const date = (0, _dateFns.parse)(cleaned, format, referenceDate);
    if ((0, _dateFns.isValid)(date)) {
      return date;
    }
  }
  return null;
}
function subtractDate(date, period) {
  switch (period) {
    case "day":
      return (0, _dateFns.subDays)(date, 1);
    case "week":
      return (0, _dateFns.subWeeks)(date, 1);
    case "month":
      return (0, _dateFns.subMonths)(date, 1);
    case "year":
      return (0, _dateFns.subYears)(date, 1);
    default:
      return date;
  }
}

/**
 * Returns a humanized relative time string for the given date.
 *
 * @param date The date to convert
 * @param options The options to pass to date-fns
 * @returns The relative time string
 */
function dateToRelative(date, options) {
  const now = new Date();
  const parsedDateTime = new Date(date);

  // Protect against "in less than a minute" when users computer clock is off.
  const normalizedDateTime = parsedDateTime > now && parsedDateTime < (0, _dateFns.addSeconds)(now, 60) ? now : parsedDateTime;
  const output = (0, _dateFns.formatDistanceToNow)(normalizedDateTime, options);

  // Some tweaks to make english language shorter.
  if (options?.shorten) {
    return output.replace("about", "").replace("less than a minute ago", "just now").replace("minute", "min");
  }
  return output;
}

/**
 * Converts a locale string from Unicode CLDR format to BCP47 format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeCLDRtoBCP47(locale) {
  return locale.replace("_", "-").replace("root", "und");
}

/**
 * Converts a locale string from BCP47 format to Unicode CLDR format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeBCP47toCLDR(locale) {
  return locale.replace("-", "_").replace("und", "root");
}

/**
 * Converts a locale string from Unicode CLDR format to ISO 639 format.
 *
 * @param locale The locale string to convert
 * @returns The converted locale string
 */
function unicodeCLDRtoISO639(locale) {
  return locale.split("_")[0];
}

/**
 * Returns the current date as a string formatted depending on current locale.
 *
 * @returns The current date
 */
function getCurrentDateAsString(locale) {
  return new Date().toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

/**
 * Returns the current time as a string formatted depending on current locale.
 *
 * @returns The current time
 */
function getCurrentTimeAsString(locale) {
  return new Date().toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric"
  });
}

/**
 * Returns the current date and time as a string formatted depending on current
 * locale.
 *
 * @returns The current date and time
 */
function getCurrentDateTimeAsString(locale) {
  return new Date().toLocaleString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
}
const locales = exports.locales = {
  ca_ES: _locale.ca,
  cs_CZ: _locale.cs,
  de_DE: _locale.de,
  en_GB: _locale.enGB,
  en_US: _locale.enUS,
  es_ES: _locale.es,
  fa_IR: _locale.faIR,
  fr_FR: _locale.fr,
  he_IL: _locale.he,
  hu_HU: _locale.hu,
  it_IT: _locale.it,
  ja_JP: _locale.ja,
  ko_KR: _locale.ko,
  nb_NO: _locale.nb,
  nl_NL: _locale.nl,
  pt_BR: _locale.ptBR,
  pt_PT: _locale.pt,
  pl_PL: _locale.pl,
  sv_SE: _locale.sv,
  tr_TR: _locale.tr,
  uk_UA: _locale.uk,
  vi_VN: _locale.vi,
  zh_CN: _locale.zhCN,
  zh_TW: _locale.zhTW
};

/**
 * Returns the date-fns locale object for the given user language preference.
 *
 * @param language The user language
 * @returns The date-fns locale.
 */
function dateLocale(language) {
  return language ? locales[language] : undefined;
}
/**
 * Formats a Date into a date-only ISO string (yyyy-MM-dd) in the local
 * timezone. Used as the stored value for date mentions.
 *
 * @param date The date to format.
 * @returns the date-only ISO string.
 */
function toISODate(date) {
  return (0, _dateFns.format)(date, "yyyy-MM-dd");
}

/**
 * Parses a date-only ISO string (yyyy-MM-dd) into a Date at local midnight.
 * Strings carrying a time component are rejected so the date-only contract
 * (and the day-granular comparisons that depend on it) cannot be violated.
 *
 * @param iso The date-only ISO string.
 * @returns the parsed Date at local midnight, or null when the string is not a
 * valid date-only value.
 */
function parseISODate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return null;
  }
  const date = (0, _dateFns.parseISO)(iso);
  return (0, _dateFns.isValid)(date) ? date : null;
}

/**
 * Formats a date mention's stored ISO value into an absolute, localized,
 * human-readable label. The year is omitted within the current year (e.g.
 * "January 2nd") and included otherwise (e.g. "February 3rd, 2024"). Suitable
 * for plaintext and markdown serialization.
 *
 * @param iso The date-only ISO string.
 * @param language The user's language preference.
 * @returns the absolute human-readable date, or the original string when invalid.
 */
function dateToReadable(iso, language) {
  const date = parseISODate(iso);
  if (!date) {
    return iso;
  }
  const locale = dateLocale(language);
  if ((0, _dateFns.isSameYear)(date, new Date())) {
    return (0, _dateFns.format)(date, "MMMM do", {
      locale
    });
  }
  return (0, _dateFns.format)(date, "MMMM do, yyyy", {
    locale
  });
}

/**
 * Formats a date mention's stored ISO value into a relative, localized,
 * human-readable label with increasing granularity. Returns "Today",
 * "Tomorrow" or "Yesterday" where applicable, "January 2nd" within the
 * current year, and "February 3rd, 2024" otherwise.
 *
 * @param iso The date-only ISO string.
 * @param t The translation function.
 * @param language The user's language preference.
 * @returns the relative human-readable date, or the original string when invalid.
 */
function dateToRelativeReadable(iso, t, language) {
  const date = parseISODate(iso);
  if (!date) {
    return iso;
  }
  if ((0, _dateFns.isToday)(date)) {
    return t("Today");
  }
  if ((0, _dateFns.isTomorrow)(date)) {
    return t("Tomorrow");
  }
  if ((0, _dateFns.isYesterday)(date)) {
    return t("Yesterday");
  }
  const locale = dateLocale(language);
  if ((0, _dateFns.isSameYear)(date, new Date())) {
    return (0, _dateFns.format)(date, "MMMM do", {
      locale
    });
  }
  return (0, _dateFns.format)(date, "MMMM do, yyyy", {
    locale
  });
}