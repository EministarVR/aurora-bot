import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { t, currentLocale } from "../util/i18n.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Zeigt Hilfe & verfügbare Commands."); // statisch, Reply via i18n

export async function execute(interaction, client) {
  const locale = currentLocale();

  // Commands nach Kategorie sortieren, falls data.category gesetzt
  const commandsByCategory = {};
  for (const cmd of client.commands.values()) {
    const category = cmd.category || t("help.uncategorized", {}, locale);
    if (!commandsByCategory[category]) commandsByCategory[category] = [];
    commandsByCategory[category].push(cmd);
  }

  // Sortierte Kategorien
  const sortedCats = Object.keys(commandsByCategory).sort();

  let desc = "";
  for (const cat of sortedCats) {
    const cmds = commandsByCategory[cat]
      .map(
        (c) =>
          `</${c.data.name}:${c.data.id ?? ""}> — ${t(
            c.data.description,
            {},
            locale
          )}`
      )
      .join("\n");
    desc += `**${cat}**\n${cmds}\n\n`;
  }

  const totalCount = client.commands.size;

  const embed = new EmbedBuilder()
    .setTitle(t("help.title", { count: totalCount }, locale))
    .setDescription(desc || t("help.noCommands", {}, locale))
    .setFooter({ text: t("help.footer", {}, locale) })
    .setColor("Aqua")
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
