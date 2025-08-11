import { loadConfig } from "../util/store.js";
import { sendLog } from "../util/webhook.js";

export const name = "guildMemberAdd";
export const once = false;

export async function execute(member) {
  const cfg = loadConfig();
  const w = cfg.welcome;
  if (!w?.enabled || !w?.channelId) return;

  const ch = member.guild.channels.cache.get(w.channelId);
  if (!ch?.isTextBased()) return;

  const msg = (w.message || "Willkommen, {user}!").replaceAll(
    "{user}",
    `<@${member.id}>`
  );
  await ch.send({ content: msg }).catch(() => {});
  await sendLog({
    title: "👋 Join",
    description: `${member.user.tag} ist beigetreten`,
    fields: [{ name: "UserID", value: member.id }],
  });
}
