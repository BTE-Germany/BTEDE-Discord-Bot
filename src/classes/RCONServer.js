const rconClient = require("minecraft-server-util").RCON;

class RCONServer {
  constructor(config) {
    this.port = config?.port || 44966;
    this.host = config?.host || "127.0.0.1";
    this.timeout = config?.timeout || 5000;
    this.password = config?.password || "test";
    this.config = config;
    this._client = null;
    this.connected = false;
  }

  /**
   * Connect to the minecraft console
   * @returns {RCONServer}
   */
  async connect() {
    if (!this.config) throw new TypeError("No Config in RCONServer.js");

    this._client = new rconClient(this.host, {
      port: this.port,
      password: this.password,
      timeout: this.timeout,
    });
    try {
      await this._client.connect();
      this.connected = true;
      return this;
    } catch (error) {
      throw new TypeError(error);
    }
  }

  /**
   * Runs a command to the minecraft console
   * @param {String} command
   * @param {Boolean} noEnd
   */
  async run(command, noEnd = false) {
    if (!this.connected) await this.connect();
    if (!this._client)
      return new TypeError("You have to connect the RCON Server first.");

    try {
      let response = this._client.run(command);
      if (!noEnd) await this._client.close();
      return response;
    } catch (error) {
      await this._client.close();
      throw new TypeError(error);
    }
  }

  /**
   * Closes the connection to the server
   * @returns {Boolean}
   */
  async end() {
    await this._client.close();
    return true;
  }
}

module.exports = RCONServer;
