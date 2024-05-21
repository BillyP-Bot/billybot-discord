import { REST } from "discord.js";

import { ApiResponse, UserLookup } from "@types";

import { config } from "./config";

const request = async <T>(url: string, method: string, body?: unknown) => {
	const res = await fetch(`${config.BILLY_BACKEND}/${url}`, {
		method,
		headers: {
			Authorization: `Bearer ${config.BILLY_BACKEND_TOKEN}`,
			"Content-Type": "application/json",
			"x-api-timestamp": Date.now().toString()
		},
		body: JSON.stringify(body)
	});
	const data = (await res.json()) as ApiResponse & T;
	if (!res.ok) throw data?.error ?? "internal server error";
	return data as T & UserLookup;
};

export const Api = {
	get: async <T>(url: string) => request<T>(url, "GET"),
	post: async <T>(url: string, body?: unknown) => request<T>(url, "POST", body),
	put: async <T>(url: string, body?: unknown) => request<T>(url, "PUT", body)
};

export const DiscordApi = new REST({ version: "10" }).setToken(config.BOT_TOKEN);
