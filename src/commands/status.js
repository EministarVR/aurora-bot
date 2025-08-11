import { SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("status")
  .setDescription("Healthcheck & Latenz.");

export async function execute(interaction, client) {
  const sent = await interaction.reply({ content: "Check…", fetchReply: true });
  const latency = sent.createdTimestamp - interaction.createdTimestamp;
  const ws = Math.round(client.ws.ping);
  await interaction.editReply(`✅ OK | Bot: ${latency}ms | WS: ${ws}ms`);
}
