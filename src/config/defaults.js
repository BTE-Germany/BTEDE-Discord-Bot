const defaults = {
  environment: "development",
  BOT_TOKEN: "",
  guild: "",
  mongo: {
    string: "",
  },
  federalPings: {},
  roles: {
    team: "",
    muted: "",
    muteRemove: [],
    german: "",
    english: "",
    rules: "",
    trial: "",
    builder: "",
    news: "",
    level3: "",
    support: "",
    duty: "",
    supportPing: "",
    changelog: "",
    staffFallback: "",
    builderBase: "",
  },
  emojis: {},
  federalSelect: {},
  staffDc: {
    id: "",
  },
  channels: {
    suggestions: "",
    modlog: "",
    waitingRoom: "",
    supportPing: "",
    usersRegistrationPings: "",
    generalDE: "",
    voiceText: "",
    linklog: "",
    chatlog: "",
    serverNavigation: "",
    buildingGuideEn: "",
    buildingGuideDe: "",
    supportQuestions: "",
  },
  services: {
    cms: {
      baseUrl: "https://cms.bte-germany.de",
      channelMessagesPath: "/items/channelmessages",
      botMessagesPath: "/items/botmessages",
    },
    google: {
      sheetsScope: "https://www.googleapis.com/auth/spreadsheets",
    },
  },
  status: [],
  rcon: {},
  spreadsheets: {
    suggestions: {
      id: "",
      range: "",
      sheetID: null,
    },
    applications: {
      id: "",
      range: "",
      sheetID: null,
    },
  },
  welcomeMessage: false,
  whitelistedLinks: [],
  ignoreVCs: [],
  protectedUsers: [],
};

module.exports = defaults;


