const fs = require("fs");
const path = require("path");

const defaults = require("./defaults");

const environment = (process.env.APP_ENV || process.env.NODE_ENV || "production").toLowerCase();
const isPlainObject = (value) => Object.prototype.toString.call(value) === "[object Object]";

const merge = (target, ...sources) => {
  const output = target || {};
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;

    for (const [key, value] of Object.entries(source)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        output[key] = value.slice();
      } else if (isPlainObject(value)) {
        output[key] = merge(isPlainObject(output[key]) ? output[key] : {}, value);
      } else {
        output[key] = value;
      }
    }
  }
  return output;
};

const loadConfigFile = (relativePath) => {
  const filePath = path.resolve(__dirname, "../../config", relativePath);
  if (!fs.existsSync(filePath)) return undefined;

  try {
    delete require.cache[filePath];
    return require(filePath);
  } catch (error) {
    console.warn(`Failed to load config/${relativePath}`, error);
    return undefined;
  }
};

const fileOverrides = {};

const optionalFiles = [
  { key: "federalPings", file: "federalPings.json" },
  { key: "emojis", file: "emojis.js" },
  { key: "federalSelect", file: "federalSelect.js" },
  { key: "welcomeMessage", file: "welcomeMessage.json" },
  { key: "whitelistedLinks", file: "whitelistedLinks.json" },
];

for (const { key, file } of optionalFiles) {
  const value = loadConfigFile(file);
  if (value !== undefined) {
    fileOverrides[key] = value;
  }
}

const envOverrides = {};

const setNestedValue = (pathKeys, value) => {
  if (value === undefined || value === "") return;
  let target = envOverrides;
  for (let index = 0; index < pathKeys.length - 1; index += 1) {
    const key = pathKeys[index];
    if (!isPlainObject(target[key])) target[key] = {};
    target = target[key];
  }
  target[pathKeys[pathKeys.length - 1]] = value;
};

const parseCommaList = (value) => {
  if (!value) return undefined;
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const parseBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (/^(true|1|yes|on)$/i.test(value)) return true;
  if (/^(false|0|no|off)$/i.test(value)) return false;
  return undefined;
};

const parseInteger = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseJSON = (value) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Failed to parse JSON from environment", error);
    return undefined;
  }
};

setNestedValue(["roles", "team"], process.env.ROLE_TEAM);
setNestedValue(["roles", "muted"], process.env.ROLE_MUTED);
setNestedValue(["roles", "german"], process.env.ROLE_GERMAN);
setNestedValue(["roles", "english"], process.env.ROLE_ENGLISH);
setNestedValue(["roles", "rules"], process.env.ROLE_RULES);
setNestedValue(["roles", "trial"], process.env.ROLE_TRIAL);
setNestedValue(["roles", "builder"], process.env.ROLE_BUILDER);
setNestedValue(["roles", "news"], process.env.ROLE_NEWS);
setNestedValue(["roles", "level3"], process.env.ROLE_LEVEL3);
setNestedValue(["roles", "support"], process.env.ROLE_SUPPORT);
setNestedValue(["roles", "duty"], process.env.ROLE_DUTY);
setNestedValue(["roles", "supportPing"], process.env.ROLE_SUPPORT_PING);
setNestedValue(["roles", "changelog"], process.env.ROLE_CHANGELOG);
setNestedValue(["roles", "staffFallback"], process.env.ROLE_STAFF_FALLBACK);
setNestedValue(["roles", "builderBase"], process.env.ROLE_BUILDER_BASE);
setNestedValue(["roles", "muteRemove"], parseCommaList(process.env.ROLES_MUTE_REMOVE));

