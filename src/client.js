import { Client, GatewayIntentBits, Partials, Collection } from "discord.js";

export function createClient() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers, // neu: für Moderation/Welcome/Autoroles
      GatewayIntentBits.GuildMessages, // für /clear & Kanalaktionen
    ],
    partials: [Partials.Channel, Partials.GuildMember],
  });

  client.commands = new Collection();
  return client;
}
