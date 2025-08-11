import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const DIR = resolve(process.cwd(), "data");
const FILE = resolve(DIR, "config.json");

const DEFAULTS = {
  locale: "de",
  logs: { webhookUrl: "" },
  welcome: { enabled: false, channelId: "", message: "Willkommen, {user}!" },
};

function ensure() {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, JSON.stringify(DEFAULTS, null, 2));
}

export function loadConfig() {
  ensure();
  // Merge alte Dateien mit neuen Defaults
  const current = JSON.parse(readFileSync(FILE, "utf8"));
  const merged = {
    ...DEFAULTS,
    ...current,
    logs: { ...DEFAULTS.logs, ...(current.logs || {}) },
    welcome: { ...DEFAULTS.welcome, ...(current.welcome || {}) },
  };
  if (JSON.stringify(merged) !== JSON.stringify(current))
    writeFileSync(FILE, JSON.stringify(merged, null, 2));
  return merged;
}

export function saveConfig(cfg) {
  ensure();
  writeFileSync(FILE, JSON.stringify(cfg, null, 2));
}
