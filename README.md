# billybot-discord

The one and only BillyP Bot of Boy Town.

## Local Setup:

This project uses [bun](https://bun.sh) as a runtime and package manager, which as of bun v1.0.11 is fully supported on [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), MacOS, and Linux. Windows currently has only partial experimental support, and will not be able to run this project locally.

-   Clone repo
-   Create and populate a `.env` file with proper credentials:
    -   `BOT_TOKEN=` Token found on Discord dev portal
    -   `BILLY_BACKEND=` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
    -   `BILLY_BACKEND_TOKEN=` Auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
-   Install [bun](https://bun.sh/)
-   Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
-   Run `bun i` to install package dependencies
-   Run `bun dev` to start the bot. Alternatively, install the [Bun for Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=oven.bun-vscode) extension and press `F5` to start debugging in VS Code. Either way, the bot will restart automatically when a file is saved.
