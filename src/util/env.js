import dotenv from "dotenv";
dotenv.config();

const required = ["DISCORD_TOKEN", "CLIENT_ID"];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[ENV] Missing ${k} in .env`);
    process.exit(1);
  }
}

export const ENV = {
  TOKEN: process.env.DISCORD_TOKEN,
  CLIENT_ID: process.env.CLIENT_ID,
  GUILD_ID: process.env.GUILD_ID || null,
};
