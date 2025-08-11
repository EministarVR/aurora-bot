import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { sendLog } from "../util/webhook.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Bannt einen User.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .addUserOption((o) =>
    o.setName("user").setDescription("Ziel").setRequired(true)
  )
  .addIntegerOption((o) =>
    o
      .setName("tage")
      .setDescription("Tage Nachrichten löschen (0–7)")
      .setMinValue(0)
      .setMaxValue(7)
  )
  .addStringOption((o) => o.setName("grund").setDescription("Grund"))
  .addBooleanOption((o) =>
    o
      .setName("dm")
      .setDescription("Benachrichtigung per DM senden (Standard: ja)")
  );

export async function execute(interaction) {
  const target = interaction.options.getUser("user");
  const delDays = interaction.options.getInteger("tage") ?? 0;
  const reason =
    interaction.options.getString("grund") || "Kein Grund angegeben";
  const sendDM = interaction.options.getBoolean("dm") ?? true;

  // Checks
  if (target.id === interaction.user.id)
    return interaction.reply({
      ephemeral: true,
      content: "❌ Du kannst dich nicht selbst bannen.",
    });

  if (target.id === interaction.client.user.id)
    return interaction.reply({
      ephemeral: true,
      content: "❌ Du kannst den Bot nicht bannen.",
    });

  const member = await interaction.guild.members
    .fetch(target.id)
    .catch(() => null);
  if (!member)
    return interaction.reply({
      ephemeral: true,
      content: "❌ Nutzer nicht gefunden.",
    });

  if (!member.bannable)
    return interaction.reply({
      ephemeral: true,
      content: "⚠️ Dieser Nutzer kann nicht gebannt werden.",
    });

  // DM an User
  if (sendDM) {
    const dmEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setAuthor({
        name: "Ban-Benachrichtigung",
        iconURL: "https://cdn.discordapp.com/emojis/1404408090375225446.png",
      }) // banned emoji
      .setDescription(`Du wurdest von **${interaction.guild.name}** gebannt.`)
      .addFields(
        { name: "Grund", value: reason, inline: false },
        { name: "Moderator", value: interaction.user.tag, inline: false }
      )
      .setTimestamp();
    try {
      await target.send({ embeds: [dmEmbed] });
    } catch {}
  }

  // Ban ausführen
  try {
    await interaction.guild.bans.create(target.id, {
      deleteMessageDays: delDays,
      reason,
    });
  } catch (err) {
    console.error(err);
    return interaction.reply({
      ephemeral: true,
      content: "❌ Ban fehlgeschlagen.",
    });
  }

  // Öffentliche Embed-Nachricht
  const publicEmbed = new EmbedBuilder()
    .setColor(0xff0000)
    .setAuthor({
      name: "User gebannt",
      iconURL: "https://cdn.discordapp.com/emojis/1404408090375225446.png",
    }) // banned emoji
    .addFields(
      { name: "👤 User", value: `${target.tag}`, inline: true },
      { name: "🛡️ Moderator", value: interaction.user.tag, inline: true },
      { name: "📄 Grund", value: reason, inline: false }
    )
    .setTimestamp();

  await interaction.reply({ embeds: [publicEmbed] });

  // Log per Webhook (detailliert)
  await sendLog({
    title: "Ban",
    description: `${target.tag} gebannt.`,
    fields: [
      { name: "User", value: `${target.tag} (${target.id})` },
      { name: "Moderator", value: interaction.user.tag },
      { name: "Grund", value: reason },
      { name: "Tage Nachrichten gelöscht", value: `${delDays}` },
      {
        name: "Server",
        value: `${interaction.guild.name} (${interaction.guild.id})`,
      },
    ],
  });
}
