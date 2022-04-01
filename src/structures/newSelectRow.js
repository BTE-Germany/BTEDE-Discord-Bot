const { MessageActionRow, MessageButton } = require("discord.js");

module.exports = [
  new MessageActionRow().addComponents([
    new MessageButton()
      .setDisabled(false)
      .setLabel("Java / Bedrock")
      .setCustomId("cp_platform")
      .setStyle("SUCCESS"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("Minecraft Name")
      .setCustomId("cp_minecraft")
      .setStyle("SECONDARY"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("City")
      .setCustomId("cp_city")
      .setStyle("SECONDARY"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("Federal State")
      .setCustomId("cp_federalState")
      .setStyle("SECONDARY"),
  ]),

  new MessageActionRow().addComponents([
    new MessageButton()
      .setDisabled(false)
      .setLabel("Creation Images")
      .setCustomId("cp_creationImages")
      .setStyle("SECONDARY"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("Reference Images")
      .setCustomId("cp_referenceImages")
      .setStyle("SECONDARY"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("Coordinates")
      .setEmoji(":x:")
      .setCustomId("cp_coordinates")
      .setStyle("SECONDARY"),
  ]),

  new MessageActionRow().addComponents([
    new MessageButton()
      .setDisabled(false)
      .setLabel("FINISH")
      .setCustomId("cp_finish")
      .setStyle("DANGER"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("CANCEL")
      .setCustomId("cp_cancel")
      .setStyle("DANGER"),

    new MessageButton()
      .setDisabled(false)
      .setLabel("AUTO-ONWARD")
      .setEmoji("⏱")
      .setCustomId("cp_onward")
      .setStyle("SUCCESS"),
  ]),
];
