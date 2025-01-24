# BTEDE-Discord-Bot

BTE Germany Discord Bot

This readme is a work in progress. It describes the available commands and some of the structure and features of the
bot.

## Commands:

### Generally available

| Command       | Effect                                                   | Options                                                                                                                                                                                                  | aliases                                                         |
|---------------|----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------|
| `/activity`   | Starts an activity in the callers voice channel          | -help<br/>-youtube<br/>-poker<br/>-betrayal<br/>-fish<br/>-chess<br/>-artist<br/>-awkword<br/>-delete<br/>-doodle<br/>-sketch<br/>-letter<br/>-word<br/>-spell<br/>-checkers<br/>-8s<br/>-putt<br/>-land | -                                                               |
| `/gif`        | Sends a gif, depending on the option                     | -tpll<br />-install<br />-measure                                                                                                                                                                        | -installgif<br/>-install<br/>-howtoinstall<br/>-installationgif |
| `/help`       | Lists all commands or diplay help for a specific command | Name of any command                                                                                                                                                                                      | -hilfe                                                          |
| `/playerlist` | Shows the players currently building on the server       | -                                                                                                                                                                                                        | -players<br/>-list                                              |
| `/status`     | Shows the status of the minecraft servers                | -                                                                                                                                                                                                        | -serverstatus<br/>-server-status                                |

### Team

| Command       | Effect                                           | Options                                                                                                                                                                                                  |
|---------------|--------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `/ban user`   | Bans a user via mention                          | user, duration, reason                                                                                                                                                                                   |
| `/ban id`     | Bans a user via user ID                          | user, duration, reason                                                                                                                                                                                   |
| `/banner`     | Set a new banner for the discord server          | image                                                                                                                                                                                                    |
| `/case id`    | Looks up a case                                  | case-id                                                                                                                                                                                                  |
| `/cases user` | Looks up a users cases via mention               | user                                                                                                                                                                                                     |
| `/cases id`   | Looks up a users cases via user ID               | user                                                                                                                                                                                                     |
| `/changelog`  | Creates a changelog to post to a channel         | channel, title, subtitle1, content1, (subtitle2), ..., (content7)                                                                                                                                        |
| `/duty`       | Get or remove a support duty                     |                                                                                                                                                                                                          |
| `/kick user`  | Kicks a user via mention                         | user, reason                                                                                                                                                                                             |
| `/kick id`    | Kicks a user via user ID                         | user, reason                                                                                                                                                                                             |
| `/lock`       | Locks a channel                                  | (channel)                                                                                                                                                                                                |
| `/mute user`  | Mutes a user via mention                         | user, duration, reason                                                                                                                                                                                   |
| `/mute id`    | Mutes a user via user ID                         | user, duration, reason                                                                                                                                                                                   |
| `/new`        | Registers a new builder or trial                 | user                                                                                                                                                                                                     |
| `/schematic`  | Manages schematics on the MC servers             | -upload [schematic, sterra, (comment)]<br/>-list [terra<br/>-download [terra, schematic, (comment)]<br/>-transfer [fromserver, toserver, schematic, (comment)]<br/>-delete [terra, schematic, (comment)] |
| `/unban`      | Unbans a user                                    | user, reason                                                                                                                                                                                             |
| `/unlock`     | Unlocks a channel                                | (channel)                                                                                                                                                                                                |
| `/unmute`     | Unmutes a user                                   | user, reason                                                                                                                                                                                             |
| `/warn user`  | Warns a user via mention                         | user, reason                                                                                                                                                                                             |
| `/warn id`    | Warns a user via user ID                         | user, reason                                                                                                                                                                                             |
| `/welcome`    | Dis- or enables welcome messages for the server. |                                                                                                                                                                                                          |

For `/commands` see [Dynamically defined](#dynamically-defined)

#### Suggestions

| Command      | Effect                   | Options             |
|--------------|--------------------------|---------------------|
| `/accept`    | Accepts a suggestion     | suggestion-id, text |
| `/consider`  | Considers a suggestion   | suggestion-id, text |
| `/delete`    | Deletes a suggestion     | suggestion-id       |
| `/inprocess` | Inprocesses a suggestion | suggestion-id, text |
| `/reject`    | Rejects a suggestion     | suggestion-id, text |

### Dynamically defined

Team members have the option of adding and removing commands using `/command`.
These are dynamically loaded and are stored in .json files with the commands name inside `/src/lang/de` and
`/src/lang/en`, depending on the language of the command, and in `/config/infoCommands.json`.

To view a list of commands either check these files on the server running the bot or use the `/help` command to get the
full list.

Adding a command is done with `/commands add {commandname} {english-title} {english-description} {german-title}
{german-description}`.<br>
To edit an existing command use `/commands edit {commandname} {language} {type} {text}`, where `type` refers to whether
you are editing the title or the description.<br>
Deletion can be done with `/commands delete {commandname}`.

## Events

### guildMemberAdd

### interaction

### message

### ready

Initializes the bot and registers the handlers.

### voiceStateUpdate

## Handlers

### Bans

Checks the bans saved in the database for their expiry date and revokes them once that date is reached.

### instagram

### Mutes

### youtube

## TODO:

* /activity hat keine Vorschläge für die Options
* /gif tpll nicht verfügbar
* Anpassen der Ban-Dauer ermöglichen