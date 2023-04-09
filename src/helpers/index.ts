import type {
	ChatInputCommandInteraction,
	Guild,
	GuildMember,
	Message,
	MessageReaction
} from "discord.js";

import type { ICard, IConnectFour, IUser } from "btbot-types";
import {
	BlackjackReacts,
	CardSuit,
	ConnectFourColor,
	ConnectFourReacts,
	ISOTimestamp
} from "btbot-types";
import { SearchResultVideo } from "distube";

import { commandsLookup } from "../commands";
import { BetAggregate } from "../types";
import { CommandNames, Roles } from "../types/enums";
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
	const mentions = msg.mentions.members;
	const operations =
		mentions.size >= 1 &&
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
	const mentions = msg.mentions.members;
	if (mentions.size >= 1) return mentions.first().user.id;
	// no mentions
	const _skip = skip ? skip : msg.content.split(" ")[0].length;
	const params = msg.content.slice(_skip).trim().split(" ");
	// no valid plain text mentions
	if (params[0] === "") return msg.author.id;
	return getUserIdFromUsername(params[0], msg.guild);
}

export function getServerDisplayName(msg: Message, id?: string) {
	const userId = id || getFirstMentionOrSelf(msg);
	const found = msg.guild.members.cache.find((a) => a.user.id === userId);
	return {
		name: found.displayName,
		id: found.id
	};
}

export async function mapToDisplayName(msg: Message, users: IUser[]) {
	const guildMembers = await msg.guild.members.fetch();
	const lookup = users.reduce((acc, user) => {
		const { displayName, id } = guildMembers.find((a) => a.user.id === user.user_id);
		acc[id] = displayName;
		return acc;
	}, {} as { [key: string]: string });
	return lookup;
}

export async function assertMayor(member: GuildMember) {
	await member.fetch();
	const mayorRole = member.roles.cache.find((a) => a.id == Roles.mayor);
	if (!mayorRole) throw "only the mayor can run this command!";
	return mayorRole;
}

export async function readMayor(guild: Guild) {
	await guild.members.fetch();
	const mayorRole = guild.roles.cache.find((a) => a.id == Roles.mayor);
	const currentMayor = guild.members.cache.find((a) => a.roles.cache.has(mayorRole.id));
	return { mayorRole, currentMayor };
}

export async function readFool(guild: Guild) {
	await guild.members.fetch();
	const foolRole = guild.roles.cache.find((a) => a.id == Roles.fool);
	const currentFool = guild.members.cache.find((a) => a.roles.cache.has(foolRole.id));
	return { foolRole, currentFool };
}

export async function assertDeveloper(member: GuildMember) {
	await member.fetch();
	const devRole = member.roles.cache.find((a) => a.id == Roles.developer);
	if (!devRole) throw "unauthorized";
}

export function buildReadableHand(hand: ICard[]) {
	return hand.map(({ suit, value }) => `${valueLookup[value]}${suitLookup[suit]}`);
}

export function buildBlackjackResponse(data: BlackJackGameResponse, userId: string) {
	const {
		player_hand,
		dealer_hand,
		player_count,
		is_complete,
		dealer_count,
		wager,
		status,
		billy_bucks
	} = data;
	let response = `<@${userId}>: ${player_count}\n`;
	const readablePlayer = buildReadableHand(player_hand);
	const readableDealer = buildReadableHand(dealer_hand);
	const defaultStatus = `${BlackjackReacts.hit} ${mentionCommand(CommandNames.hit)}\n${
		BlackjackReacts.stand
	} ${mentionCommand(CommandNames.stand)}\n${BlackjackReacts.doubleDown} ${mentionCommand(
		CommandNames.doubledown
	)}`;
	response += `${readablePlayer.join("  ")}\n\n`;
	response += `Dealer: ${is_complete ? dealer_count : ""}\n`;
	response += `${readableDealer.join("  ")} ${is_complete ? "" : "🎴"}\n\n`;
	response += `Bet: ${wager}\n\n`;
	response += `${status || defaultStatus}`;
	if (is_complete) {
		response += `\n\nYou now have ${billy_bucks} BillyBucks!`;
	}
	return response;
}

export function isBlackjackReact(react: MessageReaction) {
	return (
		[BlackjackReacts.hit, BlackjackReacts.stand, BlackjackReacts.doubleDown] as string[]
	).includes(react.emoji.toString());
}

