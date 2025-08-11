import { SlashCommandBuilder } from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { nf } from "../util/format.js";
import { createEmbed } from "../util/embed.js";

export const data = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Infos über Aurora.");

export async function execute(interaction, client) {
  try {
    const locale = currentLocale();
    const guilds = client.guilds.cache.size;
    const usersCached = client.users.cache.size;

    const embed = createEmbed(0x5865f2) // oder weglassen/variabel setzen
      .setTitle(t("about.title", {}, locale))
      .setDescription(t("about.desc", {}, locale))
      .addFields(
        {
          name: t("about.servers", {}, locale),
          value: nf(guilds, locale),
          inline: true,
        },
        {
          name: t("about.users", {}, locale),
          value: nf(usersCached, locale),
          inline: true,
        }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch {
    await interaction
      .reply({ content: t("common.error"), ephemeral: true })
      .catch(() => {});
  }
}
