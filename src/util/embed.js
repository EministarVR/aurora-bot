// util/embed.js
import { EmbedBuilder } from "discord.js";

export function createEmbed(color) {
  const embed = new EmbedBuilder().setFooter({
    text: "Aurora Bot • aurora-bot.xyz",
    iconURL: "https://aurora-bot.xyz/logo.png", // Logo-URL hier rein
  });

  if (color) embed.setColor(color);
  return embed;
}
