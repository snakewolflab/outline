"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CannotUseWith = CannotUseWith;
exports.CannotUseWithAny = CannotUseWithAny;
exports.CannotUseWithout = CannotUseWithout;
exports.IsDatabaseUrl = IsDatabaseUrl;
exports.IsInCaseInsensitive = IsInCaseInsensitive;
exports.IsMailboxAddress = IsMailboxAddress;
exports.isDatabaseUrl = isDatabaseUrl;
exports.isMailboxAddress = isMailboxAddress;
var _addressparser = _interopRequireDefault(require("addressparser"));
var _classValidator = require("class-validator");
var _validator = require("validator");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
/**
 * Validates a PostgreSQL database connection URL, including support for
 * multi-host connection strings as documented in:
 * https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS
 *
 * Supports:
 * - Single host: postgresql://user:pass@host:port/db
 * - Multi-host: postgresql://user:pass@host1:port1,host2:port2,host3:port3/db
 * - With query parameters: postgresql://user:pass@host1,host2/db?param=value
 *
 * @param url the database URL to validate.
 * @param protocols the protocols to allow (e.g., ["postgres", "postgresql"]).
 * @param requireTld whether to require top-level domain in hostnames.
 * @param allowUnderscores whether to allow underscores in hostnames.
 * @returns true if the URL is valid, false otherwise.
 */
function isDatabaseUrl(url) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    protocols = ["postgres", "postgresql"],
    require_tld = false,
    allow_underscores = true
  } = options;
  if (!url || typeof url !== "string") {
    return false;
  }
  try {
    // Check if protocol is valid
    const protocolMatch = url.match(/^(\w+):\/\//);
    if (!protocolMatch || !protocols.includes(protocolMatch[1])) {
      return false;
    }

    // Extract the URL components
    // Format: protocol://[user[:password]@]host1[:port1][,host2[:port2],...][/database][?params]
    const protocolEnd = url.indexOf("://") + 3;
    const urlWithoutProtocol = url.substring(protocolEnd);

    // Split by @ to separate auth from host/path
    const atIndex = urlWithoutProtocol.lastIndexOf("@");
    const hasAuth = atIndex !== -1;
    const hostAndPath = hasAuth ? urlWithoutProtocol.substring(atIndex + 1) : urlWithoutProtocol;

    // Split host section from path/query
    const pathStart = hostAndPath.search(/[/?]/);
    const hostSection = pathStart === -1 ? hostAndPath : hostAndPath.substring(0, pathStart);
    if (!hostSection) {
      return false;
    }

    // Split multiple hosts by comma
    const hosts = hostSection.split(",");

    // Validate each host
    for (const hostWithPort of hosts) {
      const host = hostWithPort.split(":")[0];
      if (!host) {
        return false;
      }

      // Check for invalid characters in hostname
      const hostnameRegex = allow_underscores ? /^[a-zA-Z0-9._-]+$/ : /^[a-zA-Z0-9.-]+$/;
      if (!hostnameRegex.test(host)) {
        return false;
      }

      // Check TLD requirement if specified
      if (require_tld && !host.includes(".")) {
        return false;
      }

      // Validate port if present
      const colonIndex = hostWithPort.indexOf(":");
      if (colonIndex !== -1) {
        const portStr = hostWithPort.substring(colonIndex + 1);
        const port = parseInt(portStr, 10);
        if (isNaN(port) || port < 1 || port > 65535) {
          return false;
        }
      }
    }
    return true;
  } catch {
    return false;
  }
}
function CannotUseWithout(property, validationOptions) {
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "cannotUseWithout",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          const obj = args.object;
          const required = args.constraints[0];
          return obj[required] !== undefined;
        },
        defaultMessage(args) {
          return `${propertyName} cannot be used without ${args.constraints[0]}.`;
        }
      }
    });
  };
}
function CannotUseWith(property, validationOptions) {
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "cannotUseWith",
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value, args) {
          if (value === undefined) {
            return true;
          }
          const obj = args.object;
          const forbidden = args.constraints[0];
          return obj[forbidden] === undefined;
        },
        defaultMessage(args) {
          return `${propertyName} cannot be used with ${args.constraints[0]}.`;
        }
      }
    });
  };
}
function CannotUseWithAny(properties, validationOptions) {
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "cannotUseWithAny",
      target: object.constructor,
      propertyName,
      constraints: properties,
      options: validationOptions,
      validator: {
        validate(value, args) {
          if (value === undefined) {
            return true;
          }
          const obj = args.object;
          const forbiddenProperties = args.constraints;
          return forbiddenProperties.every(prop => obj[prop] === undefined);
        },
        defaultMessage(args) {
          return `${propertyName} cannot be used with any of: ${args.constraints.join(", ")}.`;
        }
      }
    });
  };
}
function IsInCaseInsensitive(allowedValues, validationOptions) {
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "isInCaseInsensitive",
      target: object.constructor,
      propertyName,
      constraints: [allowedValues],
      options: validationOptions,
      validator: {
        validate(value, args) {
          if (value === undefined || value === null) {
            return true;
          }
          if (typeof value !== "string") {
            return false;
          }
          const av = args.constraints[0];
          return av.some(allowedValue => allowedValue.toLowerCase() === value.toLowerCase());
        },
        defaultMessage(args) {
          const av = args.constraints[0];
          return `${propertyName} must be one of: ${av.join(", ")} (case insensitive).`;
        }
      }
    });
  };
}

