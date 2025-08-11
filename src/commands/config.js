import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { loadConfig, saveConfig } from "../util/store.js";

export const data = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Bot-Einstellungen verwalten.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((sc) =>
    sc.setName("show").setDescription("Zeige aktuelle Konfiguration.")
  )
  .addSubcommand((sc) =>
    sc
      .setName("locale")
      .setDescription("Sprache setzen (de/en).")
      .addStringOption((o) =>
        o.setName("lang").setDescription("de oder en").setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc
      .setName("logs-webhook")
      .setDescription("Webhook-URL für Logs setzen.")
      .addStringOption((o) =>
        o.setName("url").setDescription("Webhook-URL").setRequired(true)
      )
  )
  .addSubcommand((sc) =>
    sc.setName("test-log").setDescription("Test-Log senden.")
  );

export async function execute(interaction) {
  const sub = interaction.options.getSubcommand();
  const cfg = loadConfig();

  if (sub === "show") {
    return interaction.reply({
      ephemeral: true,
      content:
        `**Locale:** ${cfg.locale}\n` +
        `**Logs Webhook:** ${
          cfg.logs?.webhookUrl ? "gesetzt ✅" : "nicht gesetzt ❌"
        }`,
    });
  }

  if (sub === "locale") {
    const lang = interaction.options.getString("lang");
    if (!["de", "en"].includes(lang)) {
      return interaction.reply({
        ephemeral: true,
        content: "Nur `de` oder `en` erlaubt.",
      });
    }
    cfg.locale = lang;
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: `Locale auf \`${lang}\` gesetzt.`,
    });
  }

  if (sub === "logs-webhook") {
    const url = interaction.options.getString("url");
    if (!/^https:\/\/discord\.com\/api\/webhooks\//.test(url)) {
      return interaction.reply({
        ephemeral: true,
        content: "Das ist keine gültige Discord-Webhook-URL.",
      });
    }
    cfg.logs = { webhookUrl: url };
    saveConfig(cfg);
    return interaction.reply({
      ephemeral: true,
      content: "Logs-Webhook gesetzt ✅",
    });
  }

  if (sub === "test-log") {
    const { sendLog } = await import("../util/webhook.js");
    await sendLog({
      title: "Aurora Log-Test",
      description: `Ausgeführt von ${interaction.user.tag}`,
    });
    return interaction.reply({
      ephemeral: true,
      content: "Test-Log gesendet (falls Webhook gesetzt).",
    });
  }
}
