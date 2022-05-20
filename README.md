# BT-Bots

Discord Bots written in JS

# Discord.js library:

https://discord.js.org/#/docs/main/11.1.0/general/welcome

# Develop & Test:

-   Clone repo
-   Fill .env file with proper credentials
    -   `NODE_ENV`=development
        -   `BOT_TOKEN` token found on discord dev portal
    -   `BILLY_BACKEND` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
    -   `BILLY_BACKEND_TOKEN` auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
        -   Necessary to run functions with Google API calls:
            -   `GOOGLE_API_KEY`
            -   `GOOGLE_CX_KEY`
-   Download and install [Node.js](https://nodejs.org/en/download/)
-   Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
-   Run `npm i -g yarn` to install yarn globally
-   Run `yarn` to ensure that the local project has all packages installed
-   Run `yarn dev` to start project (will restart everytime a file is saved)
