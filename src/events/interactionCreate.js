// src/events/interactionCreate.js
import { PermissionFlagsBits } from "discord.js";
import { t, currentLocale } from "../util/i18n.js";
import { err, log } from "../util/logger.js";
import { sendLog } from "../util/webhook.js";

export const name = "interactionCreate";
export const once = false;

export async function execute(interaction, client) {
  const locale = currentLocale();

  try {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) {
        if (interaction.isRepliable()) {
          await safeReply(interaction, {
            content: t("common.error", {}, locale),
            ephemeral: true,
          });
        }
        return;
      }

      await cmd.execute(interaction, client);

      // Logging
      sendLog({
        title: "Command",
        description: `/${interaction.commandName}`,
        fields: [
          {
            name: "User",
            value: `${interaction.user.tag} (${interaction.user.id})`,
          },
          {
            name: "Guild",
            value: `${interaction.guild?.name ?? "DM"} (${
              interaction.guildId ?? "-"
            })`,
          },
          ...(interaction.channel
            ? [
                {
                  name: "Channel",
                  value: `#${interaction.channel.name} (${interaction.channel.id})`,
                },
              ]
            : []),
        ],
      });

      return;
    }

    // Autocomplete (optional handlers)
    if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (cmd?.autocomplete) {
        try {
          await cmd.autocomplete(interaction, client);
        } catch (e) {
          err("autocomplete error:", e);
        }
      } else {
        // Ignorieren statt crashen
        await interaction.respond([]).catch(() => {});
      }
      return;
    }

    // Modal Submit (optional handlers)
    if (interaction.isModalSubmit()) {
      const id = interaction.customId;
      // Falls du später Modals nutzt, hier switch(en)
      log("modal submit:", id);
      if (interaction.isRepliable()) {
        await safeReply(interaction, {
          content: t("common.error", {}, locale),
          ephemeral: true,
        });
      }
      return;
    }

    // Buttons
    if (interaction.isButton()) {
      const id = interaction.customId || "";

      // Rollen-Toggle: role:<roleId>
      if (id.startsWith("role:")) {
        if (!interaction.guild) {
          return safeReply(interaction, {
            content: t("roles.btnNoGuild", {}, locale),
            ephemeral: true,
          });
        }

        const roleId = id.split(":")[1];
        const member = interaction.member; // klickender User (GuildMember)
        const me = interaction.guild.members.me; // der Bot als Member
        if (!member || !me) {
          return safeReply(interaction, {
            content: t("roles.btnNoMember", {}, locale),
            ephemeral: true,
          });
        }

        // Rechte prüfen
        if (
          !interaction.guild.members.me.permissions.has(
            PermissionFlagsBits.ManageRoles
          )
        ) {
          return safeReply(interaction, {
            content: t("roles.errorNoManageRoles", {}, locale),
            ephemeral: true,
          });
        }

        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) {
          return safeReply(interaction, {
            content: t("roles.btnRoleMissing", {}, locale),
            ephemeral: true,
          });
        }
        if (role.managed || role.id === interaction.guild.id) {
          return safeReply(interaction, {
            content: t("roles.errorInvalidRole", { name: role.name }, locale),
            ephemeral: true,
          });
        }

        // Bot-Hierarchie
        if (me.roles.highest.comparePositionTo(role) <= 0) {
          return safeReply(interaction, {
            content: t("roles.errorHierarchy", { name: role.name }, locale),
            ephemeral: true,
          });
        }

        const has = member.roles.cache.has(roleId);
        try {
          if (has) {
            await member.roles.remove(
              roleId,
              `Role-toggle by ${interaction.user.tag}`
            );
            await safeReply(interaction, {
              content: t("roles.btnRemoved", { name: role.name }, locale),
              ephemeral: true,
            });
          } else {
            await member.roles.add(
              roleId,
              `Role-toggle by ${interaction.user.tag}`
            );
            await safeReply(interaction, {
              content: t("roles.btnAdded", { name: role.name }, locale),
              ephemeral: true,
            });
          }
        } catch (e) {
          err("role toggle error:", e);
          await safeReply(interaction, {
            content: t("roles.btnError", {}, locale),
            ephemeral: true,
          });
        }
        return;
      }

      // Unbekannter Button → freundlich ignorieren
      if (interaction.isRepliable()) {
        await safeReply(interaction, {
          content: t("common.error", {}, locale),
          ephemeral: true,
        });
      }
      return;
    }

    // Select Menus (als Vorbereitung)
    if (interaction.isAnySelectMenu?.() || interaction.isStringSelectMenu?.()) {
      // später implementieren
      if (interaction.isRepliable()) {
        await safeReply(interaction, {
          content: t("common.error", {}, locale),
          ephemeral: true,
        });
      }
      return;
    }
  } catch (e) {
    err("interaction error:", e);

    if (interaction.isRepliable()) {
      const msg = t("common.error", {}, locale);
      await safeReply(interaction, { content: msg, ephemeral: true }).catch(
        () => {}
      );
    }
  }
}

/**
 * Antwortet sicher auf Interactions (vermeidet "This interaction failed").
 * - Wenn bereits geantwortet/deferred → followUp
 * - Sonst → reply
 */
async function safeReply(interaction, payload) {
  try {
    if (interaction.deferred || interaction.replied) {
      return await interaction.followUp(payload);
    }
    return await interaction.reply(payload);
  } catch {
    // Manche Component-Interaktionen scheitern, wenn UI schon weg ist → ignorieren
    return null;
  }
}
