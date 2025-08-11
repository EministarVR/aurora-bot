// src/commands/serverinfo.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { nf } from "../util/format.js";

export const category = "Info";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Infos über diesen Server.")
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur für dich anzeigen (ephemeral)")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const ephemeral = interaction.options.getBoolean("privat") ?? true;
  const g = interaction.guild;

  await g.fetch(); // Owner & MemberCount aktuell halten

  const owner = await g.fetchOwner().catch(() => null);
  const textChannels = g.channels.cache.filter((c) => c.type === 0).size; // GuildText
  const voiceChannels = g.channels.cache.filter((c) => c.type === 2).size; // GuildVoice
  const emojis = g.emojis.cache.size;
  const roles = g.roles.cache.size;
  const boosts = g.premiumSubscriptionCount || 0;
  const tier = g.premiumTier || 0;

  const embed = new EmbedBuilder()
    .setTitle(t("serverinfo.title", { name: g.name }, locale))
    .setThumbnail(g.iconURL({ size: 256 }))
    .addFields(
      { name: t("serverinfo.id", {}, locale), value: g.id, inline: true },
      {
        name: t("serverinfo.owner", {}, locale),
        value: owner ? `${owner.user.tag}` : "?",
        inline: true,
      },
      {
        name: t("serverinfo.members", {}, locale),
        value: nf(g.memberCount, locale),
        inline: true,
      },
      {
        name: t("serverinfo.roles", {}, locale),
        value: nf(roles, locale),
        inline: true,
      },
      {
        name: t("serverinfo.channels", {}, locale),
        value: `${nf(textChannels, locale)} 📝 / ${nf(
          voiceChannels,
          locale
        )} 🔊`,
        inline: true,
      },
      {
        name: t("serverinfo.emojis", {}, locale),
        value: nf(emojis, locale),
        inline: true,
      },
      {
        name: t("serverinfo.boosts", {}, locale),
        value: `${nf(boosts, locale)} (Tier ${tier})`,
        inline: true,
      },
      {
        name: t("serverinfo.created", {}, locale),
        value: `<t:${Math.floor(g.createdTimestamp / 1000)}:R>`,
        inline: true,
      }
    )
    .setColor(tier >= 3 ? "Purple" : tier === 2 ? "Fuchsia" : "Grey")
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral });
}
