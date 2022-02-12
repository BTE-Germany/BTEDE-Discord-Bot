const BaseEvent = require("../classes/Event");
const { MessageEmbed, Message, MessageActionRow, MessageButton } = require("discord.js")
const Bot = require("../classes/Bot.js");
const googleSuggestions = require("../functions/googleSuggestions.js");
const { default: axios } = require("axios");
const steps = ["minecraft", "city", "federalState", "creationImages", "referenceImages", "coordinates"];
//cli color
var clc = require("cli-color");
//google bad word list
const wash = require('washyourmouthoutwithsoap');
//import dotenv
require('dotenv').config()

class MessageEvent extends BaseEvent {
    constructor() {
        super('messageCreate');
    };

    /**
     * @param {Bot} client 
     * @param {Message} msg 
     */

    async run(client, msg) {
        if(msg.author.bot) return;
        if(!msg.guild) return msg.reply({ content: ":x: This bot only works on guilds.", components: [ new MessageActionRow().addComponents(new MessageButton().setStyle("LINK").setLabel("BTE Germany Server").setURL("https://discord.com/channels/692825222373703772/742824476869132328"))]})

        // user registration
        if(msg.member.roles.cache.get(client.config.roles.team)) {
            let cData = client.usersInCreateProcess.find(x => x.channel === msg.channel.id && x.mod === msg.author.id);
            if(cData && cData?.step) {

                // federal state / trial / rejected
                if(cData.step === "federalState") {
                    let content = msg.content.toUpperCase();
                    if(content === "TR") cData.role = "trial";
                    else if(content === "RE") cData.role = "rejected";
                    else if(!client.config.federalPings[content]) return msg.reply(":x: This federal state does not exist.");
                };

                // minecraft name lookup
                if(cData.step === "minecraft") {
                    if(!(/^[A-Za-z0-9_]{3,16}$/gm.test(msg.content))) return msg.reply(":x: This is not a valid minecraft username.");
                    let uuid = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${msg.content.trim()}`).catch(client.Logger.warn)
                    if(!uuid || !uuid?.data || !uuid?.data?.id) return msg.reply(":x: Couldn't find this minecraft account.").catch(client.Logger.warn);
                    cData.uuid = uuid.data.id;
                                        msg.channel.send({ content: `https://crafatar.com/renders/body/${uuid?.data?.id}?overlay=true `});
                };

                cData[cData.step] = msg.content;

                //moderate links and bad words
                //make it lowercase
  let msgcontent = msg.content.toLowerCase();
  //define meber
    const member = msg.member;
  
     //embed message for links
     const linkembed = new Discord.MessageEmbed()
     .setTitle("Moderation!")
     .setAuthor(msg.author.tag, msg.author.avatarURL, msg.author.avatarURL)
     .setColor('#ff0000')
     .setDescription(`Der/Die Benutzer/-in hat ohne Berechtigungen einen Link veröffentlicht! (${msgcontent})`)
     .setTimestamp()
     //embed message for bad words
     const badwordembed = new Discord.MessageEmbed()
     .setTitle("Moderation!")
     .setAuthor(msg.author.tag, msg.author.avatarURL, msg.author.avatarURL)
     .setColor('#ff0000')
     .setDescription(`Der/Die Benutzer/-in hat was schlechtes gesagt! (${msgcontent})`)
     .setTimestamp()
  
   //http links
   if (msgcontent.includes("http://")) {
    if (member.roles.cache.has(process.env.URLROLE||process.env.WHITEROLE)){
    }
    //exclude google
      else{
        if(msgcontent.includes("http://google.com"||"http://google.de"||"http://buildtheearth.net"||"http://bte-germany.de"||"http://map.bte-germany.de"||"http://tenor.com"||"http://imgur.com"||"http://instagram.com/buildtheearthgermany"||"http://www.youtube.com/channel/UCwT_NzvItuHf6_YPz08jwdg"||"http://www.twitch.tv/bte_germany"||"http://discord.gg/GkSxGTYaAJ"||"http://discord.gg/3mrQBYd")){
          msg.react('✅');
        }else{
          //delete Message
          client.channels.cache.get(process.env.LOG).send({embeds: [linkembed]});
          msg.delete();
          console.log(clc.red("Link gelöscht!"));
        }
      }
      }
        

      //same with https://
      if (msgcontent.includes("https://")) {
        if (member.roles.cache.has(process.env.URLROLE||process.env.WHITEROLE)){
        }
        //exclude google
          else{
            if(msgcontent.includes("https://google.com"||"https://google.de"||"https://buildtheearth.net"||"https://bte-germany.de"||"https://map.bte-germany.de"||"https://tenor.com"||"https://imgur.com"||"https://instagram.com/buildtheearthgermany"||"https://www.youtube.com/channel/UCwT_NzvItuHf6_YPz08jwdg"||"https://www.twitch.tv/bte_germany"||"https://discord.gg/GkSxGTYaAJ"||"https://discord.gg/3mrQBYd")){
              msg.react('✅');
            }else{
              //delete Message
              client.channels.cache.get(process.env.LOG).send({embeds: [linkembed]});
              msg.delete();
              console.log(clc.red("Link gelöscht!"));
            }
          }
          }
            //check if bad word de
            let messageprof = wash.check('de', msgcontent);
            //check if bad word en
            let messageprofen = wash.check('en', msgcontent);
            //delete if bad word de
            if (messageprof === true){
              client.channels.cache.get(process.env.LOG).send({embeds: [badwordembed]});
              msg.delete();
              console.log(clc.red("Böse Nachricht gelöscht!"));
            }
            //delete if bad word en
            if (messageprofen === true){
              client.channels.cache.get(process.env.LOG).send({embeds: [badwordembed]});
              msg.delete();
              console.log(clc.red("Böse Nachricht gelöscht!"));
            }
                
                // edit buttons
                let m = await msg.channel.messages.fetch(cData.msg).catch(client.Logger.warn);
                if(!m) return msg.reply(":x: Error: Couldn't Fetch Message");

                // update buttons
                let sRow = m.components;
                let selectRow = sRow;
                selectRow.forEach(async row => {
                    row.components.forEach(component => {
                        if(component.customId === `cp_${cData.step}` && component.style === "PRIMARY") {
                            component.setStyle("SUCCESS");
                        };
                    });
                });

                // onward
                if(cData.onward) {
                    let currentStepIndex = steps.indexOf(cData.step);
                    if(currentStepIndex != steps.length) {
                        if(steps[currentStepIndex+1]) {
                            cData.step = steps[currentStepIndex+1];

                            selectRow.forEach(async row => {
                                row.components.forEach(component => {
                                    if(component.customId === `cp_${cData.step}`) {
                                        component.setStyle("PRIMARY");
                                    };
                                });
                            });
                        };
                    };
                };


                m.edit({ components: selectRow });

                // save data
                client.usersInCreateProcess.delete(cData.id);
                client.usersInCreateProcess.set(cData.id, cData);

                // delete information
                await msg.delete();
            };
        };

        // suggestions
        if(msg.channel.id === client.config.suggestionsChannel) {
            if(msg.author.bot) return;
            
            let suggestionsCount = await client.schemas.suggestion.countDocuments()
            let suggId = suggestionsCount+1+255;

            let suggestionEmbed = new MessageEmbed()
                .setFooter("© BTE-Germany")
                .setTimestamp().setColor("#9cada9")
                .setAuthor(msg.member?.nickname?.split(" [")?.[0] || msg.author.username, msg.author.avatarURL({ dynamic: true }))
                .setDescription(`**#${suggId}** - ${msg.content.trim()}`)
                .addField("Status", "Open", false)

            // send suggestion embed
            msg.channel.send({ embeds: [ suggestionEmbed ]}).then(async message => {
                let suggestionDb = new client.schemas.suggestion({
                    id: suggId,
                    userid: msg.author.id,
                    messageid: message.id
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
                    msg.content,
                );

                // start suggestuion thread
                await message.startThread({
                    name: `${suggId} - Discussion`,
                    reason: "Suggestion discussion",
                    autoArchiveDuration: "MAX"
                }).catch(client.Logger.warn)

                // ghost ping in thread
                message?.thread?.send(`<@!${msg.author.id}>`).then(mp => mp.delete().catch(e => {})).catch(e => {})

                // save suggestion db
                await suggestionDb.save();

                // delete original message
                msg.delete().catch(client.Logger.error);

                // dm embed
                let suggCreatedEmbed = new MessageEmbed()
                    .setDescription(`You're suggestion (\`${suggId}\`) in ${msg.guild.name} was created, you can find it [here](${message.url}).`)
                    .setColor("GREEN")

                // dm
                msg.member.send({ embeds: [ suggCreatedEmbed ] }).catch(e => { });

                // reactions
                message.react("👍");
                message.react("👎");
            })

        }
    };
};

module.exports = MessageEvent;