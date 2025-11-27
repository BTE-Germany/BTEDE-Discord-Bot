const levels = {
  info: "INFO",
  warn: "WARN",
  error: "ERROR",
};

const timestamp = () => new Date().toISOString();

const format = (level, message) => `[${timestamp()}] [${levels[level]}] ${message}`;

const info = (message, ...args) => console.log(format("info", message), ...args);
const warn = (message, ...args) => console.warn(format("warn", message), ...args);
const error = (message, ...args) => console.error(format("error", message), ...args);

module.exports = { info, warn, error };
