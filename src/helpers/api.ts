import { Config } from "@/helpers/config";
import { UserError } from "@/helpers/error";
import type { ApiError } from "@/types";

const request = async <T>(url: string, method: string, body?: unknown) => {
  const res = await fetch(`${Config.BILLY_BACKEND}/${url}`, {
    method,
    headers: {
      Authorization: `Bearer ${Config.BILLY_BACKEND_TOKEN}`,
      "Content-Type": "application/json",
      "x-api-timestamp": Date.now().toString(),
    },
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json();
  if (!res.ok) {
    // backend errors have an "error" field, and api gateway errors (e.g. timeouts) a "message"
    const { error, message } = (data ?? {}) as ApiError;
    const text = error ?? message ?? "internal server error";
    // the backend turns down requests it won't carry out (not enough bucks, no active game, etc)
    // with a 4xx status and a message for the user. a 5xx means something actually went wrong, and
    // a 403 means the backend rejected the bot's own credentials (token or clock)
    if (res.status >= 500 || res.status === 403) throw new Error(text);
    throw new UserError(text);
  }
  return data as T;
};

export const Api = {
  get: async <T>(url: string) => request<T>(url, "GET"),
  post: async <T>(url: string, body?: unknown) => request<T>(url, "POST", body),
  put: async <T>(url: string, body?: unknown) => request<T>(url, "PUT", body),
};
