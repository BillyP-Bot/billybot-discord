import { createLogger, format, Logger, transports } from "winston";

import { Config } from "../helpers";

const { combine, timestamp, json, prettyPrint } = format;

export class Log {

	private static logger: Logger;

	static Setup() {
		Log.logger = createLogger({
			level: "info",
			format: combine(
				json(),
				timestamp(),
				prettyPrint()
			),
			defaultMeta: {
				service: "user-service"
			},
			transports: [
				new transports.File({
					filename: "error.log",
					level: "error"
				}),
				new transports.File({
					filename: "combined.log",
					level: "info"
				}),
			],
		});
		
		if (!Config.IS_PROD) {
			Log.logger.add(new transports.Console({
				format: format.simple(),
			}));
		}
	}

	static Info = Log.logger.info;

	static Error = Log.logger.error;

	static Debug = Log.logger.debug;

	static Warn = Log.logger.warn;
}