/**
 * Decorator that validates PostgreSQL database connection URLs, including
 * multi-host connection strings for high-availability setups.
 *
 * @param options validation options including protocols, require_tld, and allow_underscores.
 * @param validationOptions additional validation options.
 * @returns decorator function.
 */
function IsDatabaseUrl() {
  let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  let validationOptions = arguments.length > 1 ? arguments[1] : undefined;
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "isDatabaseUrl",
      target: object.constructor,
      propertyName,
      constraints: [options],
      options: validationOptions,
      validator: {
        validate(value, args) {
          if (value === undefined || value === null) {
            return true;
          }
          if (typeof value !== "string") {
            return false;
          }
          const opts = args.constraints[0];
          return isDatabaseUrl(value, opts);
        },
        defaultMessage() {
          return `${propertyName} must be a URL address`;
        }
      }
    });
  };
}

/**
 * Validates an email address in either plain format (email@domain.com) or
 * mailbox format (Display Name <email@domain.com>). Uses addressparser to
 * extract the email address before validation, which provides correct handling
 * of display names that may contain characters like periods or other special
 * characters.
 *
 * @param value the email address string to validate.
 * @returns true if the value is a valid email or valid mailbox address, false otherwise.
 */
function isMailboxAddress(value) {
  try {
    const parsed = (0, _addressparser.default)(value);
    // If parsing results in multiple addresses (e.g., comma in unquoted display
    // name), the input is malformed and should be rejected.
    if (parsed.length !== 1) {
      return false;
    }
    const [{
      address
    }] = parsed;
    if (!address?.includes("@")) {
      return false;
    }
    return (0, _validator.isEmail)(address, {
      allow_ip_domain: true
    });
  } catch {
    return false;
  }
}

/**
 * Decorator that validates an email address in either plain format
 * (email@domain.com) or mailbox format (Display Name <email@domain.com>).
 *
 * Unlike @IsEmail, this decorator supports display names containing characters
 * such as periods, which are commonly used in application names
 * (e.g., "App v1.0 <noreply@example.com>").
 *
 * Note: Display names containing commas must be quoted, e.g.:
 * "Company, Inc." <email@example.com>
 *
 * @param validationOptions additional validation options.
 * @returns decorator function.
 */
function IsMailboxAddress(validationOptions) {
  return function (object, propertyName) {
    (0, _classValidator.registerDecorator)({
      name: "isMailboxAddress",
      target: object.constructor,
      propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value) {
          if (value === undefined || value === null) {
            return true;
          }
          if (typeof value !== "string") {
            return false;
          }
          return isMailboxAddress(value);
        },
        defaultMessage() {
          return `${propertyName} must be a valid email address or use mailbox format (e.g., "Display Name <email@example.com>"). Note: display names containing commas must be quoted (e.g., '"Company, Inc." <email@example.com>').`;
        }
      }
    });
  };
}