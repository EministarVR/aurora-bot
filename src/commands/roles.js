import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits as Perms,
} from "discord.js";
import { t, currentLocale } from "../util/i18n.js";

export const category = "Utility";

const STYLE_MAP = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

export const data = new SlashCommandBuilder()
  .setName("roles")
  .setDescription("Postet eine Button-Rollen-Nachricht (max 5).")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addChannelOption((o) =>
    o
      .setName("channel")
      .setDescription("Ziel-Channel (optional)")
      .addChannelTypes(ChannelType.GuildText)
  )
  .addStringOption((o) =>
    o.setName("titel").setDescription("Überschrift").setRequired(false)
  )
  .addStringOption((o) =>
    o
      .setName("beschreibung")
      .setDescription("Text unter dem Titel")
      .setRequired(false)
  )
  .addStringOption((o) =>
    o
      .setName("style")
      .setDescription("Button-Style")
      .addChoices(
        { name: "secondary (grau)", value: "secondary" },
        { name: "primary (blau)", value: "primary" },
        { name: "success (grün)", value: "success" },
        { name: "danger (rot)", value: "danger" }
      )
  )
  // Rollen 1..5
  .addRoleOption((o) => o.setName("role1").setDescription("Rolle 1"))
  .addStringOption((o) =>
    o.setName("emoji1").setDescription("Emoji für Rolle 1")
  )
  .addRoleOption((o) => o.setName("role2").setDescription("Rolle 2"))
  .addStringOption((o) =>
    o.setName("emoji2").setDescription("Emoji für Rolle 2")
  )
  .addRoleOption((o) => o.setName("role3").setDescription("Rolle 3"))
  .addStringOption((o) =>
    o.setName("emoji3").setDescription("Emoji für Rolle 3")
  )
  .addRoleOption((o) => o.setName("role4").setDescription("Rolle 4"))
  .addStringOption((o) =>
    o.setName("emoji4").setDescription("Emoji für Rolle 4")
  )
  .addRoleOption((o) => o.setName("role5").setDescription("Rolle 5"))
  .addStringOption((o) =>
    o.setName("emoji5").setDescription("Emoji für Rolle 5")
  );

export async function execute(interaction) {
  const locale = currentLocale();
  const guild = interaction.guild;
  const me = guild.members.me;

  // Ziel-Channel
  const target =
    interaction.options.getChannel("channel") || interaction.channel;

  // Rechte-Checks
  const perms = target.permissionsFor(me);
  if (!perms?.has(Perms.SendMessages) || !perms?.has(Perms.ViewChannel)) {
    return interaction.reply({
      ephemeral: true,
      content: t("roles.errorNoSend", {}, locale),
    });
  }
  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    return interaction.reply({
      ephemeral: true,
      content: t("roles.errorNoManageRoles", {}, locale),
    });
  }

  // Rollen & Emojis sammeln
  const entries = [];
  for (let i = 1; i <= 5; i++) {
    const role = interaction.options.getRole(`role${i}`);
    if (!role) continue;
    const emoji = interaction.options.getString(`emoji${i}`) || null;

    // verbotene Rollen
    if (role.managed || role.id === guild.id) {
      return interaction.reply({
        ephemeral: true,
        content: t("roles.errorInvalidRole", { name: role.name }, locale),
      });
    }
    // Hierarchie prüfen
    if (me.roles.highest.comparePositionTo(role) <= 0) {
      return interaction.reply({
        ephemeral: true,
        content: t("roles.errorHierarchy", { name: role.name }, locale),
      });
    }

    entries.push({ role, emoji });
  }

  if (entries.length === 0) {
    return interaction.reply({
      ephemeral: true,
      content: t("roles.errorNoRoles", {}, locale),
    });
  }

  const styleKey = interaction.options.getString("style") || "secondary";
  const style = STYLE_MAP[styleKey] ?? ButtonStyle.Secondary;

  // Buttons bauen (max 5 in einer Row)
  const row = new ActionRowBuilder().addComponents(
    ...entries.map(({ role, emoji }) => {
      const btn = new ButtonBuilder()
        .setCustomId(`role:${role.id}`)
        .setLabel(role.name)
        .setStyle(style);
      if (emoji) btn.setEmoji(emoji);
      return btn;
    })
  );

  const title =
    interaction.options.getString("titel") ||
    t("roles.defaultTitle", {}, locale);
  const body =
    interaction.options.getString("beschreibung") ||
    t("roles.defaultBody", {}, locale);

  // senden
  const sent = await target
    .send({
      content: `**${title}**\n${body}\n\n${t("roles.hint", {}, locale)}`,
      components: [row],
    })
    .catch(() => null);

  if (!sent) {
    return interaction.reply({
      ephemeral: true,
      content: t("roles.errorSend", {}, locale),
    });
  }

  await interaction.reply({
    ephemeral: true,
    content: t(
      "roles.success",
      { channel: `#${target.name}`, jump: sent.url },
      locale
    ),
  });
}
