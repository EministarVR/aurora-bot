import { createClient } from "./client.js";
import { loadCommands } from "./handlers/commands.js";
import { loadEvents } from "./handlers/events.js";
import { ENV } from "./util/env.js";
import { log, err } from "./util/logger.js";

const client = createClient();

process.on("unhandledRejection", (e) => err("UnhandledRejection:", e));
process.on("uncaughtException", (e) => err("UncaughtException:", e));

await loadCommands(client);
await loadEvents(client);

client.login(ENV.TOKEN).then(() => log("Aurora ist online."));
