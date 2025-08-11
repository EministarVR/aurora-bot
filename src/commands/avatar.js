// src/commands/avatar.js
import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { createEmbed } from "../util/embed.js";

const SIZES = [128, 256, 512, 1024, 2048, 4096];

export const data = new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("Zeigt den Avatar eines Users.")
  .addUserOption((o) =>
    o.setName("user").setDescription("Ziel-User (optional)")
  )
  .addStringOption((o) =>
    o
      .setName("typ")
      .setDescription("Profilbild oder Server-Avatar")
      .addChoices(
        { name: "Profilbild (global)", value: "user" },
        { name: "Server-Avatar", value: "server" }
      )
  )
  .addStringOption((o) =>
    o
      .setName("format")
      .setDescription("Bildformat")
      .addChoices(
        { name: "png", value: "png" },
        { name: "jpg", value: "jpg" },
        { name: "webp", value: "webp" },
        { name: "gif (nur animiert)", value: "gif" }
      )
  )
  .addIntegerOption((o) =>
    o
      .setName("größe")
      .setDescription("Bildgröße")
      .addChoices(...SIZES.map((n) => ({ name: String(n), value: n })))
  )
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur für dich anzeigen (ephemeral)")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const targetUser = interaction.options.getUser("user") || interaction.user;
  const type = interaction.options.getString("typ") || "user";
  const fmt = interaction.options.getString("format") || "png";
  const size = interaction.options.getInteger("größe") || 1024;
  const ephemeral = interaction.options.getBoolean("privat") ?? true;

  const isAnimated = targetUser.avatar?.startsWith("a_");
  const finalFmt = fmt === "gif" ? (isAnimated ? "gif" : "png") : fmt;

  let url;
  let member = null;

  if (type === "server") {
    member = await interaction.guild?.members
      .fetch(targetUser.id)
      .catch(() => null);
    if (!member || !member.avatar) {
      return interaction.reply({
        ephemeral: true,
        content: t("avatar.noServerAvatar", {}, locale),
      });
    }
    url = member.displayAvatarURL({ extension: finalFmt, size });
  } else {
    url = targetUser.displayAvatarURL({ extension: finalFmt, size });
  }

  const title = t("avatar.title", { tag: targetUser.tag }, locale);
  const desc =
    type === "server"
      ? t("avatar.descServer", {}, locale)
      : t("avatar.descUser", {}, locale);

  const embed = createEmbed() // Farbe optional: createEmbed(0x5865F2)
    .setTitle(title)
    .setDescription(desc)
    .setImage(url)
    .setTimestamp();

  const baseExts = isAnimated ? ["gif", "png", "webp"] : ["png", "jpg", "webp"];
  const downloadTarget = type === "server" ? member ?? targetUser : targetUser;

  const row = new ActionRowBuilder().addComponents(
    ...baseExts.map((ext) =>
      new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(`${t("avatar.download", {}, locale)} ${ext.toUpperCase()}`)
        .setURL(downloadTarget.displayAvatarURL({ extension: ext, size }))
    )
  );

  await interaction.reply({
    embeds: [embed],
    components: [row],
    ephemeral,
  });
}
