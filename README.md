# billybot-discord

The one and only BillyP Bot of Boy Town!

## Local Setup:

This project uses [bun](https://bun.sh) as a runtime and package manager, which currently fully supported on [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), MacOS, and Linux.

-   Clone repo
-   Create and populate a `.env` file with proper credentials:
    -   `BOT_TOKEN=` Token found on Discord dev portal
    -   `BILLY_BACKEND=` API endpoint for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
    -   `BILLY_BACKEND_TOKEN=` Auth token for the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend)
-   Install [bun](https://bun.sh/)
-   Set up the [billybot-backend](https://github.com/BillyP-Bot/billybot-backend) to run locally
-   Run `bun i` to install package dependencies
-   Run `bun dev` or press `F5` in VS Code to start project (will restart when a file is saved)

If running both the Discord bot and the backend in WSL, enable the following Docker Desktop settings to allow the backend to access Docker Desktop running natively on the Windows host:

-   Settings -> General -> Use the WSL 2 based engine
-   Settings -> Resources -> WSL integration -> Enable integration with my default WSL distro (or additional distros as needed)

Then add/edit the following line to your `~/.bashrc` file in WSL:

```bash
export DOCKER_HOST=unix:///var/run/docker.sock
```
