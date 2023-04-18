import { Client } from "discord.js";
import DisTubeClient from "distube";
import { Video } from "youtube-sr";

import { IDisTube } from "@types";

export class Queue<T = any> {
	private items: T[];
	constructor() {
		this.clear();
	}
	public clear() {
		this.items = [];
	}
	public enqueue(item: T) {
		this.items.push(item);
	}
	public dequeue() {
		this.items.shift();
	}
	public front() {
		return this.items[0];
	}
	public length() {
		return this.items.length;
	}
	public list() {
		return this.items;
	}
}

export const DisTube: IDisTube = {
	client: null,
	queue: new Queue<Video>()
};

export const initDisTubeClient = (client: Client) => {
	if (!DisTube.client) DisTube.client = new DisTubeClient(client, { leaveOnStop: false });
};
