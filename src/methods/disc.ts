import axios from "axios";
import { Message } from "discord.js";

import { MessagesMethods } from "./messages";
import { IDisc } from "../types";

export class DiscMethods {

	private static readonly DISC_NAME_URL = "https://discitapi.herokuapp.com/disc/name/";
	
	static async Disc(msg: Message, prefix: string) {
		try {
			const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
			const name: string = args[0];
			if (!name) throw "Must provide a disc name to search for!\n```!disc [name]```";
	
			const res = await axios.get(DiscMethods.DISC_NAME_URL + name);
			if (!res) throw "Unexpected error searching for disc!";
	
			const discs: IDisc[] = res.data.sort(DiscMethods.CompareDiscSlugsAlphabeticallyForSort);
			const disc: IDisc = discs[0];
			if (!disc) throw `No disc found for name: '${name}'`;
	
			const output =
				(disc.name.toLowerCase() !== disc.name_slug ? `\`${disc.name_slug}\`\n\n` : "") +
				`Brand: \`${disc.brand}\`\n` +
				`Category: \`${disc.category}\`\n` +
				`Stability: \`${disc.stability}\`\n\n` +
				`Speed: \`${disc.speed}\`\n` +
				`Glide: \`${disc.glide}\`\n` +
				`Turn: \`${disc.turn}\`\n` +
				`Fade: \`${disc.fade}\`\n\n` +
				`Shop for ${disc.name} discs:\n` +
				`${disc.link}\n\n` +
				(res.data.length > 1 ?
					"Other discs with a similar name:\n" +
					DiscMethods.GetOtherDiscNames(res.data, disc.name_slug) : ""
				);
	
			MessagesMethods.ReplyWithSuccessEmbed(msg, disc.name, output);
			if (disc.pic) msg.channel.send(disc.pic);
		} catch (error) {
			MessagesMethods.ReplyWithErrorEmbed(msg, error);
		}
	}
	
	private static GetOtherDiscNames(discs: IDisc[], currentDiscSlug: string): string {
		let names = "";
		let count = 1;
		for (const disc of discs) {
			if (disc.name_slug !== currentDiscSlug) {
				names += (names ? ", " : "") + disc.name + (disc.name.toLowerCase() !== disc.name_slug ? ` (${disc.name_slug})` : "");
				count++;
				if (count > 10) break;
			}
		}
		return names;
	}
	
	private static CompareDiscSlugsAlphabeticallyForSort(a: IDisc, b: IDisc): number {
		return a.name_slug.localeCompare(b.name_slug);
	}

}