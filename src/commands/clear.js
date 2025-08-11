import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { sendLog } from "../util/webhook.js";
import { onCooldown } from "../util/cooldown.js";

export const data = new SlashCommandBuilder()
  .setName("clear")
  .setDescription("Löscht Nachrichten im aktuellen Channel.") // Slash-Desc bleibt statisch
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .addIntegerOption((o) =>
    o
      .setName("anzahl")
      .setDescription("1–100")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  );

export async function execute(interaction) {
  const locale = currentLocale();

  const cd = onCooldown(interaction.user.id, "clear", 5);
  if (cd) {
    return interaction.reply({
      content: t("clear.cooldown", { seconds: cd }, locale),
      ephemeral: true,
    });
  }

  const amount = interaction.options.getInteger("anzahl");

  await interaction.deferReply({ ephemeral: true });
  const deleted = await interaction.channel
    .bulkDelete(amount, true)
    .catch(() => null);

  if (!deleted) {
    return interaction.editReply(t("clear.error", {}, locale));
  }

  // Embed im Channel
  const embed = new EmbedBuilder()
    .setTitle(t("clear.embedTitle", {}, locale))
    .setDescription(
      t(
        "clear.embedDesc",
        {
          count: deleted.size,
          mod: interaction.user.tag,
        },
        locale
      )
    )
    .addFields(
      {
        name: t("clear.channel", {}, locale),
        value: `<#${interaction.channel.id}>`,
        inline: true,
      },
      {
        name: t("clear.messages", {}, locale),
        value: `${deleted.size}`,
        inline: true,
      }
    )
    .setColor("Orange")
    .setTimestamp();

  // Öffentliche Info in Channel
  await interaction.channel.send({ embeds: [embed] }).catch(() => {});

  // Ephemeral Rückmeldung für den Mod
  await interaction.editReply(
    t("clear.success", { count: deleted.size }, locale)
  );

  // Log per Webhook
  await sendLog({
    title: "Clear",
    description: `${deleted.size} Nachrichten gelöscht.`,
    fields: [
      { name: "Moderator", value: interaction.user.tag },
      { name: "Channel", value: `#${interaction.channel.name}` },
      { name: "Anzahl", value: `${deleted.size}` },
    ],
  });
}
