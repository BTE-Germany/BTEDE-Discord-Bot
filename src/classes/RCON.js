const util = require("minecraft-server-util");
const RCONServer = require("./RCONServer.js");

class RCON {
  constructor(hosts) {
    this.hosts = hosts;
  }

  get Lobby() {
    if (!this.hosts) throw new TypeError("No hosts in RCON");

    return new RCONServer(this.hosts?.["lobby"]);
  }
}

module.exports = RCON;
