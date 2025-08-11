import { EmbedBuilder, WebhookClient } from "discord.js";
import { loadConfig } from "./store.js";

export function getWebhook() {
  const { logs } = loadConfig();
  if (!logs?.webhookUrl) return null;
  try {
    return new WebhookClient({ url: logs.webhookUrl });
  } catch {
    return null;
  }
}

export async function sendLog({ title, description, fields = [] }) {
  const wh = getWebhook();
  if (!wh) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description ?? null)
    .addFields(fields)
    .setTimestamp();

  await wh.send({ embeds: [embed] }).catch(() => {});
}
