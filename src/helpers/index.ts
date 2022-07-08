import type { Message, MessageReaction } from "discord.js";

import type { ICard, IConnectFour, IUser } from "btbot-types";
import { BlackjackReacts, CardSuit, ConnectFourColor, ConnectFourReacts } from "btbot-types";
import { Video } from "youtube-sr";

import { Roles } from "../types/enums";
import { Api } from "./api";
import { Embed } from "./embed";

import type { BlackJackGameResponse, IChallengeResponse } from "../types";
export const suitLookup: Record<CardSuit, string> = {
	[CardSuit.clubs]: "♣️",
	[CardSuit.hearts]: "♥️",
	[CardSuit.spades]: "♠️",
	[CardSuit.diamonds]: "♦️"
};

export const valueLookup: Record<number, string> = {
	1: "A",
	2: "2",
	3: "3",
	4: "4",
	5: "5",
	6: "6",
	7: "7",
	8: "8",
	9: "9",
	10: "10",
	11: "J",
	12: "Q",
	13: "K"
};

export async function updateEngagementMetrics(msg: Message) {
	const server_id = msg.guild.id;
	const mentions = msg.mentions.members.array();
	const operations =
		mentions.length >= 1 &&
		mentions.reduce((acc, { user }) => {
			if (user.bot) return acc;
			if (user.id === msg.author.id) return acc;
			acc.push({
				server_id,
				user_id: user.id,
				engagement: { mentions: 1 }
			});
			return acc;
		}, []);
	const body = [
		{
			server_id,
			user_id: msg.author.id,
			engagement: { posts: 1 }
		},
		...(operations ? operations : [])
	];
	return Api.put("metrics/engagement", body);
}

export function getFirstMentionOrSelf(msg: Message, skip?: number) {
	const mentions = msg.mentions.members.array();
	if (mentions.length >= 1) return mentions[0].user.id;
	// no mentions
	const _skip = skip ? skip : msg.content.split(" ")[0].length;
	const params = msg.content.slice(_skip).trim().split(" ");
	// no valid plain text mentions
	if (params[0] === "") return msg.author.id;
	const found = msg.guild.members.cache.find(
		(a) => a.user.username.toUpperCase().trim() === params[0].toUpperCase().trim()
	);
	if (!found) throw `could not find ${params[0]} in this server`;
	return found.user.id;
}

export function getServerDisplayName(msg: Message, id?: string) {
	const userId = id || getFirstMentionOrSelf(msg);
	const found = msg.guild.members.cache.find((a) => a.user.id === userId);
	return {
		name: found.displayName,
		id: found.id
	};
}

export function mapToDisplayName(msg: Message, users: IUser[]) {
	const lookup = users.reduce((acc, user) => {
		const { displayName, id } = msg.guild.members.cache.find((a) => a.user.id === user.user_id);
		acc[id] = displayName;
		return acc;
	}, {} as { [key: string]: string });
	return lookup;
}

export async function assertMayor(msg: Message) {
	await msg.member.fetch();
	const mayorRole = msg.member.roles.cache.find((a) => a.name == Roles.mayor);
	if (!mayorRole) throw "only the mayor can run this command!";
	return mayorRole;
}

export async function readMayor(msg: Message) {
	await msg.guild.members.fetch();
	const mayorRole = msg.guild.roles.cache.find((a) => a.name == Roles.mayor);
	const currentMayor = msg.guild.members.cache.find((a) => a.roles.cache.has(mayorRole.id));
	return { mayorRole, currentMayor };
}

export async function readFool(msg: Message) {
	await msg.guild.members.fetch();
	const foolRole = msg.guild.roles.cache.find((a) => a.name == Roles.fool);
	const currentFool = msg.guild.members.cache.find((a) => a.roles.cache.has(foolRole.id));
	return { foolRole, currentFool };
}

export async function assertDeveloper(msg: Message) {
	await msg.member.fetch();
	const devRole = msg.member.roles.cache.find((a) => a.name == Roles.developer);
	if (!devRole) throw "unauthorized";
}

export function buildReadableHand(hand: ICard[]) {
	return hand.map(({ suit, value }) => `${valueLookup[value]}${suitLookup[suit]}`);
}

export function buildBlackjackResponse(data: BlackJackGameResponse, userId: string) {
	const { player_hand, dealer_hand } = data;
	let response = `<@${userId}>: ${data.player_count}\n`;
	const readablePlayer = buildReadableHand(player_hand);
	const readableDealer = buildReadableHand(dealer_hand);
	response += `${readablePlayer.join("  ")}\n\n`;
	response += `Dealer: ${data.is_complete ? data.dealer_count : ""}\n`;
	response += `${readableDealer.join("  ")} ${data.is_complete ? "" : "🎴"}\n\n`;
	response += `Bet: ${data.wager}\n\n`;
	response += `${data.status}`;
	if (data.is_complete) {
		response += `\n\nYou now have ${data.billy_bucks} BillyBucks!`;
	}
	return response;
}

