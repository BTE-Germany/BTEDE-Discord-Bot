const {
  EmbedBuilder,
  InteractionType,
  ButtonStyle,
} = require("discord.js");
const BaseEvent = require("../classes/Event.js");
const buildRegistrationRows = require("../structures/registrationRows.js");
const googleBuilder = require("../functions/googleBuilder.js");

const mentionChannel = (id) => (id ? `<#${id}>` : "[configure channel]");

const REGISTRATION_STEPS = [
  "platform",
  "minecraft",
  "city",
  "federalState",
  "creationImages",
  "referenceImages",
  "coordinates",
];

const REQUIRED_REGISTRATION_FIELDS = [
  "id",
  "tag",
  "role",
  "platform",
  "minecraft",
  "city",
  "federalState",
  "creationImages",
  "referenceImages",
  "coordinates",
];

const resolveMember = async (interaction) => {
  if (interaction.member) return interaction.member;
  if (!interaction.guild) return null;

  const member = await resolveMember(interaction);
  if (!command.config.userAvailable) {
    const teamRoleId = client.config?.roles?.team;
    const fallbackRoleId = client.config?.roles?.staffFallback;
    const hasPermission =
      guildHasRole(member, teamRoleId) || guildHasRole(member, fallbackRoleId);

    if (!hasPermission) {
      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setDescription(":x: You don't have the required permissions to use this command.");

      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
      return;
    }
  }

  try {
    return await interaction.guild.members.fetch(interaction.user.id);
  } catch (error) {
    return null;
  }
};

const guildHasRole = (member, roleId) =>
  Boolean(roleId && member?.roles?.cache?.has(roleId));

const postRegistrationSummary = async (interaction, entry) => {
  await interaction.channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("Ueberblick")
        .setDescription(
          `**Discordname:**\n<@!${entry.id}> (${entry.tag})\n**Minecraftname:**\n${entry.minecraft}\n**Bauort:**\n${entry.city}\n**Bundesland:**\n${entry.federalState}\n**Koordinaten:**\n${entry.coordinates}`
        )
        .setTimestamp(),
    ],
  });
};

const handleChatInput = async (client, interaction) => {
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    const payload = {
      content: ":x: This command wasn't found.",
      ephemeral: true,
    };

    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
    return;
  }

  try {
    await interaction.deferReply();
  } catch (error) {
    client.Logger.warn(`Failed to defer reply: ${error.message}`);
  }

  await command.run(interaction, client);
};

const handleAutocomplete = async (client, interaction) => {
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  let query = "";
  try {
    const focused = interaction.options.getFocused(true);
    query = focused?.value ?? "";
  } catch (error) {
    query = interaction.options.getFocused() ?? "";
  }

  let suggestions = [];
  try {
    suggestions = (await command.queryHandler(query)) || [];
  } catch (error) {
    client.Logger.warn(`Autocomplete handler failed: ${error.message}`);
  }

  if (!Array.isArray(suggestions)) suggestions = [];
  await interaction.respond(suggestions.slice(0, 25));
};

const handleSelectMenu = async (client, interaction) => {
  if (interaction.customId !== "fdrl_selector") return;

  const selectConfig = client.config?.federalSelect || {};
  const selection = interaction.values || [];
  const removableRoles = Object.keys(selectConfig).filter(
    (key) => !selection.includes(key)
  );

  for (const state of selection) {
    const roleId = selectConfig[state];
    if (!roleId) {
      client.Logger.warn(`No State Role ID for: "${state}"`, "FEDERAL");
      continue;
    }

    await interaction.member.roles.add(roleId).catch(client.Logger.error);
  }

  for (const state of removableRoles) {
    const roleId = selectConfig[state];
    if (roleId && interaction.member.roles.cache.has(roleId)) {
      await interaction.member.roles.remove(roleId).catch(client.Logger.error);
    }
  }

  await interaction.deferUpdate();
};

