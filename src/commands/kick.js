// src/commands/kick.js
import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { sendLog } from "../util/webhook.js";

export const category = "Moderation";

export const data = new SlashCommandBuilder()
  .setName("kick")
  .setDescription("Kickt einen User.")
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
  .addUserOption((o) =>
    o.setName("user").setDescription("Ziel").setRequired(true)
  )
  .addStringOption((o) =>
    o.setName("grund").setDescription("Grund").setRequired(false)
  )
  .addBooleanOption((o) =>
    o
      .setName("dm")
      .setDescription("Benachrichtigung per DM senden (Standard: ja)")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const target = interaction.options.getUser("user");
  const reason =
    interaction.options.getString("grund") ||
    t("kick.defaultReason", { mod: interaction.user.tag }, locale);
  const sendDM = interaction.options.getBoolean("dm") ?? true;

  const EMOJIS = {
    kick: "<:personkick:1404408175909933086>",
    warn: "<:warning1:1404408144947314853>",
    mod: "<:moderatorblack:1404408240179249203>",
    info: "<:info:1404407988235534338>",
  };

  if (target.id === interaction.user.id) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorSelf", {}, locale),
    });
  }
  if (target.id === interaction.client.user.id) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorBot", {}, locale),
    });
  }

  const guild = interaction.guild;
  const member = await guild.members.fetch(target.id).catch(() => null);
  if (!member) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorNotFound", {}, locale),
    });
  }
  if (target.id === guild.ownerId) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorOwner", {}, locale),
    });
  }

  const executor = interaction.member;
  if (
    executor.roles?.highest &&
    member.roles?.highest &&
    executor.roles.highest.comparePositionTo(member.roles.highest) <= 0 &&
    guild.ownerId !== executor.id
  ) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorHierarchy", {}, locale),
    });
  }

  if (!member.kickable) {
    return interaction.reply({
      ephemeral: true,
      content: t("kick.errorNotKickable", {}, locale),
    });
  }

  // DM (optional)
  if (sendDM) {
    await target
      .send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xf59e0b)
            .setTitle(`${EMOJIS.kick} ${t("kick.dmTitle", {}, locale)}`)
            .setDescription(
              `${t("kick.dmDesc", { guild: guild.name }, locale)}\n\n${
                EMOJIS.info
              } **${t("kick.reason", {}, locale)}:** ${reason}`
            )
            .setFooter({
              text: "Aurora Bot",
              iconURL: interaction.client.user.displayAvatarURL(),
            })
            .setTimestamp(),
        ],
      })
      .catch(() => {});
  }

  // Kick
  await member.kick(reason).catch(() =>
    interaction.reply({
      ephemeral: true,
      content: t("kick.errorFailed", {}, locale),
    })
  );

  // Öffentlicher Embed
  const embed = new EmbedBuilder()
    .setColor(0xf59e0b)
    .setTitle(`${EMOJIS.warn} ${t("kick.embedTitle", {}, locale)}`)
    .setDescription(
      `${EMOJIS.kick} **${target.tag}** ${t(
        "kick.shortReason",
        { reason },
        locale
      )}`
    )
    .addFields(
      {
        name: `${EMOJIS.kick} ${t("kick.user", {}, locale)}`,
        value: `${target.tag} (${target.id})`,
        inline: true,
      },
      {
        name: `${EMOJIS.mod} ${t("kick.mod", {}, locale)}`,
        value: `${interaction.user.tag}`,
        inline: true,
      },
      {
        name: `${EMOJIS.info} ${t("kick.reason", {}, locale)}`,
        value: reason,
        inline: false,
      }
    )
    .setFooter({
      text: "Aurora Bot",
      iconURL: interaction.client.user.displayAvatarURL(),
    })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // Webhook-Log
  await sendLog({
    title: "Kick",
    description: `${target.tag} gekickt.`,
    fields: [
      { name: "User", value: `${target.tag} (${target.id})` },
      { name: "Moderator", value: interaction.user.tag },
      { name: "Grund", value: reason },
      { name: "Server", value: `${guild.name} (${guild.id})` },
    ],
  });
}
