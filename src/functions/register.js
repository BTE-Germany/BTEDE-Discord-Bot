const { Collection } = require("mongoose");
const   path = require("path"),
        fs = require("fs").promises,
        BaseEvent = require("../classes/Event.js"),
        BaseCommand = require("../classes/Command.js"),
        Bot = require("../classes/Bot.js");

/**
 * 
 * @param {Bot} client 
 * @param {String} dir 
 */

async function registerEvents(client, dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for(const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if(stat.isDirectory()) registerEvents(client, path.join(dir, file));
        if(file.endsWith('.js')) {
            const Event = require(path.join(filePath, file));
            if(Event.prototype instanceof BaseEvent) {
                const event = new Event();
                client.on(event.name, event.run.bind(event, client));
            };
        };
    };
};

/**
 * 
 * @param {Bot} client 
 * @param {String} dir 
 * @returns {Collection}
 */

async function registerCommands(client, dir = '') {
    const filePath = path.join(__dirname, dir);
    const files = await fs.readdir(filePath);
    for(const file of files) {
        const stat = await fs.lstat(path.join(filePath, file));
        if(stat.isDirectory()) registerCommands(client, path.join(dir, file));
        if(file.endsWith('.js')) {
            const Command = require(path.join(filePath, file));
            if(Command.prototype instanceof BaseCommand) {
                const cmd = new Command(client)
                if(!cmd.config) return client.Logger.error(`${cmd.help.name} has no config`);
                client.commands.set(cmd.help.name, cmd);
            };
        };
    };
};

/**
 * 
 * @param {Bot} client 
 * @param {String} dir 
 */

async function registerInfoCommands(client, dir = '') {
    let InfoCommand = require("../classes/InfoCommand.js")
    client.config.infoCommands.forEach(infoCommand => {
        try {
            let cmdLang = require(`../lang/en/${infoCommand}.json`)
            if(!cmdLang) throw new TypeError("No Language files for "+infoCommand + ".")
            if(!cmdLang["t"]) throw new TypeError("No TITLE in language file for "+infoCommand + ".")
            if(!cmdLang["d"]) throw new TypeError("No DESCRIPTION in language file for "+infoCommand + ".")
            const cmd = new InfoCommand(client, infoCommand, cmdLang["t"])
            client.commands.set(cmd.help.name, cmd)
        } catch(error) {
            throw new TypeError("No Language files for "+infoCommand + ".")
        }
    })
};

module.exports = { registerCommands, registerEvents, registerInfoCommands };