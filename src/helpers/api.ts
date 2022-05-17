import { create } from "apisauce";

import { config } from "./config";
import type { ApiResponse, UserLookup } from "../types";

export class Api {

	public static readonly client = create({
		baseURL: config.BILLY_BACKEND,
		headers: {
			"Authorization": `Bearer ${config.BILLY_BACKEND_TOKEN}`,
			"x-api-timestamp": null
		}
	})

	public static async get<T>(url: string) {
		const { data, ok } = await Api.client.get<ApiResponse & T>(url);
		if (!ok) throw data.error ?? "internal server error";
		return data as T & UserLookup;
	}

	public static async post<T>(url: string, body?: any) {
		const { data, ok } = await Api.client.post<ApiResponse & T>(url, body);
		if (!ok) throw data.error ?? "internal server error";
		return data as T & UserLookup;
	}

	public static async put<T>(url: string, body?: any) {
		const { data, ok } = await Api.client.put<ApiResponse & T>(url, body);
		if (!ok) throw data.error ?? "internal server error";
		return data as T & UserLookup;
	}
}

Api.client.axiosInstance.interceptors.request.use((config) => {
	config.headers["x-api-timestamp"] = new Date().getTime();
	return config;
});