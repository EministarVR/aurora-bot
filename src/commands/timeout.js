// src/commands/timeout.js
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { sendLog } from "../util/webhook.js";

const MAX_MS = 28 * 24 * 60 * 60 * 1000; // 28 Tage

function parseDuration(str) {
  if (!str) return null;
  const s = String(str).trim().toLowerCase();
  if (s === "0" || s === "off" || s === "none" || s === "cancel") return 0;
  const m = /^(\d+)\s*(s|m|h|d)$/.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  const mult =
    m[2] === "s"
      ? 1000
      : m[2] === "m"
      ? 60000
      : m[2] === "h"
      ? 3600000
      : 86400000;
  return n * mult;
}

export const category = "Moderation";

export const data = new SlashCommandBuilder()
  .setName("timeout")
  .setDescription("Timeout für einen User.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addUserOption((o) =>
    o.setName("user").setDescription("Ziel").setRequired(true)
  )
  .addStringOption((o) =>
    o
      .setName("dauer")
      .setDescription("z.B. 10m, 1h, 1d | 0/off zum Entfernen")
      .setRequired(true)
  )
  .addStringOption((o) => o.setName("grund").setDescription("Grund (optional)"))
  .addBooleanOption((o) =>
    o
      .setName("dm")
      .setDescription("Benachrichtigung per DM senden (Standard: ja)")
  )
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur dir bestätigen (ephemeral)")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const target = interaction.options.getUser("user");
  const durStr = interaction.options.getString("dauer");
  const ms = parseDuration(durStr);
  const sendDM = interaction.options.getBoolean("dm") ?? true;
  const ephemeral = interaction.options.getBoolean("privat") ?? true;

  if (ms === null) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorDuration", {}, locale),
    });
  }

  if (target.id === interaction.user.id) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorSelf", {}, locale),
    });
  }
  if (target.id === interaction.client.user.id) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorBot", {}, locale),
    });
  }

  const guild = interaction.guild;
  const member = await guild.members.fetch(target.id).catch(() => null);
  if (!member) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorNotFound", {}, locale),
    });
  }
  if (target.id === guild.ownerId) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorOwner", {}, locale),
    });
  }

  // Hierarchie: Ausführender muss höher sein
  const executor = interaction.member;
  if (
    executor.roles?.highest &&
    member.roles?.highest &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0 &&
    guild.ownerId !== executor.id
  ) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorHierarchy", {}, locale),
    });
  }

  if (!member.moderatable) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorNotModeratable", {}, locale),
    });
  }

  // Bounds prüfen
  if (ms > MAX_MS) {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorTooLong", {}, locale),
    });
  }

  const beforeTs = member.communicationDisabledUntilTimestamp || 0;
  const reason =
    interaction.options.getString("grund") ||
    t("timeout.defaultReason", { mod: interaction.user.tag }, locale);

  // DM
  if (sendDM) {
    try {
      await target.send(
        ms === 0
          ? t("timeout.dmRemoved", { guild: guild.name }, locale)
          : t(
              "timeout.dmSet",
              { guild: guild.name, duration: durStr, reason },
              locale
            )
      );
    } catch {
      /* ignore DM fails */
    }
  }

  // Action
  try {
    if (ms === 0) {
      await member.timeout(
        null,
        `/${interaction.commandName} by ${interaction.user.tag} • ${reason}`
      );
    } else {
      await member.timeout(
        ms,
        `/${interaction.commandName} by ${interaction.user.tag} • ${reason}`
      );
    }
  } catch {
    return interaction.reply({
      ephemeral: true,
      content: t("timeout.errorFailed", {}, locale),
    });
  }

  const afterText =
    ms === 0
      ? t("timeout.removed", {}, locale)
      : t("timeout.setTo", { duration: durStr }, locale);

  // Öffentlicher Embed im aktuellen Channel
  const embed = new EmbedBuilder()
    .setTitle(t("timeout.embedTitle", {}, locale))
    .setDescription(
      ms === 0
        ? t("timeout.embedDescRemoved", {}, locale)
        : t("timeout.embedDescSet", {}, locale)
    )
    .addFields(
      {
        name: t("timeout.user", {}, locale),
        value: `${target.tag} (${target.id})`,
        inline: true,
      },
      {
        name: t("timeout.mod", {}, locale),
        value: interaction.user.tag,
        inline: true,
      },
      { name: t("timeout.reason", {}, locale), value: reason, inline: false },
      ...(ms === 0
        ? []
        : [
            {
              name: t("timeout.duration", {}, locale),
              value: durStr,
              inline: true,
            },
          ]),
      ...(beforeTs
        ? [
            {
              name: t("timeout.before", {}, locale),
              value: `<t:${Math.floor(beforeTs / 1000)}:R>`,
              inline: true,
            },
          ]
        : [])
    )
    .setColor(ms === 0 ? "Grey" : "Red")
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // Webhook-Log
  await sendLog({
    title: "Timeout",
    description: afterText,
    fields: [
      { name: "User", value: `${target.tag} (${target.id})` },
      { name: "Moderator", value: interaction.user.tag },
      { name: "Reason", value: reason },
      { name: "Server", value: `${guild.name} (${guild.id})` },
      ...(ms === 0 ? [] : [{ name: "Duration", value: durStr }]),
    ],
  });
}
