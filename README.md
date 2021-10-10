# BT-Bots
Discord Bots written in JS

# Discord.js library:
https://discord.js.org/#/docs/main/11.1.0/general/welcome

# Develop & Test:
- Clone Repo
- Fill .env file with proper credentials
    - BOT_TOKEN = token found on discord dev portal (will likely have to have a new bot created or issues will occur)
    - Necessary to run functions with Google API calls:
        - GOOGLE_API_KEY
        - GOOGLE_CX_KEY
- Run 'npm i' to ensure that the local project has all packages installed
- Run 'npm start' to start project (will restart everytime a file is saved)


## Host Database Locally via Docker
- _Prereq - Docker Desktop installed and setup_
- _Prereq - Postgres Explorer extension installed on IDE_
- Adjust `ormconfig.ts` "ssl" param to `ssl: process.env["NODE_ENV"] === "dev" ? { rejectUnauthorized: false } : false`
- `npm run db:generate` to generate database migration script
- `npm run db:up` to populate postgres db
- Use Postgres Explorer extension to add connection (values in .env file; host = 'localhost') 