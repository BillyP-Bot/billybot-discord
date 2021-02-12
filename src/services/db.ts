import mongoose from "mongoose";

import logger from "../services/logger";
import config from "../helpers/config";

export default async (): Promise<void> => {
	let connection: string | undefined;
	try {
		connection = mongoose.connection.host;
	} catch (e) {
		logger.error("error connecting to db", e);
	}

	try {
		if (connection) {
			await mongoose.connect(connection);
		} else {
			await mongoose.connect(config.CONNECTION_STRING, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				useFindAndModify: false,
				useCreateIndex: true,
				poolSize: 10,
				serverSelectionTimeoutMS: 5000,
				socketTimeoutMS: 45000
			});
		}
		logger.info("connected to db");
	} catch (e) {
		logger.error("error connecting to db", e);
		throw Error(e);
	}
};