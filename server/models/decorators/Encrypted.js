"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decrypt = decrypt;
exports.default = Encrypted;
exports.encrypt = encrypt;
var _nodeCrypto = _interopRequireDefault(require("node:crypto"));
var _compat = require("es-toolkit/compat");
var _sequelizeTypescript = require("sequelize-typescript");
var _error = require("../../../shared/utils/error");
var _env = _interopRequireDefault(require("../../env"));
var _Logger = _interopRequireDefault(require("../../logging/Logger"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const algorithm = "aes-256-cbc";
const ivLength = 16;

/**
 * Encrypt a string value for storage in a database column. The returned buffer
 * is the initialization vector followed by the ciphertext (`iv || ciphertext`)
 * using AES-256-CBC, matching the on-disk format of previously encrypted data.
 *
 * @param value The plaintext value to encrypt.
 * @returns A buffer containing the IV concatenated with the ciphertext.
 */
function encrypt(value) {
  const iv = _nodeCrypto.default.randomBytes(ivLength);
  const cipher = _nodeCrypto.default.createCipheriv(algorithm, Buffer.from(_env.default.SECRET_KEY, "hex"), iv);
  const ciphertext = Buffer.concat([cipher.update(value, "utf-8"), cipher.final()]);
  return Buffer.concat([iv, ciphertext]);
}

/**
 * Decrypt a buffer produced by `encrypt` back into its original string value.
 *
 * @param value A buffer containing the IV concatenated with the ciphertext.
 * @returns The decrypted plaintext value.
 */
function decrypt(value) {
  const iv = value.subarray(0, ivLength);
  const ciphertext = value.subarray(ivLength);
  const decipher = _nodeCrypto.default.createDecipheriv(algorithm, Buffer.from(_env.default.SECRET_KEY, "hex"), iv);
  return decipher.update(ciphertext, undefined, "utf-8") + decipher.final("utf-8");
}

/**
 * A decorator that transparently encrypts and decrypts the value of a database
 * column. Must be accompanied by a @Column(DataType.BLOB) annotation.
 */
function Encrypted(target, propertyKey) {
  // Ensure that the Encrypted decorator is the first decorator applied to the property, we can check
  // this by looking at the attributes of the target and checking if the propertyKey is already defined.
  if ((0, _sequelizeTypescript.getAttributes)(target)[propertyKey]) {
    _Logger.default.fatal(`The Encrypted decorator must be the first decorator applied to the property ${propertyKey} in ${target.constructor.name}`, new Error());
  }
  return {
    get() {
      const attributeOptions = (0, _sequelizeTypescript.getAttributes)(target);
      const defaultValue = attributeOptions[propertyKey].allowNull ? null : "";
      const previous = this.getDataValue(propertyKey);
      if (!previous) {
        return defaultValue;
      }
      try {
        const value = JSON.parse(decrypt(previous));

        // An empty object can be the result of a `null` column value, in which
        // case we return the default value instead.
        return (0, _compat.isEmpty)(value) && typeof value === "object" ? defaultValue : value;
      } catch (err) {
        const message = (0, _error.errToString)(err);
        if (message.includes("Unexpected end of JSON input")) {
          return defaultValue;
        }
        if (message.includes("bad decrypt")) {
          _Logger.default.fatal(`Failed to decrypt database column (${propertyKey}). The SECRET_KEY environment variable may have changed since installation.`, (0, _error.toError)(err));
        }
        throw err;
      }
    },
    set(value) {
      try {
        if ((0, _compat.isNil)(value)) {
          this.setDataValue(propertyKey, value);
        } else {
          this.setDataValue(propertyKey, encrypt(JSON.stringify(value)));
        }
      } catch (err) {
        if (err instanceof Error && err.message.includes("Invalid key length")) {
          _Logger.default.fatal(`Failed to encrypt database column (${propertyKey}). The SECRET_KEY environment variable is not the correct length.`, err);
        }
        throw err;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TS rejects PropertyDescriptor return for legacy decorator; descriptor is consumed by Sequelize at runtime.
  };
}