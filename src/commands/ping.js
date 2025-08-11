// src/commands/ping.js
import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { t, currentLocale } from "../util/i18n.js";

export const category = "Info";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Zeigt die Latenz an.")
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur für dich anzeigen (ephemeral)")
  );

function fmtUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return `${d}d ${h}h ${m}m ${s}s`;
}

function latencyStatus(ms) {
  if (ms <= 100) return "🟢";
  if (ms <= 250) return "🟡";
  return "🔴";
}

export async function execute(interaction, client) {
  const locale = currentLocale();
  const ephemeral = interaction.options.getBoolean("privat") ?? true;

  const sent = await interaction.reply({
    content: t("ping.checking", {}, locale),
    fetchReply: true,
    ephemeral,
  });
  const botLatency = sent.createdTimestamp - interaction.createdTimestamp;
  const wsLatency = Math.round(client.ws.ping);
  const shardId = interaction.guild?.shardId ?? 0;
  const up = fmtUptime(client.uptime ?? 0);

  const embed = new EmbedBuilder()
    .setTitle(t("ping.title", {}, locale))
    .setDescription(t("ping.desc", {}, locale))
    .addFields(
      {
        name: t("ping.bot", {}, locale),
        value: `${latencyStatus(botLatency)} ${botLatency}ms`,
        inline: true,
      },
      {
        name: t("ping.ws", {}, locale),
        value: `${latencyStatus(wsLatency)} ${wsLatency}ms`,
        inline: true,
      },
      { name: t("ping.shard", {}, locale), value: `#${shardId}`, inline: true },
      { name: t("ping.uptime", {}, locale), value: up, inline: true }
    )
    .setTimestamp();

  await interaction.editReply({ content: null, embeds: [embed] });
}
