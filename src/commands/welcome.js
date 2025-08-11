import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { loadConfig, saveConfig } from "../util/store.js";

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Willkommensnachrichten konfigurieren.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sc) =>
    sc.setName("enable").setDescription("Welcome einschalten")
  )
  .addSubcommand((sc) =>
    sc.setName("disable").setDescription("Welcome ausschalten")
  )
  .addSubcommand((sc) =>
    sc
      .setName("channel")
      .setDescription("Kanal setzen")
      .addChannelOption((o) =>
        o
          .setName("kanal")
          .setDescription("Textkanal")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName("message")
      .setDescription(
        "Nachricht setzen (nutze {user}, {user.tag}, {user.name})"
      )
      .addStringOption((o) =>
        o
          .setName("text")
          .setDescription("z.B. Willkommen {user}!")
          .setRequired(true)
      )
  )
  .addSubcommand((sc) => sc.setName("test").setDescription("Welcome testen"));

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const cfg = loadConfig();
  cfg.welcome = {
    enabled: cfg.welcome?.enabled ?? false,
    channelId: cfg.welcome?.channelId ?? "",
    message: cfg.welcome?.message ?? "Willkommen, {user}!",
  };

  if (sub === "enable") {
    cfg.welcome.enabled = true;
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: "✅ Welcome aktiviert.",
    });
  }

  if (sub === "disable") {
    cfg.welcome.enabled = false;
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: "🛑 Welcome deaktiviert.",
    });
  }

  if (sub === "channel") {
    const ch = interaction.options.getChannel("kanal");
    cfg.welcome.channelId = ch.id;
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: `📢 Kanal gesetzt: ${ch}`,
    });
  }

  if (sub === "message") {
    const text = interaction.options.getString("text");
    cfg.welcome.message = text;
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: "✍️ Welcome-Text gespeichert.",
    });
  }

  if (sub === "test") {
    const w = cfg.welcome;
    if (!w.enabled || !w.channelId) {
      return interaction.reply({
        ephemeral: true,
        content: "⚠️ Setz erst Kanal & aktiviere Welcome.",
      });
    }
    const ch = interaction.guild.channels.cache.get(w.channelId);
    if (!ch || !ch.isTextBased()) {
      return interaction.reply({
        ephemeral: true,
        content: "❌ Kanal nicht gefunden oder nicht textbasiert.",
      });
    }
    if (
      !ch
        .permissionsFor(interaction.client.user)
        ?.has(PermissionFlagsBits.SendMessages)
    ) {
      return interaction.reply({
        ephemeral: true,
        content: "❌ Ich kann in diesem Kanal nicht schreiben.",
      });
    }

    const msg = (w.message || "Willkommen {user}!")
      .replaceAll("{user}", `<@${interaction.user.id}>`)
      .replaceAll("{user.tag}", interaction.user.tag)
      .replaceAll("{user.name}", interaction.user.username);

    await ch.send({ content: msg });
    return interaction.reply({
      ephemeral: true,
      content: "🚀 Test geschickt.",
    });
  }
}