export function buildConnectFourChallengeResponse(data: IConnectFour) {
	const { red_user_id, yellow_user_id, wager } = data;
	return `<@${red_user_id}> has challenged <@${yellow_user_id}> to a game of Connect Four${
		wager > 0 ? ` for ${wager} BillyBuck${pluralIfNotOne(wager)}` : ""
	}!\n\n<@${yellow_user_id}>: Run ${mentionCommand(
		CommandNames.connectfour
	)} to accept the challenge!`;
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

export async function getCurrentChallenge(server_id: string) {
	const response = await Api.get<IChallengeResponse>(
		`challenges/server/${server_id}?is_active=true`
	);
	return response.challenges[0];
}

export async function postCurrentChallenge(server_id: string) {
	const challenge = await getCurrentChallenge(server_id);
	if (!challenge) throw "There is no current challenge!";
	const { participants } = challenge;
	const mayor = participants[0].is_mayor ? participants[0] : participants[1];
	const challenger = participants[0].is_mayor ? participants[1] : participants[0];
	let content = `<@${challenger.user_id}> has challenged mayor <@${mayor.user_id}>!\n`;
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

export function buildCongratsMessage(results: IUser[]) {
	if (results.length <= 0) return "No one bet correctly!";
	let content = "Congratulations to:\n";
	results.forEach(({ user_id }) => {
		content += `<@${user_id}>\n`;
	});
	return (content += "\nfor their wise bets!");
}

export function buildCurrentBetsMessage(results: BetAggregate) {
	if (results.length <= 0) return "No one placed any bets!";
	let content = "The current bets are:\n\n";
	const participants = results.map(({ bets }) => {
		const userBets = bets.map(({ user_id, amount }) => {
			return `• <@${user_id}>:\t${amount}`;
		});
		return `<@${bets[0].user_id}>\n` + userBets.join("\n");
	});
	content += participants.join("\n\n");
	return content;
}

export class VideoQueue {
	private items: SearchResultVideo[];

	constructor() {
		this.clear();
	}

	public clear() {
		this.items = [];
	}

	public enqueue(video: SearchResultVideo) {
		this.items.push(video);
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
		return this.items.reduce((acc, video, i) => {
			return acc + (i > 0 ? `${i}. \`${video.name}\`\n` : "");
		}, "");
	}
}

export const formatDateMMDD = (birthday: ISOTimestamp) => {
	return new Date(birthday).toLocaleDateString().slice(0, -5);
};

export { Api } from "./api";
export { Embed } from "./embed";

export const isUserMention = (toCheck: string) => {
	const lengthCheck = toCheck.length === 21;
	const frontCheck = toCheck.slice(0, 2) === "<@";
	const backCheck = toCheck[20] === ">";
	return lengthCheck && frontCheck && backCheck;
};

export const getUserIdFromMention = (mention: string) => {
	if (!isUserMention(mention)) throw "Provided string is not an @mention";
	return mention.replace("<@", "").replace(">", "");
};

export const getUserIdFromUsername = (username: string, guild: Guild) => {
	const found = guild.members.cache.find(
		(a) =>
			a.user.username.toUpperCase().trim() === username.toUpperCase().trim() ||
			a.displayName.toUpperCase().trim() === username.toUpperCase().trim()
	);
	if (!found) throw `Could not find ${username} in this server`;
	return found.id;
};

export const getUserIdFromMentionOrUsername = (mentionOrUsername: string, guild: Guild) => {
	if (isUserMention(mentionOrUsername)) return getUserIdFromMention(mentionOrUsername);
	return getUserIdFromUsername(mentionOrUsername, guild);
};

export const getUserIdFromMentionOrUsernameWithDefault = (
	mentionOrUsername: string,
	guild: Guild,
	defaultUserId: string
) => {
	try {
		return getUserIdFromMentionOrUsername(mentionOrUsername, guild);
	} catch (error) {
		return defaultUserId;
	}
};

export const getInteractionOptionValue = <T>(
	optionName: string,
	int: ChatInputCommandInteraction
) => {
	return int.options.get(optionName)?.value as T;
};

export const mentionCommand = (name: string) => {
	const id = commandsLookup[name].id;
	if (!id) return `\`/${name}\``;
	return `</${name}:${id}>`;
};