export function isBlackjackReact(react: MessageReaction) {
	return (
		[BlackjackReacts.hit, BlackjackReacts.stand, BlackjackReacts.doubleDown] as string[]
	).includes(react.emoji.toString());
}

export function buildConnectFourChallengeResponse(data: IConnectFour, msg: Message) {
	const { red_user_id, yellow_user_id, wager } = data;
	return `<@${red_user_id}> has challenged <@${yellow_user_id}> to a game of Connect Four${
		wager > 0 ? ` for ${wager} BillyBuck${pluralIfNotOne(wager)}` : ""
	}!\n\n<@${yellow_user_id}>: Run...\`\`\`!connectfour @${
		msg.author.username
	}\`\`\`...to accept the challenge!`;
}

export function buildConnectFourMoveResponse(data: IConnectFour) {
	const { board, red_user_id, yellow_user_id, to_move, is_complete, wager } = data;

	let message =
		ConnectFourReacts.one +
		ConnectFourReacts.two +
		ConnectFourReacts.three +
		ConnectFourReacts.four +
		ConnectFourReacts.five +
		ConnectFourReacts.six +
		ConnectFourReacts.seven +
		"\n\n";

	for (let i = 5; i >= 0; i--) {
		for (let j = 0; j < 7; j++) {
			const pos = board[j][i];
			message +=
				pos == ConnectFourColor.red
					? ConnectFourColor.red
					: pos == ConnectFourColor.yellow
					? ConnectFourColor.yellow
					: ConnectFourColor.empty;
		}
		message += "\n";
	}
	message += "\n";

	message += `${ConnectFourColor.red}: <@${red_user_id}>\n`;
	message += `${ConnectFourColor.yellow}: <@${yellow_user_id}>\n\n`;

	if (is_complete) {
		if (to_move) {
			message += `Four in a row for ${
				to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
			} - <@${to_move}> wins${
				wager > 0 ? ` and scoops the pot of ${wager * 2} BillyBucks` : ""
			}!`;
		} else {
			message += `It's a draw!${
				wager > 0
					? ` The wager amount of ${wager} BillyBuck${pluralIfNotOne(
							wager
					  )} is returned to each player.`
					: ""
			}`;
		}
		return message;
	}

	message += `${
		to_move === red_user_id ? ConnectFourColor.red : ConnectFourColor.yellow
	} to move - <@${to_move}>'s turn!`;
	return message;
}

export function isConnectFourReact(react: MessageReaction) {
	return (
		[
			ConnectFourReacts.one,
			ConnectFourReacts.two,
			ConnectFourReacts.three,
			ConnectFourReacts.four,
			ConnectFourReacts.five,
			ConnectFourReacts.six,
			ConnectFourReacts.seven
		] as string[]
	).includes(react.emoji.toString());
}

export const getTrendEmoji = (delta: number) => {
	switch (true) {
		case delta > 0:
			return "📈";
		case delta < 0:
			return "📉";
		default:
			return "";
	}
};

export const plusSignIfNotNegative = (amount: number) => (amount >= 0 ? "+" : "");

export const pluralIfNotOne = (amount: number) => (amount === 1 ? "" : "s");

export async function getCurrentChallenge(msg: Message) {
	const response = await Api.get<IChallengeResponse>(
		`challenges/server/${msg.guild.id}?is_active=true`
	);
	return response.challenges[0];
}

export async function postCurrentChallenge(msg: Message) {
	const challenge = await getCurrentChallenge(msg);
	if (!challenge) throw "There is no current challenge!";
	const { participants } = challenge;
	const mayor = participants[0].is_mayor ? participants[0] : participants[1];
	const challenger = participants[0].is_mayor ? participants[1] : participants[0];
	const { name: mayorName } = getServerDisplayName(msg, mayor.user_id);
	const { name: challengerName } = getServerDisplayName(msg, challenger.user_id);
	let content = `\`${challengerName}\` has challenged mayor \`${mayorName}\`!\n`;
	content += "Use Command\n\n";
	const mentions = participants.map(({ user_id }) => {
		return `\`!bet\` <@${user_id}>`;
	});
	content += mentions.join(" or \n");
	content += "\nto bet on a winner\n\n";
	content += `>>> ${challenge.details}`;
	const embed = Embed.success(content, "Current Challenge");
	return embed;
}

export function buildCongratsMessage(msg: Message, results: IUser[]) {
	if (results.length <= 0) return "No one bet correctly!";
	let content = "Congratulations to:\n";
	const usernames = results.map(({ user_id }) => {
		const { name } = getServerDisplayName(msg, user_id);
		return name;
	});
	content += usernames.join(", \n");
	return (content += "\nfor their wise bets!");
}

export class VideoQueue {
	items: Video[];

	constructor() {
		this.clear();
	}

	public clear() {
		this.items = [];
	}

	public enqueue(video: Video) {
		this.items.push(video);
	}

	public dequeue() {
		this.items.shift();
	}

	public next() {
		return this.items[0];
	}
}

export { Api } from "./api";
export { Embed } from "./embed";
