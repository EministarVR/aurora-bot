import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("userinfo")
  .setDescription("Zeigt detaillierte Infos zu einem User.")
  .addUserOption((o) =>
    o.setName("user").setDescription("Ziel-User").setRequired(false)
  )
  .addBooleanOption((o) =>
    o.setName("privat").setDescription("Nur dir anzeigen (ephemeral)")
  );

export async function execute(interaction) {
  const target = interaction.options.getUser("user") || interaction.user;
  const ephemeral = interaction.options.getBoolean("privat") ?? true;

  // Member-Objekt holen (notfalls aus API)
  const member = await interaction.guild?.members
    .fetch(target.id)
    .catch(() => null);

  // Rollenliste (ohne @everyone)
  const roles = member
    ? member.roles.cache
        .filter((r) => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map((r) => r.toString())
    : [];

  const embed = new EmbedBuilder()
    .setTitle(`👤 Userinfo – ${target.tag}`)
    .setThumbnail(target.displayAvatarURL({ size: 256 }))
    .setColor(member?.displayHexColor || "#2F3136")
    .addFields(
      { name: "ID", value: target.id, inline: true },
      { name: "Bot", value: target.bot ? "Ja" : "Nein", inline: true },
      {
        name: "Account erstellt",
        value: `<t:${Math.floor(target.createdTimestamp / 1000)}:R>`,
        inline: true,
      },
      ...(member
        ? [
            {
              name: "Server beigetreten",
              value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
              inline: true,
            },
            {
              name: "Booster",
              value: member.premiumSince
                ? `<t:${Math.floor(member.premiumSince.getTime() / 1000)}:R>`
                : "Nein",
              inline: true,
            },
            ...(roles.length
              ? [{ name: `Rollen [${roles.length}]`, value: roles.join(", ") }]
              : []),
          ]
        : [])
    )
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral });
}
