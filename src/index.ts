import "dotenv/config";
import "reflect-metadata";

import { Config, ExitHandler } from "./helpers";
import { Bot, Database, Log } from "./services";

(async () => {
	Log.Setup();

	ExitHandler.Setup();

	Config.Validate();

	await Database.Connect();
	await Bot.Setup();

	ExitHandler.Configure(async () => {
		await Bot.Close();
		await Database.Close();
	});
})();