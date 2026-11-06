# billybot-discord

The one and only BillyP Bot of Boy Town!

## Local Setup

- Clone the repo
- Install [bun](https://bun.sh/)
- Run `bun install` to install package dependencies
- Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
- Create and populate a `.env` file with proper credentials:
  - `BOT_TOKEN=` Token found on the Discord dev portal
  - `GUILD_ID=` ID of the Discord server to register the slash commands in
  - `BILLY_BACKEND=` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
  - `BILLY_BACKEND_TOKEN=` Auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
- Run `bun dev` to start the bot. Alternatively, install the [Bun for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode) extension and press `F5` to start debugging in VS Code. The bot will restart automatically when a file is saved.

In development mode the bot only responds in channels named `bot-testing`, and in production mode it responds everywhere except those channels (in any server).

## Checks

- `bun check` lints and checks formatting (`bun format` fixes formatting)
- `bun tsc` type checks

## Deployment

Pushing to `main` deploys the bot to [fly.io](https://fly.io) (see `.github/workflows/deploy.yml`).
