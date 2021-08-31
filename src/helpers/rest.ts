import axios from "axios";

import { ILogBody } from "../types/Abstract";
import config from "./config";

export class Rest {

	public static readonly Client = axios.create({
		baseURL: "https://btbackend.herokuapp.com/",
		headers: { appcode: config.APPCODE }
	});

	public static async PostLog({ log, issuer }: ILogBody) {
		return await Rest.Client.post("api/logs/newlog", { log, issuer });
	}
}