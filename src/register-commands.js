import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ENV } from "./util/env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const commandsPath = resolve(__dirname, "commands");
const files = readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

const body = [];
for (const file of files) {
  const mod = await import(`./commands/${file}`);
  if (mod.data) body.push(mod.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(ENV.TOKEN);

(async () => {
  try {
    if (ENV.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(ENV.CLIENT_ID, ENV.GUILD_ID),
        { body }
      );
      console.log(`✅ Guild-Commands registriert (${body.length})`);
    } else {
      await rest.put(Routes.applicationCommands(ENV.CLIENT_ID), { body });
      console.log(
        `✅ Global-Commands registriert (${body.length}). Achtung: kann bis zu 1h dauern.`
      );
    }
  } catch (e) {
    console.error("❌ Command-Register-Fehler:", e);
    process.exit(1);
  }
})();
