# Aurora Bot

<p align="center">
  <img src="logo-re.png" alt="Aurora Bot logo" width="200" />
</p>

A friendly Discord bot powered by modern JavaScript and [discord.js](https://discord.js.org/).

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features
- Slash commands
- Modular command and event system
- Ready for deployment with PM2

## Tech Stack
| Technology | Badge |
|-----------|-------|
| Node.js | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) |
| JavaScript | ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black) |
| Discord.js | ![discord.js](https://img.shields.io/badge/discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white) |

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm

> [!NOTE]
> Use the latest LTS version of Node for best compatibility

### Installation
```bash
git clone https://github.com/yourusername/aurora-bot.git
cd aurora-bot
npm install
```

### Environment Variables
> [!IMPORTANT]
> You **must** create a `.env` file before running the bot. Copy the provided `.env.example` and fill in your credentials.

```bash
cp .env.example .env
```

| Variable | Description |
|---------|-------------|
| `DISCORD_TOKEN` | Your bot token from the Discord developer portal |
| `CLIENT_ID` | Application client ID |
| `GUILD_ID` | (Optional) Guild ID for registering commands locally |

## Usage
> [!TIP]
> Run the register script whenever you add or change commands.

Start the bot in development mode:
```bash
npm run dev
```

Register commands (once per update):
```bash
npm run register
```

## Contributing
Contributions, issues and feature requests are welcome!

## License
Distributed under the [MIT License](LICENSE).

