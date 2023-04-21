const BaseEvent = require("../classes/Event");
const {
  MessageEmbed,
  Message,
  MessageActionRow,
  MessageButton,
} = require("discord.js");
const Bot = require("../classes/Bot.js");
const googleSuggestions = require("../functions/googleSuggestions.js");
const { default: axios } = require("axios");
const steps = [
  "minecraft",
  "city",
  "federalState",
  "creationImages",
  "referenceImages",
  "coordinates",
];
// const wash = require("washyourmouthoutwithsoap");

function generateDesc(titles, title) {
  let desc = "";
  if (titles[title].punkte.length != 0) {
    titles[title].punkte.forEach((p) => {
      desc = `${desc}\n${p}`;
    });
  }
  return desc;
}

class MessageEvent extends BaseEvent {
  constructor() {
    super("messageCreate");
  }

  /**
   * @param {Bot} client
   * @param {Message} msg
   */

  async run(client, msg) {
    if (msg.author.bot) return;

    // only guilds
    if (!msg.guild)
      return msg.reply({
        content: ":x: This bot only works on guilds.",
        components: [
          new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle("LINK")
              .setLabel("BTE Germany Server")
              .setURL(
                "https://discord.com/channels/692825222373703772/742824476869132328"
              )
          ),
        ],
      });

    if (msg.guild.id != client.config.guild) return;

    // changelog
    if (msg.content.startsWith("!changelog")) {
      if (!msg.member.roles.cache.get("700788505936396388"))
        return msg.reply({
          embeds: [
            new MessageEmbed()
              .setDescription(":x: Du hast keine Rechte auf diesen Befehl.")
              .setColor("RED"),
          ],
        });

      var channel = msg.content
        .split(" ")[1]
        .replace("<", "")
        .replace(">", "")
        .replace("#", "");

      var changelogEmbed = new MessageEmbed()
        .setColor("#0366fc")
        .setFooter("\u00ac BTE Germany - 2022")
        .setTimestamp()
        .setTitle(msg.content.split(" ").slice(2).join(" ").split(" !| ")[0])
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/702235118374223912/922567410731606106/logo.gif"
        );

      var titles = {};

      var _x = 0;
      msg.content
        .split(" !| ")
        .slice(1)
        .forEach((bereich) => {
          var _bereich = bereich;
          var punkte = [];
          var header = bereich.split(" | ")[0];

          var numt = 1;
          while (_bereich.includes(" | ")) {
            punkte.push(bereich.split(" | ")[numt]);
            numt++;
            _bereich = _bereich.replace(" | ", "");
          }

          titles[_x] = {
            header: header,
            punkte: punkte,
          };
          _x++;
        });

