import { cwd } from "process";

import { Log } from "../services";

export class ExitHandler {
	static cleanupHandler: () => Promise<void> | undefined;

	static Setup(): void {
		process.on("uncaughtException", (err: Error) => {
			const error = (err ? err.stack || err : "").toString();
			const errorMsg = ExitHandler.CleanPath(error);
			ExitHandler.Terminate(1, errorMsg);
		});

		process.on("unhandledRejection", (err: Error) => {
			const errorMsg = `Uncaught Promise error: \n${ExitHandler.CleanPath(err.stack)}`;
			ExitHandler.Terminate(1, errorMsg);
		});

		process.on("SIGTERM", () => {
			const errorMsg = `Process ${process.pid} received a SIGTERM signal`;
			ExitHandler.Terminate(0, errorMsg);
		});

		process.on("SIGINT", () => {
			const errorMsg = `Process ${process.pid} has been interrupted`;
			ExitHandler.Terminate(0, errorMsg);
		});
	}

	static Configure(cleanup: () => Promise<void>): void {
		ExitHandler.cleanupHandler = cleanup;
	}

	private static CleanPath(message: string | undefined): string {
		if (message === undefined)
			return "";

		const root = cwd();
		const path = root.replace(/\\/g, "\\\\");
		const regex = new RegExp(`${path}\\\\`, "mg");
		return message.replace(regex, ".\\");
	}

	private static async Terminate(code: number, message: string): Promise<void> {
		// Exit function
		const exit = (): void => {
			process.exit(code);
		};

		Log.Error(message);

		// exit if cleanup takes too long
		setTimeout(exit, 500).unref();

		// Attempt a graceful shutdown
		if (ExitHandler.cleanupHandler != undefined) {
			await ExitHandler.cleanupHandler();
		}

		exit();
	}
}
