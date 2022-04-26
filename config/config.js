module.exports = {
  mongo: require("./database.js"),
  BOT_TOKEN: "",
  federalPings: require("./federalPings.json"),
  roles: {
    team: "730814049830436864",
    muted: "801881199344746496",
    muteRemove: [
      "796375512754815007",
      "796375653431246888",
      "709805597863968799",
      "697198852507435070",
      "703172621792968775",
      "692841045901312081",
      "730500813159530609",
      "730500380542107778",
      "720431347369508866",
      "723835603845644288",
      "730500008968978533",
    ],
    german: "796375512754815007",
    english: "796375653431246888",
    rules: "709805597863968799",
    trial: "703172621792968775",
    builder: "692841045901312081",
    news: "822806473532243989",
    level3: "730500380542107778",
  },
  emojis: require("./emojis.js"),
  yt: {
    channel: "792906025363570698",
    messageTemplate:
      "<a:btede:853745991525859338> | <:YouTube:792909049078349854> **{author}** uploaded a new youtube video: **{title}**!\n{url}",
    channel_id: "UCwT_NzvItuHf6_YPz08jwdg",
    watchInterval: 30000,
  },
  insta: {
    user_id: "",
    api_host: "",
    api_key: "",
    api_url: "",
    channel: "792906025363570698",
  },
  federalSelect: require("./federalSelect.js"),
  guild: "692825222373703772",
  staffDc: {
    id: "",
  },
  infoCommands: require("./infoCommands.json"),
  channels: {
    suggestions: "805522979135946803",
    modlog: "735926520014700604",
    waitingRoom: "698308464979607662",
    supportPing: "705100250901119056",
    usersRegistrationPings: "724289548388925533", // #leute-zum-anschreiben
    generalDE: "693402225493671949", // #general-deutch
    voiceText: "796502589374070804",
    linklog: "959365217651949588",
    chatlog: "795750958914994186",
  },
  status: [
    {
      ip: "192.168.10.1",
      port: 1,
      id: "Terra 1",
    },
    {
      ip: "192.168.10.1",
      port: 2,
      id: "Terra 2",
    },
    {
      ip: "192.168.10.1",
      port: 3,
      id: "Terra 3",
    },
    {
      ip: "192.168.10.1",
      port: 4,
      id: "Terra 4",
    },
    {
      ip: "1192.168.10.1",
      port: 5,
      id: "Terra 5",
    },
    {
      ip: "192.168.10.1",
      port: 6,
      id: "Terra 6",
    },
    {
      ip: "192.168.10.1",
      port: 7,
      id: "Lobby",
    },
  ],
  rcon: {
    lobby: {
      host: "192.168.10.1",
      port: 8,
      password: "",
    },
  },
  spreadsheets: {
    suggestions: {
      id: "",
      range: "",
      sheetID: 187,
    },
    applications: {
      id: "",
      range: "",
      sheetID: 187,
    },
  },
  welcomeMessage: require("./welcomeMessage.json"),
  whitelistedLinks: require("./whitelistedLinks.json"),

  ignoreVCs: [
    "732987283434897438",
    "730813714088853645",
    "867378580241907752",
    "701187448918769694",
    "835241313950629929",
    "692825223699103837",
    "738468648724987977",
    "803999390791893074",
    "712938379318394910",
    "702607996747776170",
  ],
};
