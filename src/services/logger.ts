import { createLogger, format, transports } from "winston";

import {Config} from "../helpers";

const { combine, timestamp, json, prettyPrint } = format;

const logger = createLogger({
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
	logger.add(new transports.Console({
		format: format.simple(),
	}));
}

export default logger;