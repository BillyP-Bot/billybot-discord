# billybot-discord

The one and only BillyP Bot of Boy Town.

## Local Setup:

-   Clone repo
-   Create and populate a `.env` file with proper credentials:
    -   `BOT_TOKEN=` Token found on Discord dev portal
    -   `BILLY_BACKEND=` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
    -   `BILLY_BACKEND_TOKEN=` Auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
-   Install [bun](https://bun.sh/)
-   Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
-   Run `bun install` to install package dependencies
-   Run `bun dev` to start the bot. Alternatively, install the [Bun for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode) extension and press `F5` to start debugging in VS Code. The bot will restart automatically when a file is saved.
