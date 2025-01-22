# BTEDE-Discord-Bot

BTE Germany Discord Bot

`This readme is a work in progress.`

## Commands:
### Generally available

| Command       | Effect                                                   | Options                                                                                                                                                                                                  | aliases                                                         |
|---------------| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `/activity`   | Starts an activity in the callers voice channel          | -help<br/>-youtube<br/>-poker<br/>-betrayal<br/>-fish<br/>-chess<br/>-artist<br/>-awkword<br/>-delete<br/>-doodle<br/>-sketch<br/>-letter<br/>-word<br/>-spell<br/>-checkers<br/>-8s<br/>-putt<br/>-land | -                                                               |
| `/gif`        | Sends a gif, depending on the option                     | -tpll<br />-install<br />-measure                                                                                                                                                            | -installgif<br/>-install<br/>-howtoinstall<br/>-installationgif |
| `/help`       | Lists all commands or diplay help for a specific command | Name of any command                                                                                                                                                                                      | -hilfe                                                          |
| `/playerlist` | Shows the players currently building on the server       | -                                                                                                                                                                                                        | -players<br/>-list                                              |
| `/status`     | Shows the status of the minecraft servers                | -                                                                                                                                                                                                        | -serverstatus<br/>-server-status                                |

### Team

### Suggestions

### Dynamically defined
Team members have the option of adding and removing commands using `/command`.
These are dynamically loaded and are stored in .json files with the commands name inside `/src/lang/de` and `/src/lang/en`, depending on the language of the command, and in `/config/infoCommands.json`.

To view a list of commands either check these files on the server running the bot or use the `/help` command to get the full list.

Adding a command is done with `/commands add {commandname} {english-title} {english-description} {german-title}
{german-description}`.<br>
To edit an existing command use `/commands edit {commandname} {language} {type} {text}`, where `type` refers to whether you are editing the title or the description.<br>
Deletion can be done with `/commands delete {commandname}`.

## TODO:

* /activity hat keine Vorschläge für die Options
* /gif tpll nicht verfügbar
