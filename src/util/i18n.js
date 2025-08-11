// Simple i18n mit Fallback und Variablenersetzung
import { loadConfig } from "./store.js";

const DICT = {
  de: {
    avatar: {
      title: "Avatar von {tag}",
      descUser: "Globales Profilbild.",
      descServer: "Server-Avatar.",
      noServerAvatar: "Dieser Nutzer hat keinen Server-Avatar.",
      download: "Download",
    },
    about: {
      title: "✨ Aurora",
      desc: "Sauber strukturierter Discord-Bot. Schnell, stabil, hübsch.",
      servers: "Server",
      users: "User (Cache)",
    },
    ban: {
      defaultReason: "Ban durch {mod}",
      errorSelf: "❌ Du kannst dich nicht selbst bannen.",
      errorBot: "❌ Du kannst den Bot nicht bannen.",
      errorNotFound: "❌ Benutzer nicht gefunden.",
      errorNotBannable:
        "❌ Dieser Benutzer kann nicht gebannt werden (Rollen prüfen).",
      errorFailed: "❌ Ban fehlgeschlagen.",
      dmMessage: "Du wurdest von {guild} gebannt.\nGrund: {reason}",
      embedTitle: "🔨 Benutzer gebannt",
      embedDesc: "Ein Benutzer wurde gebannt.",
      user: "Benutzer",
      mod: "Moderator",
      reason: "Grund",
      delDays: "Nachrichten gelöscht (Tage)",
    },
    clear: {
      cooldown: "⏳ Bitte warte {seconds}s bevor du /clear erneut benutzt.",
      error: "❌ Konnte nicht löschen (zu alt oder fehlende Rechte).",
      success: "🧹 Gelöscht: **{count}** Nachrichten.",
      embedTitle: "Nachrichten gelöscht",
      embedDesc: "{count} Nachrichten wurden von {mod} gelöscht.",
      channel: "Channel",
      messages: "Nachrichten",
    },

    help: {
      title: "📖 Aurora – Hilfe ({count} Befehle)",
      noCommands: "❌ Keine Commands gefunden.",
      footer: "Aurora • by EministarVR",
      uncategorized: "Ohne Kategorie",
    },
    common: {
      error: "❌ Unerwarteter Fehler.",
    },
    kick: {
      defaultReason: "Kick durch {mod}",
      errorSelf:
        "<:error:1404408144947314853> Du kannst dich nicht selbst kicken.",
      errorBot: "<:error:1404408144947314853> Du kannst den Bot nicht kicken.",
      errorNotFound: "<:error:1404408144947314853> Benutzer nicht gefunden.",
      errorOwner:
        "<:error:1404408144947314853> Du kannst den Server-Inhaber nicht kicken.",
      errorHierarchy:
        "<:error:1404408144947314853> Deine Rollen sind nicht hoch genug, um diesen Benutzer zu kicken.",
      errorNotKickable:
        "<:error:1404408144947314853> Dieser Benutzer kann nicht gekickt werden (Rollen/Bot-Rechte prüfen).",
      errorFailed: "<:error:1404408144947314853> Kick fehlgeschlagen.",
      dmTitle: "<:personkick:140440817590993086> Kick-Benachrichtigung",
      dmDesc: "Du wurdest von **{guild}** gekickt.",
      embedTitle: "<:warning1:1404408144947314853> Benutzer gekickt",
      embedDesc: "Ein Benutzer wurde vom Server entfernt.",
      shortReason: "wurde gekickt. **Grund:** {reason}",
      user: "<:person:140440817590993086> Benutzer",
      mod: "<:moderatorblack:1404408240179249203> Moderator",
      reason: "<:info:1404407988235534338> Grund",
    },
    ping: {
      checking: "⏱️ Check…",
      title: "🏓 Pong!",
      desc: "Aktuelle Latenz- und Statuswerte.",
      bot: "Bot-Latenz",
      ws: "Gateway (WS)",
      shard: "Shard",
      uptime: "Uptime",
    },
    roles: {
      errorNoSend:
        "❌ Ich kann in diesem Channel nicht schreiben oder ihn nicht sehen.",
      errorNoManageRoles: "❌ Mir fehlt die Berechtigung **Rollen verwalten**.",
      errorInvalidRole:
        "❌ Rolle **{name}** ist ungültig (verwaltet/@everyone).",
      errorHierarchy:
        "❌ Meine höchste Rolle ist nicht über **{name}** – kann nicht zuweisen.",
      errorNoRoles: "❌ Gib mindestens eine gültige Rolle an.",
      errorSend: "❌ Konnte die Rollen-Nachricht nicht senden.",
      defaultTitle: "Rollen wählen",
      defaultBody: "Klicke auf die Buttons, um Rollen zu togglen.",
      hint: "_Hinweis: Du kannst die Buttons jederzeit erneut klicken, um die Rolle zu entfernen._",
      success: "✅ Rollenpost in {channel} gesendet. [Zur Nachricht]({jump})",
      btnNoGuild: "❌ Diese Aktion ist nur in Servern verfügbar.",
      btnNoMember: "❌ Konnte den Benutzer nicht ermitteln.",
      btnRoleMissing: "❌ Diese Rolle existiert nicht mehr.",
      btnAdded: "✅ Rolle **{name}** hinzugefügt.",
      btnRemoved: "❎ Rolle **{name}** entfernt.",
      btnError: "❌ Konnte Rolle nicht ändern (Rechte prüfen).",
    },
    serverinfo: {
      title: "Serverinfo – {name}",
      id: "ID",
      owner: "Besitzer",
      members: "Mitglieder",
      roles: "Rollen",
      channels: "Kanäle (Text/Voice)",
      emojis: "Emojis",
      boosts: "Boosts",
      created: "Erstellt",
    },
    slowmode: {
      title: "🐢 Slowmode",
      setDesc: "{mod} hat den Slowmode gesetzt.",
      resetDesc: "{mod} hat den Slowmode zurückgesetzt.",
      channel: "Channel",
      before: "Vorher",
      after: "Nachher",
      reason: "Grund",
      ok: "🐢 Slowmode: **{sec}s**",
      noReason: "Kein Grund angegeben",
      errorPerms:
        "❌ Mir fehlt **Kanäle verwalten** oder ich sehe den Channel nicht.",
      errorChannel:
        "❌ In diesem Channel-Typ kann kein Slowmode gesetzt werden.",
      errorFailed: "❌ Konnte den Slowmode nicht setzen.",
    },
    timeout: {
      defaultReason: "Timeout durch {mod}",
      errorDuration:
        "❌ Dauer ungültig. Nutze z.B. `10m`, `1h`, `1d` oder `0/off` zum Entfernen.",
      errorSelf: "❌ Du kannst dich nicht selbst timeouten.",
      errorBot: "❌ Du kannst den Bot nicht timeouten.",
      errorNotFound: "❌ Benutzer nicht gefunden.",
      errorOwner: "❌ Du kannst den Server-Inhaber nicht timeouten.",
      errorHierarchy: "❌ Deine Rollen sind nicht hoch genug.",
      errorNotModeratable: "❌ Dieser Benutzer kann nicht gemodert werden.",
      errorTooLong: "❌ Max. 28 Tage erlaubt.",
      errorFailed: "❌ Timeout fehlgeschlagen.",
      dmSet:
        "Du hast in {guild} einen Timeout erhalten ({duration}). Grund: {reason}",
      dmRemoved: "Dein Timeout wurde in {guild} entfernt.",
      embedTitle: "⛔ Timeout",
      embedDescSet: "Ein Benutzer wurde zeitweise stummgeschaltet.",
      embedDescRemoved: "Timeout wurde entfernt.",
      user: "Benutzer",
      mod: "Moderator",
      reason: "Grund",
      duration: "Dauer",
      before: "Vorher aktiv bis",
      removed: "Timeout entfernt",
      setTo: "Timeout gesetzt",
    },
  },
  en: {
    timeout: {
      defaultReason: "Timeout by {mod}",
      errorDuration:
        "❌ Invalid duration. Use `10m`, `1h`, `1d` or `0/off` to remove.",
      errorSelf: "❌ You can’t timeout yourself.",
      errorBot: "❌ You can’t timeout the bot.",
      errorNotFound: "❌ User not found.",
      errorOwner: "❌ You can’t timeout the server owner.",
      errorHierarchy: "❌ Your roles are not high enough.",
      errorNotModeratable: "❌ This user cannot be moderated.",
      errorTooLong: "❌ Max allowed is 28 days.",
      errorFailed: "❌ Timeout failed.",
      dmSet:
        "You have been timed out in {guild} for {duration}. Reason: {reason}",
      dmRemoved: "Your timeout in {guild} was removed.",
      embedTitle: "⛔ Timeout",
      embedDescSet: "A user has been timed out.",
      embedDescRemoved: "Timeout has been removed.",
      user: "User",
      mod: "Moderator",
      reason: "Reason",
      duration: "Duration",
      before: "Previously until",
      removed: "Timeout removed",
      setTo: "Timeout set",
    },
    slowmode: {
      title: "🐢 Slowmode",
      setDesc: "{mod} set the slowmode.",
      resetDesc: "{mod} reset the slowmode.",
      channel: "Channel",
      before: "Before",
      after: "After",
      reason: "Reason",
      ok: "🐢 Slowmode: **{sec}s**",
      noReason: "No reason provided",
      errorPerms:
        "❌ I’m missing **Manage Channels** or can’t view the channel.",
      errorChannel: "❌ This channel type does not support slowmode.",
      errorFailed: "❌ Failed to set slowmode.",
    },
    serverinfo: {
      title: "Server Info – {name}",
      id: "ID",
      owner: "Owner",
      members: "Members",
      roles: "Roles",
      channels: "Channels (Text/Voice)",
      emojis: "Emojis",
      boosts: "Boosts",
      created: "Created",
    },
    avatar: {
      title: "Avatar of {tag}",
      descUser: "Global profile picture.",
      descServer: "Server avatar.",
      noServerAvatar: "This user has no server avatar.",
      download: "Download",
    },
    about: {
      title: "✨ Aurora",
      desc: "Cleanly structured Discord bot. Fast, stable, pretty.",
      servers: "Servers",
      users: "Users (cache)",
    },
    common: {
      error: "❌ Unexpected error.",
    },
    ban: {
      defaultReason: "Ban by {mod}",
      errorSelf: "❌ You can't ban yourself.",
      errorBot: "❌ You can't ban the bot.",
      errorNotFound: "❌ User not found.",
      errorNotBannable: "❌ This user cannot be banned (check roles).",
      errorFailed: "❌ Ban failed.",
      dmMessage: "You have been banned from {guild}.\nReason: {reason}",
      embedTitle: "🔨 User Banned",
      embedDesc: "A user has been banned.",
      user: "User",
      mod: "Moderator",
      reason: "Reason",
      delDays: "Messages Deleted (Days)",
    },
    clear: {
      cooldown: "⏳ Please wait {seconds}s before using /clear again.",
      error: "❌ Could not delete (too old or missing permissions).",
      success: "🧹 Deleted: **{count}** messages.",
      embedTitle: "Messages Deleted",
      embedDesc: "{count} messages have been deleted by {mod}.",
      channel: "Channel",
      messages: "Messages",
    },
    help: {
      title: "📖 Aurora – Help ({count} commands)",
      noCommands: "❌ No commands found.",
      footer: "Aurora • by EministarVR",
      uncategorized: "Uncategorized",
    },
    kick: {
      defaultReason: "Kick by {mod}",

      // Errors (custom error emoji)
      errorSelf: "<:warning1:1404408144947314853> You can't kick yourself.",
      errorBot: "<:warning1:1404408144947314853> You can't kick the bot.",
      errorNotFound: "<:warning1:1404408144947314853> User not found.",
      errorOwner:
        "<:warning1:1404408144947314853> You can't kick the server owner.",
      errorHierarchy:
        "<:warning1:1404408144947314853> Your roles are not high enough to kick this user.",
      errorNotKickable:
        "<:warning1:1404408144947314853> This user cannot be kicked (check roles/bot permissions).",
      errorFailed: "<:warning1:1404408144947314853> Kick failed.",

      // DM to target
      dmTitle: "<:personkick:1404408175909933086> Kick Notice",
      dmDesc: "You have been kicked from **{guild}**.",
      dmMessage: "You have been kicked from {guild}.\nReason: {reason}", // falls du's woanders noch nutzt

      // Public embed
      embedTitle: "<:warning1:1404408144947314853> User Kicked",
      embedDesc: "A user has been removed from the server.",
      shortReason: "was kicked. **Reason:** {reason}",

      // Field labels
      user: "<:personkick:1404408175909933086> User",
      mod: "<:moderatorblack:1404408240179249203> Moderator",
      reason: "<:info:1404407988235534338> Reason",
    },
    ping: {
      checking: "⏱️ Checking…",
      title: "🏓 Pong!",
      desc: "Current latency and status values.",
      bot: "Bot Latency",
      ws: "Gateway (WS)",
      shard: "Shard",
      uptime: "Uptime",
    },
    roles: {
      errorNoSend: "❌ I cannot send or view messages in that channel.",
      errorNoManageRoles: "❌ I’m missing **Manage Roles** permission.",
      errorInvalidRole: "❌ Role **{name}** is invalid (managed/@everyone).",
      errorHierarchy: "❌ My top role is not above **{name}** – cannot assign.",
      errorNoRoles: "❌ Provide at least one valid role.",
      errorSend: "❌ Failed to send the roles message.",
      defaultTitle: "Choose roles",
      defaultBody: "Click the buttons to toggle roles.",
      hint: "_Note: Click again to remove the role._",
      success: "✅ Roles post sent in {channel}. [Jump]({jump})",
      btnNoGuild: "❌ This action is only available in servers.",
      btnNoMember: "❌ Couldn’t resolve the member.",
      btnRoleMissing: "❌ That role no longer exists.",
      btnAdded: "✅ Added role **{name}**.",
      btnRemoved: "❎ Removed role **{name}**.",
      btnError: "❌ Couldn’t change the role (check permissions).",
    },
  },
};

function getLocale() {
  // global – wenn du später pro Guild willst, hier erweitern
  const cfg = loadConfig();
  const loc = (cfg.locale || "de").toLowerCase();
  return ["de", "en"].includes(loc) ? loc : "en";
}

function interpolate(str, vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`
  );
}

export function t(key, vars = {}, locale = null) {
  const loc = locale || getLocale();
  const path = key.split(".");
  let cur = DICT[loc];
  for (const p of path) cur = cur?.[p];
  if (cur == null) {
    // Fallback en
    cur = DICT.en;
    for (const p of path) cur = cur?.[p];
  }
  return interpolate(cur ?? key, vars);
}

export function currentLocale() {
  return getLocale();
}
