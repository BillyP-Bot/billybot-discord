# billybot-discord

The one and only BillyP Bot of Boy Town!

## Develop & Test:

-   Clone repo
-   Create and populate a `.env` file with proper credentials:
    -   `NODE_ENV=development`
    -   `BOT_TOKEN=` Token found on Discord dev portal
    -   `BILLY_BACKEND=` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
    -   `BILLY_BACKEND_TOKEN=` Auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
-   Install [bun](https://bun.sh/)
-   Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
-   Run `bun install` to install package dependencies
-   Run `bun run dev` or press `F5` in VS Code to start project (will restart when a file is saved)
