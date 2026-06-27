"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
if (process.env.NODE_ENV !== "test") {
  // oxlint-disable-next-line @typescript-eslint/no-var-requires
  require("@dotenvx/dotenvx").config({
    silent: true,
    ignore: ["MISSING_ENV_FILE"]
  });
}
require("../storage/database");
require("../storage/redis");