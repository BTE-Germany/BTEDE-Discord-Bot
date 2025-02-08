const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const Command = require("../../classes/Command.js");
const Bot = require("../../classes/Bot.js");

module.exports = class extends Command {
  constructor(client) {
    super(client, {
      name: "changelog",
      description: "Öffnet ein Eingabefeld, um einen Changelog zu senden.",
      userAvailable: false,
    });
  }

  /**
   * @param {CommandInteraction} interaction
   * @param {Bot} client
   */
  async run(interaction, client) {
    const modal = new ModalBuilder()
      .setTitle("Changelog erstellen")
      .setCustomId("changelog");

    // Eingabefeld für den Titel des Changelogs
    const titleInput = new TextInputBuilder()
      .setCustomId("title")
      .setPlaceholder("Titel des Embeds")
      .setLabel("Titel")
      .setStyle(TextInputStyle.Short)
      .setMaxLength(200)
      .setRequired(true);

    // Eingabefeld für Änderungen des Staffs
    const staffInput = new TextInputBuilder()
      .setCustomId("staff")
      .setPlaceholder("Staff Änderungen (z. B. Teamänderungen, wichtige Infos)")
      .setLabel("Staff")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(450)
      .setRequired(false);

    // Eingabefeld für Änderungen auf Discord oder Minecraft
    const changesInput = new TextInputBuilder()
      .setCustomId("changes")
      .setPlaceholder("Änderungen auf Discord oder Minecraft (kombiniert)")
      .setLabel("Discord & Minecraft Changes")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(450)
      .setRequired(false);

    // Eingabefeld für Meeting-Protokolle
    const protocolsInput = new TextInputBuilder()
      .setCustomId("meetingProtocols")
      .setPlaceholder("Zusammenfassung von Meetings")
      .setLabel("Meeting Protocols")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(450)
      .setRequired(false);

    // Eingabefeld für allgemeine Informationen oder Spenden-Infos
    const generalInput = new TextInputBuilder()
      .setCustomId("general")
      .setPlaceholder("Allgemeine Informationen oder Spenden-Infos")
      .setLabel("General & Donations")
      .setStyle(TextInputStyle.Paragraph)
      .setMaxLength(450)
      .setRequired(false);

    // Action Rows für jedes Eingabefeld
    const titleRow = new ActionRowBuilder().addComponents(titleInput);
    const staffRow = new ActionRowBuilder().addComponents(staffInput);
    const changesRow = new ActionRowBuilder().addComponents(changesInput);
    const protocolsRow = new ActionRowBuilder().addComponents(protocolsInput);
    const generalRow = new ActionRowBuilder().addComponents(generalInput);

    // Hinzufügen der Action Rows zum Modal
    modal.addComponents(titleRow, staffRow, changesRow, protocolsRow, generalRow);

    // Modal anzeigen
    await interaction.showModal(modal);
  }
};
