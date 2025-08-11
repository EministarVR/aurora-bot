import { readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { log, warn } from "../util/logger.js";

export async function loadCommands(client) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const commandsPath = resolve(__dirname, "..", "commands");
  const files = readdirSync(commandsPath).filter((f) => f.endsWith(".js"));
  for (const file of files) {
    const mod = await import(`../commands/${file}`);
    if (!mod.data || !mod.execute) {
      warn(`Command ${file} hat kein data/execute`);
      continue;
    }
    client.commands.set(mod.data.name, mod);
  }
  log(`Commands geladen: ${client.commands.size}`);
}
