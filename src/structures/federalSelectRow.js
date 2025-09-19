const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = new ActionRowBuilder().addComponents(
  new StringSelectMenuBuilder()
    .setMaxValues(16)
    .setPlaceholder("Select a Federal State")
    .setCustomId("fdrl_selector")
    .addOptions([
      {
        label: "Baden-Wuerttemberg",
        value: "bw",
        emoji: "<:bw:710142581178105926>",
        description: "Baden-Wuerttemberg",
      },
      {
        label: "Bayern",
        value: "by",
        emoji: "<:by:710142541617430579>",
        description: "Bayern",
      },
      {
        label: "Berlin",
        value: "be",
        description: "Berlin",
        emoji: "<:be:710142553382584430>",
      },
      {
        label: "Brandenburg",
        description: "Brandenburg",
        value: "bb",
        emoji: "<:bb:710142563327410176>",
      },
      {
        label: "Bremen",
        description: "Bremen",
        value: "hb",
        emoji: "<:hb:710142572349227119>",
      },
      {
        label: "Hamburg",
        description: "Hamburg",
        value: "hh",
        emoji: "<:hh:710142590607163463>",
      },
      {
        label: "Hessen",
        description: "Hessen",
        value: "he",
        emoji: "<:he:710142599083720775>",
      },
      {
        label: "Mecklenburg-Vorpommern",
        description: "Mecklenburg-Vorpommern",
        value: "mv",
        emoji: "<:mv:710142608411852880>",
      },
      {
        label: "Niedersachsen",
        description: "Niedersachsen",
        value: "ni",
        emoji: "<:ni:710142617077153904>",
      },
      {
        label: "Nordrhein-Westfalen",
        description: "Nordrhein-Westfalen",
        value: "nw",
        emoji: "<:nw:710142757678612500>",
      },
      {
        label: "Rheinland-Pfalz",
        description: "Rheinland-Pfalz",
        value: "rp",
        emoji: "<:rp:710142849705836554>",
      },
      {
        label: "Saarland",
        description: "Saarland",
        value: "sl",
        emoji: "<:sl:710142658613608549>",
      },
      {
        label: "Sachsen",
        description: "Sachsen",
        value: "sn",
        emoji: "<:sn:725672858159808592>",
      },
      {
        label: "Sachsen-Anhalt",
        description: "Sachsen-Anhalt",
        value: "st",
        emoji: "<:st:710142635809046570>",
      },
      {
        label: "Schleswig-Holstein",
        description: "Schleswig-Holstein",
        value: "sh",
        emoji: "<:sh:710142667853398038>",
      },
      {
        label: "Thueringen",
        description: "Thueringen",
        value: "th",
        emoji: "<:th:710142690875932816>",
      },
    ])
);
