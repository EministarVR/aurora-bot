import { ActivityType } from "discord.js";
import { log } from "../util/logger.js";

export const name = "ready";
export const once = true;

/** @param {import('discord.js').Client} client */
export function execute(client) {
  log(`Eingeloggt als ${client.user.tag}`);
  client.user.setPresence({
    activities: [{ name: "✨ Aurora online", type: ActivityType.Listening }],
    status: "online",
  });
}
