import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("uptime")
  .setDescription("Zeigt die Laufzeit des Bots.");

export async function execute(interaction, client) {
  const ms = client.uptime ?? 0;
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / (1000 * 60)) % 60;
  const h = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  await interaction.reply({
    ephemeral: true,
    content: `⏱️ Uptime: ${d}d ${h}h ${m}m ${s}s`,
  });
}