setNestedValue(["channels", "suggestions"], process.env.CHANNEL_SUGGESTIONS);
setNestedValue(["channels", "modlog"], process.env.CHANNEL_MODLOG);
setNestedValue(["channels", "waitingRoom"], process.env.CHANNEL_WAITING_ROOM);
setNestedValue(["channels", "supportPing"], process.env.CHANNEL_SUPPORT_PING);
setNestedValue(
  ["channels", "usersRegistrationPings"],
  process.env.CHANNEL_USERS_REGISTRATION_PINGS
);
setNestedValue(["channels", "generalDE"], process.env.CHANNEL_GENERAL_DE);
setNestedValue(["channels", "voiceText"], process.env.CHANNEL_VOICE_TEXT);
setNestedValue(["channels", "linklog"], process.env.CHANNEL_LINKLOG);
setNestedValue(["channels", "chatlog"], process.env.CHANNEL_CHATLOG);
setNestedValue(["channels", "serverNavigation"], process.env.CHANNEL_SERVER_NAVIGATION);
setNestedValue(["channels", "buildingGuideEn"], process.env.CHANNEL_BUILDING_GUIDE_EN);
setNestedValue(["channels", "buildingGuideDe"], process.env.CHANNEL_BUILDING_GUIDE_DE);
setNestedValue(["channels", "supportQuestions"], process.env.CHANNEL_SUPPORT_QUESTIONS);

setNestedValue(["services", "cms", "baseUrl"], process.env.CMS_BASE_URL);
setNestedValue(["services", "cms", "channelMessagesPath"], process.env.CMS_CHANNEL_MESSAGES_PATH);
setNestedValue(["services", "cms", "botMessagesPath"], process.env.CMS_BOT_MESSAGES_PATH);
setNestedValue(["services", "google", "sheetsScope"], process.env.GOOGLE_SHEETS_SCOPE);

setNestedValue(["staffDc", "id"], process.env.STAFF_DC_GUILD_ID);

const statusConfig = parseJSON(process.env.STATUS_CONFIG);
if (Array.isArray(statusConfig)) {
  setNestedValue(["status"], statusConfig);
}

setNestedValue(["rcon", "lobby", "host"], process.env.RCON_LOBBY_HOST);
const rconLobbyPort = parseInteger(process.env.RCON_LOBBY_PORT);
if (rconLobbyPort !== undefined) {
  setNestedValue(["rcon", "lobby", "port"], rconLobbyPort);
}
setNestedValue(["rcon", "lobby", "password"], process.env.RCON_LOBBY_PASSWORD);

setNestedValue(["spreadsheets", "suggestions", "id"], process.env.SPREADSHEET_SUGGESTIONS_ID);
setNestedValue(
  ["spreadsheets", "suggestions", "range"],
  process.env.SPREADSHEET_SUGGESTIONS_RANGE
);
const suggestionsSheetId = parseInteger(process.env.SPREADSHEET_SUGGESTIONS_SHEET_ID);
if (suggestionsSheetId !== undefined) {
  setNestedValue(["spreadsheets", "suggestions", "sheetID"], suggestionsSheetId);
}

setNestedValue(["spreadsheets", "applications", "id"], process.env.SPREADSHEET_APPLICATIONS_ID);
setNestedValue(["spreadsheets", "applications", "range"], process.env.SPREADSHEET_APPLICATIONS_RANGE);
const applicationsSheetId = parseInteger(process.env.SPREADSHEET_APPLICATIONS_SHEET_ID);
if (applicationsSheetId !== undefined) {
  setNestedValue(["spreadsheets", "applications", "sheetID"], applicationsSheetId);
}

const welcomeMessage = parseBoolean(process.env.WELCOME_MESSAGE_ENABLED);
if (welcomeMessage !== undefined) {
  setNestedValue(["welcomeMessage"], welcomeMessage);
}

setNestedValue(["ignoreVCs"], parseCommaList(process.env.IGNORE_VC_IDS));
setNestedValue(["protectedUsers"], parseCommaList(process.env.PROTECTED_USER_IDS));

const baseConfig = merge({}, defaults, fileOverrides, envOverrides);

const runtimeOverrides = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  guild: process.env.DISCORD_GUILD_ID,
};

const mongoConnection = process.env.MONGO_URI;
if (mongoConnection) {
  runtimeOverrides.mongo = { string: mongoConnection };
}

const activeConfig = merge({}, baseConfig, runtimeOverrides);

activeConfig.environment = environment;

module.exports = activeConfig;