const handleRegistrationButton = async (client, interaction) => {
  const teamRoleId = client.config?.roles?.team;
  if (teamRoleId && !guildHasRole(interaction.member, teamRoleId)) {
    await interaction.deferUpdate().catch(client.Logger.warn);
    return;
  }

  const entry = client.usersInCreateProcess.find(
    (candidate) => interaction.message.id === candidate.msg
  );
  if (!entry) {
    await interaction.deferUpdate().catch(client.Logger.warn);
    return;
  }

  if (entry.mod !== interaction.user.id) {
    await interaction
      .reply({
        content:
          "Only the person that started the registration can use this button.",
        ephemeral: true,
      })
      .catch(client.Logger.warn);
    return;
  }

  const step = interaction.customId.replace("cp_", "");

  if (step === "cancel") {
    client.usersInCreateProcess.delete(entry.id);
    await interaction
      .reply({ content: ":x: Canceled.", ephemeral: true })
      .catch(client.Logger.warn);
    await interaction.message.delete().catch(client.Logger.warn);
    return;
  }

  if (step === "onward") {
    entry.onward = !entry.onward;
  }

  if (step === "finish") {
    const missingField = REQUIRED_REGISTRATION_FIELDS.find(
      (field) => !entry[field]
    );

    if (missingField) {
      await interaction
        .reply({
          content: `:x: \`${missingField}\` is empty.`,
          ephemeral: true,
        })
        .catch(client.Logger.warn);
      return;
    }

    await finalizeRegistration(client, interaction, entry);
    return;
  }

  entry.step = step;
  client.usersInCreateProcess.set(entry.id, entry);

  const completedSteps = REGISTRATION_STEPS.filter((stepName) =>
    stepName === "platform" ? Boolean(entry.platform) : Boolean(entry[stepName])
  );

  await interaction.deferUpdate().catch(client.Logger.warn);
  await interaction.message.edit({
    components: buildRegistrationRows(entry.step, {
      onwardEnabled: Boolean(entry.onward),
      completedSteps,
    }),
  });
};

const finalizeRegistration = async (client, interaction, entry) => {
  try {
    if (entry.role === "builder") {
      const channelId = client.config?.channels?.usersRegistrationPings;
      const pingChannel = channelId
        ? client.channels.cache.get(channelId) ||
          (await client.channels.fetch(channelId).catch(() => null))
        : null;

      const pingRoles = client.config?.federalPings?.[entry.federalState] || [];

      if (pingChannel) {
        await pingChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Neuer Builder")
              .setDescription(
                `**Discordname:**\n<@!${entry.id}> (${entry.tag})\n**Minecraftname:**\n${entry.minecraft}\n**Bauort:**\n${entry.city}\n**Bundesland:**\n${entry.federalState}\n**Koordinaten:**\n${entry.coordinates}`
              )
              .setTimestamp(),
          ],
          content: pingRoles.length ? `<@!${pingRoles.join("> <@!")}>` : null,
        });
      }
    }
  } catch (error) {
    client.Logger.warn(`Failed to post builder ping: ${error.message}`);
  }



  const applicationsConfig = client.config?.spreadsheets?.applications;
  if (
    applicationsConfig?.id &&
    applicationsConfig?.range &&
    applicationsConfig?.sheetID !== null &&
    applicationsConfig?.sheetID !== undefined
  ) {
    try {
      await googleBuilder(
        applicationsConfig.id,
        applicationsConfig.range,
        applicationsConfig.sheetID,
        entry.platform ?? "",
        entry.minecraft ?? "",
        entry.tag ?? "",
        entry.creationImages ?? "",
        entry.referenceImages ?? "",
        entry.city ?? "",
        (entry.role === "trial" ? "TR" : entry.federalState) ?? "",
        entry.coordinates ?? "",
        interaction.user?.username ?? interaction.user?.tag ?? entry.mod ?? ""
      );
    } catch (error) {
      client.Logger.warn(`Failed to update applications sheet: ${error.message}`);
    }
  }

  await applyRoles(client, interaction, entry);
  client.usersInCreateProcess.delete(entry.id);

  await interaction
    .reply({ content: "✅ Successful.", ephemeral: true })
    .catch(client.Logger.warn);

  if (entry.role === "trial") {
    const navigationChannel = mentionChannel(client.config?.channels?.serverNavigation);
    const buildingGuideEn = mentionChannel(client.config?.channels?.buildingGuideEn);
    const buildingGuideDe = mentionChannel(client.config?.channels?.buildingGuideDe);
    const supportQuestionsChannel = mentionChannel(client.config?.channels?.supportQuestions);

    const trialMessage = [
      "```",
      `:flag_gb: Congratulations, you've been whitelisted as a Trial on the BTE Germany Minecraftserver! You can build on our server now. Apply again with your two new buildings to receive the builder role. You have two weeks until the Trial rank expires. The server IP and all important information about server navigation can be found in ${navigationChannel} and instructions and tips for building in ${buildingGuideEn}. If you have any other questions or problems, feel free to contact us on the server in ${supportQuestionsChannel}! Good Luck!`,
      "",
      `:flag_de: Glückwunsch, du wurdest als Trial auf dem BTE-Germany Minecraftserver gewhitelisted. Jetzt kannst du auf unserem Server vorbauen. Bewirb dich erneut mit deinen zwei Bewerbungsgebäuden, um die Builder-Rolle zu erhalten. Du hast zwei Wochen Zeit, bis der Trial-Rang abläuft. Die Server-IP und alle wichtigen Informationen zur Servernavigation findest du in ${navigationChannel} und eine Anleitung und Tipps zum Bauen in ${buildingGuideDe}. Falls du noch weitere Fragen oder Probleme hast, melde dich gerne bei uns auf dem Server in ${supportQuestionsChannel}! Viel Erfolg!`,
      "```",
    ].join("\n");

    await interaction.channel.send({ content: trialMessage });
  }

  if (entry.role === "rejected") {
    const buildingGuideEn = mentionChannel(client.config?.channels?.buildingGuideEn);
    const buildingGuideDe = mentionChannel(client.config?.channels?.buildingGuideDe);
    const supportQuestionsChannel = mentionChannel(client.config?.channels?.supportQuestions);

    const rejectionMessage = [
      "```",
      `:flag_gb: Unfortunately, we have to reject you, because ... Tips for building are in ${buildingGuideEn}. If you have any other questions or problems, feel free to contact us on the server in ${supportQuestionsChannel}! Good Luck!`,
      "",
      `:flag_de: Leider müssen wir dich ablehnen, da ... Außerdem findest du eine Anleitung und Tipps zum Bauen in ${buildingGuideDe}. Falls du noch weitere Fragen oder Probleme hast, melde dich gerne bei uns auf dem Server in ${supportQuestionsChannel}! Viel Erfolg!`,
      "```",
    ].join("\n");

    await interaction.channel.send({ content: rejectionMessage });
  }

  await postRegistrationSummary(interaction, entry);
  await interaction.message.delete().catch(client.Logger.warn);
};

