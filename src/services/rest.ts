import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

import config from "../helpers/config";

export class Rest {

	private static readonly BackendClient = axios.create({
		baseURL: "https://btbackend.herokuapp.com/api/",
		headers: {
			"Content-Type": "application/json",
			"appcode": config.BACKEND_TOKEN
		}
	});

	public static async Post(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<any>> {
		try {
			return await Rest.BackendClient.post(url, data, config);
		} catch (error) {
			throw new Error(error);
		}
	}

}