      for (let title in titles) {
        var r = generateDesc(titles, title);
        if (!r || r === undefined || r === null)
          return msg.reply({
            content: "Eine \u00dcberschrift hat keinen Unterpunkt",
          });
        changelogEmbed.addField(
          titles[title].header,
          generateDesc(titles, title),
          false
        ).catc;
      }
      msg.guild.channels.cache.get(channel).send({ embeds: [changelogEmbed] });
      return msg.delete();
    }

    // user registration
    if (msg.member.roles.cache.get(client.config.roles.team)) {
      let cData = client.usersInCreateProcess.find(
        (x) => x.channel === msg.channel.id && x.mod === msg.author.id
      );
      if (cData && cData?.step) {
        let content = msg.content.toUpperCase();
        if(content = "BEDROCK") cData.platform = "Bedrock"
        else if (content = "JAVA") cData.platform = "Java"
        else return msg.reply(":x: This plaform does not exist.");
      }
      if (cData && cData?.step) {
        // federal state / trial / rejected
        if (cData.step === "federalState") {
          let content = msg.content.toUpperCase();
          if (content === "TR") cData.role = "trial";
          else if (content === "RE") cData.role = "rejected";
          else if (!client.config.federalPings[content])
            return msg.reply(":x: This federal state does not exist.");
        }

        // minecraft name lookup
        if (cData.step === "minecraft") {
          if(cData.platform === "Java") {
          if (!/^[A-Za-z0-9_]{3,16}$/gm.test(msg.content))
            return msg.reply(":x: This is not a valid minecraft username.");
          let uuid = await axios
            .get(
              `https://api.mojang.com/users/profiles/minecraft/${msg.content.trim()}`
            )
            .catch(client.Logger.warn);
          if (!uuid || !uuid?.data || !uuid?.data?.id)
            return msg
              .reply(":x: Couldn't find this minecraft account.")
              .catch(client.Logger.warn);
          cData.uuid = uuid.data.id;
          msg.channel.send({
            content: `https://crafatar.com/renders/body/${uuid?.data?.id}?overlay=true `,
          });
        }
        else if(cData.plaftform === "Bedrock") {
          let xuid = await axios
            .get(
              `https://api.geysermc.org/v2/xbox/xuid${msg.content.trim()}`
            )
            .catch(client.Logger.warn);
          if (!xuid || !xuid?.data || !xuid?.data?.xuid)
              return msg
                .reply(":x: Couldn't find this mincraft account.")
                .catch(client.Logger.warn);
          
          let realxuid = xuid.data.xuid.toString();
          let uuid = `00000000-0000-0000-${realxuid.substring(0, 4)}-${realxuid.substring(5, -1)}`;
          cData.uuid = uuid;
          msg.channel.send({
            content: `https://mc-heads.net/body/${realxuid}/`
          });
        }
        else {
          msg.reply(":x: You have not selected a platform.")
        }
        }
      

        cData[cData.step] = msg.content;

        // edit buttons
        let m = await msg.channel.messages
          .fetch(cData.msg)
          .catch(client.Logger.warn);
        if (!m) return msg.reply(":x: Error: Couldn't Fetch Message");

        // update buttons
        let sRow = m.components;
        let selectRow = sRow;
        selectRow.forEach(async (row) => {
          row.components.forEach((component) => {
            if (
              component.customId === `cp_${cData.step}` &&
              component.style === "PRIMARY"
            ) {
              component.setStyle("SUCCESS");
            }
          });
        });

        // onward
        if (cData.onward) {
          let currentStepIndex = steps.indexOf(cData.step);
          if (currentStepIndex != steps.length) {
            if (steps[currentStepIndex + 1]) {
              cData.step = steps[currentStepIndex + 1];

              selectRow.forEach(async (row) => {
                row.components.forEach((component) => {
                  if (component.customId === `cp_${cData.step}`) {
                    component.setStyle("PRIMARY");
                  }
                });
              });
            }
          }
        }

        m.edit({ components: selectRow });

        // save data
        client.usersInCreateProcess.delete(cData.id);
        client.usersInCreateProcess.set(cData.id, cData);

        // delete information
        await msg.delete();
      }
    }

   /*
    let content = msg.content.toLowerCase();

if (content.includes("http://") || content.includes("https://")) {
      if (
        (msg.channel.id === client.config.channels.voiceText &&
          !(
            msg.member.roles.cache.get(client.config.roles.trial) ||
            msg.member.roles.cache.get(client.config.roles.builder)
          )) ||
        (msg.channel.id != client.config.channels.voiceText &&
          !msg.member.roles.cache.get(client.config.roles.level3))
      ) {
        let args = content
          .split(" ")
          .filter((x) => x.startsWith("http://") || x.startsWith("https://"));
        let links = [];
        args.forEach((arg) =>
          links.push(
            arg.startsWith("https://")
              ? arg
              : arg.replace("http://", "https://")
          )
        );
        let whitelisted = false;

        links.forEach((link) => {
          client.config.whitelistedLinks.forEach((wl) => {
            if (link.startsWith(wl)) whitelisted = true;
          });
        });
        if (whitelisted === false) {
          let sent = await msg
            .reply(":x: You are not allowed to send links in this chat!")
            .catch((e) => {});
          setTimeout(() => {
            if (sent) sent.delete();
          }, 3e4);
          await msg.delete().catch((e) => {});
          let log = await client.channels.fetch(client.config.channels.linklog);
          if (log)
            log.send({
              embeds: [
                new MessageEmbed()
                  .setColor("#ff0000")
                  .setTimestamp()
                  .setFooter(
                    msg.guild.name,
                    msg.guild.iconURL({ dynamic: true })
                  )
                  .setTitle(":wastebasket: Message Deleted")
                  .addFields([
                    {
                      name: "👤 User",
                      value: `<@!${msg.author.id}> (${msg.author.tag})`,
                      inline: true,
                    },
                    {
                      name: "⏰ Timestamp",
                      value: `<t:${Math.round(
                        msg.createdTimestamp / 1000
                      )}:f> (<t:${Math.round(msg.createdTimestamp / 1000)}:R>)`,
                      inline: true,
                    },
                    {
                      name: "💬 Message",
                      value: `\`${msg.content}\``,
                    },
                  ])
                  .setAuthor({
                    name: msg.author.username,
                    iconURL: msg.author.avatarURL({ dynamic: true }),
                  }),
              ],
            });

          return;
        }
      }
    }
    
    */

    // suggestions
    if (msg.channel.id === client.config.channels.suggestions) {
      if (msg.author.bot) return;

      let suggestionsCount = await client.schemas.suggestion.countDocuments();
      let suggId = suggestionsCount + 1 + 255;

      let suggestionEmbed = new MessageEmbed()
        .setFooter("© BTE-Germany")
        .setTimestamp()
        .setColor("#9cada9")
        .setAuthor(
          msg.member?.nickname?.split(" [")?.[0] || msg.author.username,
          msg.author.avatarURL({ dynamic: true })
        )
        .setDescription(`**#${suggId}** - ${msg.content.trim()}`)
        .addField("Status", "Open", false);

      // send suggestion embed
      msg.channel.send({ embeds: [suggestionEmbed] }).then(async (message) => {
        let suggestionDb = new client.schemas.suggestion({
          id: suggId,
          userid: msg.author.id,
          messageid: message.id,
        });

        // suggestion to spreadsheet
        await googleSuggestions(
          client.config.spreadsheets.suggestions.id,
          client.config.spreadsheets.suggestions.range,
          client.config.spreadsheets.suggestions.sheetID,

          suggId,
          "open",
          null,
          null,
          msg.author.username,
          msg.content
        );

        // start suggestuion thread
        await message
          .startThread({
            name: `${suggId} - Discussion`,
            reason: "Suggestion discussion",
            autoArchiveDuration: "MAX",
          })
          .catch(client.Logger.warn);

        // ghost ping in thread
        message?.thread
          ?.send(`<@!${msg.author.id}>`)
          .then((mp) => mp.delete().catch((e) => {}))
          .catch((e) => {});

        // save suggestion db
        await suggestionDb.save();

        // delete original message
        msg.delete().catch(client.Logger.error);

        // dm embed
        let suggCreatedEmbed = new MessageEmbed()
          .setDescription(
            `You're suggestion (\`${suggId}\`) in ${msg.guild.name} was created, you can find it [here](${message.url}).`
          )
          .setColor("GREEN");

        // dm
        msg.member.send({ embeds: [suggCreatedEmbed] }).catch((e) => {});

        // reactions
        message.react("👍");
        message.react("👎");
      });
    }
  }
}

module.exports = MessageEvent;
