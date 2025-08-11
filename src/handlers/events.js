import { readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "../util/logger.js";

export async function loadEvents(client) {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const eventsPath = resolve(__dirname, "..", "events");
  const files = readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    const { name, once, execute } = await import(`../events/${file}`);
    if (once) client.once(name, (...args) => execute(...args, client));
    else client.on(name, (...args) => execute(...args, client));
  }
  log(`Events geladen: ${files.length}`);
}
