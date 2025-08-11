// src/commands/slowmode.js
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits as Perms,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { sendLog } from "../util/webhook.js";

export const category = "Moderation";

export const data = new SlashCommandBuilder()
  .setName("slowmode")
  .setDescription("Setzt den Slowmode im aktuellen Kanal.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((o) =>
    o
      .setName("sekunden")
      .setDescription("0–21600")
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(21600)
  )
  .addChannelOption((o) =>
    o
      .setName("channel")
      .setDescription("Ziel-Channel (optional)")
      .addChannelTypes(
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread
      )
  )
  .addStringOption((o) => o.setName("grund").setDescription("Grund (optional)"))
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur dir bestätigen (ephemeral)")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const seconds = interaction.options.getInteger("sekunden");
  const target =
    interaction.options.getChannel("channel") || interaction.channel;
  const reason =
    interaction.options.getString("grund") ||
    t("slowmode.noReason", {}, locale);
  const ephemeral = interaction.options.getBoolean("privat") ?? true;

  // Bot-Rechte im Zielchannel prüfen
  const me = interaction.guild.members.me;
  const perms = target.permissionsFor(me);
  if (!perms?.has(Perms.ManageChannels) || !perms?.has(Perms.ViewChannel)) {
    return interaction.reply({
      ephemeral: true,
      content: t("slowmode.errorPerms", {}, locale),
    });
  }

  // Kann der Channel Slowmode?
  if (typeof target.setRateLimitPerUser !== "function") {
    return interaction.reply({
      ephemeral: true,
      content: t("slowmode.errorChannel", {}, locale),
    });
  }

  const before = target.rateLimitPerUser ?? 0;

  try {
    await target.setRateLimitPerUser(
      seconds,
      `/${interaction.commandName} by ${interaction.user.tag} • ${reason}`
    );
  } catch {
    return interaction.reply({
      ephemeral: true,
      content: t("slowmode.errorFailed", {}, locale),
    });
  }

  const embed = new EmbedBuilder()
    .setTitle(t("slowmode.title", {}, locale))
    .setDescription(
      seconds === 0
        ? t("slowmode.resetDesc", { mod: interaction.user.tag }, locale)
        : t(
            "slowmode.setDesc",
            { sec: seconds, mod: interaction.user.tag },
            locale
          )
    )
    .addFields(
      {
        name: t("slowmode.channel", {}, locale),
        value: `<#${target.id}>`,
        inline: true,
      },
      {
        name: t("slowmode.before", {}, locale),
        value: `${before}s`,
        inline: true,
      },
      {
        name: t("slowmode.after", {}, locale),
        value: `${seconds}s`,
        inline: true,
      },
      { name: t("slowmode.reason", {}, locale), value: reason, inline: false }
    )
    .setColor(seconds === 0 ? "Grey" : "Orange")
    .setTimestamp();

  // Öffentliche Info in Zielchannel
  await target.send({ embeds: [embed] }).catch(() => {});

  // Mod-Bestätigung
  await interaction.reply({
    content: t("slowmode.ok", { sec: seconds }, locale),
    ephemeral,
  });

  // Log
  await sendLog({
    title: "Slowmode",
    description: seconds === 0 ? "Reset" : "Set",
    fields: [
      { name: "Channel", value: `#${target.name} (${target.id})` },
      { name: "Before", value: `${before}s` },
      { name: "After", value: `${seconds}s` },
      { name: "Mod", value: interaction.user.tag },
      { name: "Reason", value: reason },
    ],
  });
}
