const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = [
  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Java / Bedrock")
      .setCustomId("cp_platform")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Minecraft Name")
      .setCustomId("cp_minecraft")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("City")
      .setCustomId("cp_city")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Federal State")
      .setCustomId("cp_federalState")
      .setStyle(ButtonStyle.Secondary),
  ]),

  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Creation Images")
      .setCustomId("cp_creationImages")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Reference Images")
      .setCustomId("cp_referenceImages")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("Coordinates")
      .setEmoji("❌")
      .setCustomId("cp_coordinates")
      .setStyle(ButtonStyle.Secondary),
  ]),

  new ActionRowBuilder().addComponents([
    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("FINISH")
      .setCustomId("cp_finish")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("CANCEL")
      .setCustomId("cp_cancel")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setDisabled(false)
      .setLabel("AUTO-ONWARD")
      .setEmoji("⏱")
      .setCustomId("cp_onward")
      .setStyle(ButtonStyle.Success),
  ]),
];
