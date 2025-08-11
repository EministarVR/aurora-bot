import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { onCooldown } from "../util/cooldown.js";

export const data = new SlashCommandBuilder()
  .setName("say")
  .setDescription("Schickt eine Nachricht als Aurora.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addStringOption((o) =>
    o.setName("text").setDescription("Nachricht").setRequired(true)
  )
  .addChannelOption((o) =>
    o
      .setName("channel")
      .setDescription("Ziel-Channel")
      .addChannelTypes(ChannelType.GuildText)
  );

export async function execute(interaction) {
  const cd = onCooldown(interaction.user.id, "say", 5);
  if (cd)
    return interaction.reply({ ephemeral: true, content: `Cooldown: ${cd}s` });

  const text = interaction.options.getString("text");
  const channel =
    interaction.options.getChannel("channel") || interaction.channel;

  await channel.send({ content: text });
  return interaction.reply({
    ephemeral: true,
    content: `Gesendet nach #${channel.name}`,
  });
}
