const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

/**
 * Builds the registration button rows for the application workflow.
 * @param {string|null} activeStep
 * @param {{ onwardEnabled?: boolean }} options
 */
const buildRegistrationRows = (
  activeStep,
  { onwardEnabled, completedSteps = [] } = {}
) => {
  const completed = new Set(completedSteps);

  const resolveStyle = (id, baseStyle = ButtonStyle.Secondary) => {
    if (activeStep === id) return ButtonStyle.Primary;
    if (completed.has(id)) return ButtonStyle.Success;
    return baseStyle;
  };

  const rows = [];

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Java / Bedrock")
        .setCustomId("cp_platform")
        .setStyle(resolveStyle("platform")),
      new ButtonBuilder()
        .setLabel("Minecraft Name")
        .setCustomId("cp_minecraft")
        .setStyle(resolveStyle("minecraft")),
      new ButtonBuilder()
        .setLabel("City")
        .setCustomId("cp_city")
        .setStyle(resolveStyle("city")),
      new ButtonBuilder()
        .setLabel("Federal State")
        .setCustomId("cp_federalState")
        .setStyle(resolveStyle("federalState"))
    )
  );

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Creation Images")
        .setCustomId("cp_creationImages")
        .setStyle(resolveStyle("creationImages")),
      new ButtonBuilder()
        .setLabel("Reference Images")
        .setCustomId("cp_referenceImages")
        .setStyle(resolveStyle("referenceImages")),
      new ButtonBuilder()
        .setLabel("Coordinates")
        .setEmoji("❌")
        .setCustomId("cp_coordinates")
        .setStyle(resolveStyle("coordinates"))
    )
  );

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("FINISH")
        .setCustomId("cp_finish")
        .setStyle(resolveStyle("finish", ButtonStyle.Danger)),
      new ButtonBuilder()
        .setLabel("CANCEL")
        .setCustomId("cp_cancel")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setLabel("AUTO-ONWARD")
        .setEmoji("⏱")
        .setCustomId("cp_onward")
        .setStyle(onwardEnabled ? ButtonStyle.Success : ButtonStyle.Danger)
    )
  );

  return rows;
};

module.exports = buildRegistrationRows;
