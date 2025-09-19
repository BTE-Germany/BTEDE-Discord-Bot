const { Console } = require("console");
const kleur = require("kleur");
const path = require("path");

class Logger extends Console {
  constructor() {
    super(process.stdout, process.stderr);
  }

  /**
   * @param {String} input
   */
  info(input, type = "INFO") {
    const prefix = kleur.bold().cyan(`${this.date()} - [ ${type} ] => `);
    const mess = prefix + this.stringify(input);
    this.log(mess);
  }

  /**
   * @param {String|Error|any} input
   */
  error(input) {
    const prefix = kleur.bold().red(`${this.date()} - [ ERROR ] => `);
    const location = this.getCallerLocation();
    const formatted = this.formatPayload(input, location);
    super.error(prefix + formatted);
  }

  /**
   * @param {String|Error|any} input
   */
  warn(input) {
    const prefix = kleur.bold().yellow(`${this.date()} - [ WARN ] => `);
    const mess = prefix + this.stringify(input);
    super.warn(mess);
  }

  date(msTimeStamp = Date.now()) {
    const date = new Date(msTimeStamp);

    let minutes = date.getMinutes().toString();
    if (minutes.length === 1) minutes = `0${minutes}`;

    let seconds = date.getSeconds().toString();
    if (seconds.length === 1) seconds = `0${seconds}`;

    return `[ ${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()} - ${date.getHours()}:${minutes}:${seconds} ]`;
  }

  formatPayload(input, location) {
    const suffix = location ? this.formatLocation(location) : "";

    if (input instanceof Error) {
      const stack = input.stack || input.message || String(input);
      if (!suffix) {
        return stack;
      }

      const lines = stack.split("\n");
      if (lines.length === 0) {
        return `${stack} ${suffix}`.trim();
      }

      lines[0] = `${lines[0]} ${suffix}`.trim();
      return lines.join("\n");
    }

    const message = this.stringify(input);
    if (!suffix) {
      return message;
    }

    if (typeof message === "string" && message.includes(location)) {
      return message;
    }

    return `${message} ${suffix}`.trim();
  }

  stringify(input) {
    if (typeof input === "string") {
      return input;
    }

    if (input instanceof Error) {
      return input.stack || input.message || String(input);
    }

    try {
      return JSON.stringify(input);
    } catch (error) {
      return String(input);
    }
  }

  formatLocation(location) {
    if (!location) {
      return "";
    }
    return location.startsWith("(") ? location : `(${location})`;
  }

  getCallerLocation() {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    try {
      Error.prepareStackTrace = (_, structuredStackTrace) => structuredStackTrace;
      const stack = new Error().stack;
      if (!Array.isArray(stack)) {
        return null;
      }

      for (const frame of stack) {
        const fileName = frame.getFileName();
        if (!fileName) {
          continue;
        }

        if (fileName === __filename) {
          continue;
        }

        const relativeFile = path.relative(process.cwd(), fileName);
        const line = frame.getLineNumber();
        const column = frame.getColumnNumber();

        return `${relativeFile}:${line}:${column}`;
      }

      return null;
    } catch (error) {
      return null;
    } finally {
      Error.prepareStackTrace = originalPrepareStackTrace;
    }
  }
}

module.exports = Logger;