const applyRoles = async (client, interaction, entry) => {
  const guildMember =
    interaction.guild?.members.cache.get(entry.id) ||
    (await interaction.guild?.members.fetch(entry.id).catch(() => null));

  if (!guildMember) return;

  await guildMember
    .setNickname(`${entry.minecraft} [${entry.city}, ${entry.federalState}]`)
    .catch(client.Logger.warn);

  const baseRole = client.config?.roles?.builderBase;
  if (baseRole) {
    await guildMember.roles.add(baseRole).catch(client.Logger.warn);
  }

  if (entry.role === "builder") {
    const builderRole = client.config?.roles?.builder;
    const trialRole = client.config?.roles?.trial;

    if (builderRole) {
      await guildMember.roles.add(builderRole).catch(client.Logger.warn);
    }

    if (trialRole && guildMember.roles.cache.has(trialRole)) {
      await guildMember.roles.add(trialRole).catch(client.Logger.warn);
    }
  } else if (entry.role === "trial") {
    const trialRole = client.config?.roles?.trial;
    if (trialRole) {
      await guildMember.roles.add(trialRole).catch(client.Logger.warn);
    }
  }
};

const handleNewsOptIn = async (client, interaction) => {
  const newsRoleId = client.config?.roles?.news;
  if (!newsRoleId) {
    await interaction.deferUpdate().catch(client.Logger.warn);
    return;
  }

  if (interaction.member.roles.cache.has(newsRoleId)) {
    await interaction.member.roles.remove(newsRoleId).catch(client.Logger.warn);
  } else {
    await interaction.member.roles.add(newsRoleId).catch(client.Logger.warn);
  }

  await interaction.deferUpdate().catch(client.Logger.warn);
};

const handleButton = async (client, interaction) => {
  if (interaction.customId.startsWith("cp_")) {
    await handleRegistrationButton(client, interaction);
    return;
  }

  if (interaction.customId === "btede_socials_ping") {
    await handleNewsOptIn(client, interaction);
  }
};

module.exports = class extends BaseEvent {
  constructor() {
    super("interactionCreate");
  }

  /**
   * @param {import("discord.js").Interaction} interaction
   */
  async run(client, interaction) {
    try {
      if (interaction.type === InteractionType.ApplicationCommand) {
        await handleChatInput(client, interaction);
        return;
      }

      if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
        await handleAutocomplete(client, interaction);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        await handleSelectMenu(client, interaction);
        return;
      }

      if (interaction.isButton()) {
        await handleButton(client, interaction);
      }
    } catch (error) {
      client.Logger.error(`Interaction handler error: ${error.message}`);
    }
  }
};




