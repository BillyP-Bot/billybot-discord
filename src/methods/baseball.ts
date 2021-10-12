import { Message, MessageEmbed, GuildMember } from "discord.js";
import { Colors } from "../types/Constants";

import { Baseball } from "../models/Baseball";
import { BaseballRepository as BaseballRepo } from "../repositories/BaseballRepository";
import { User } from "../models/User";
import { UserRepository as UserRepo } from "../repositories/UserRepository";

// !baseball @[username] / !baseball
export const game = async (msg: Message, prefix: string, mention: GuildMember): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		if (args[0] === "") args.splice(0, 1);
		if (args.length > 1) throw "Invalid format! Expects 0 or 1 argument.";

		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);

		// if the user is already in an active game, show the gamestate (or error if the user tries to @ a player to start another)
		if (user.inBaseballGame) {
			if (args.length > 0 || mention) throw "You are already in an ongoing baseball game! Cannot start another. Run ```!baseball``` with no arguments to view the state of your active game.";

			// show the current state of the game
			const game = await BaseballRepo.FindActiveGameForUser(user, msg.guild.id);
			if (game) return replyWithGamestateEmbed(msg, game);
		} else {
			// if the user is not already in an active game but there are no users mentioned to send a challenge to, throw error
			if (args.length === 0 && !mention) throw "No active baseball game found! Run ```!baseball @[username]``` to challenge another user to a game, or to accept another user's pending challenge to you.";

			const opponentGuildMember = mention ? mention : findGuildMemberByUsername(msg, args[0]);
			if (msg.author.id === opponentGuildMember.user.id) throw "You cannot challenge yourself to a baseball game!";

			const opponentUser = await UserRepo.FindOne(opponentGuildMember.user.id, msg.guild.id);
			if (opponentUser.inBaseballGame) throw `Cannot challenge this user! <@${opponentUser.userId}> is already in an ongoing baseball game.`;

			// is there already an existing challenge from the opponent user?
			const existingChallengeFromOpponentUser = await BaseballRepo.FindActiveGameForUser(opponentUser, msg.guild.id, true);
			if (existingChallengeFromOpponentUser) {
				// if that challenge sent to this user, accept the challenge and start the game
				if (existingChallengeFromOpponentUser.homeTeam.userId === user.userId) {
					return acceptChallengeAndStartGame(msg, existingChallengeFromOpponentUser, opponentUser, user);
				} else throw `<@${opponentUser.userId}> already has a pending baseball game challenge sent to <@${existingChallengeFromOpponentUser.homeTeam.userId}>!`;
			}

			// does a challenge sent by this user already exist (but has not yet been accepted)? if so, allow user to challenge a different user.
			// (if original opponent user challenged is not responding or has since accepted a different challenge, for example)
			const existingChallengeToOpponentUser = await BaseballRepo.FindActiveGameForUser(user, msg.guild.id, true);
			if (existingChallengeToOpponentUser) {
				const updated = await BaseballRepo.UpdateHomeTeam(existingChallengeToOpponentUser, opponentUser);
				if (updated) return replyWithSuccessEmbed(msg, "Baseball", `<@${user.userId}> challenged <@${opponentUser.userId}> to a baseball game!\n\n` + 
				`<@${opponentUser.userId}>: run\`\`\`!baseball @${user.username}\`\`\` to accept the challenge.`);
			}

			// if there is no existing challenge already, create a new one to send to the opponent user
			const newChallengeCreated = await BaseballRepo.InsertOne(msg.guild.id, user, opponentUser);
			if (newChallengeCreated) return replyWithSuccessEmbed(msg, "Baseball", `<@${user.userId}> challenged <@${opponentUser.userId}> to a baseball game!\n\n` + 
				`<@${opponentUser.userId}>: run\`\`\`!baseball @${user.username}\`\`\` to accept the challenge.`);
		}
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

// !swing
export const swing = async (msg: Message): Promise<void> => {
	replyWithSuccessEmbed(msg, "Baseball", `<@${msg.author.id}> swung!`);

	// TODO
};

const acceptChallengeAndStartGame = async (msg: Message, game: Baseball, awayTeam: User, homeTeam: User): Promise<void> => {
	game.inning = "T1";
	awayTeam.inBaseballGame = true;
	homeTeam.inBaseballGame = true;

	const updated = await BaseballRepo.UpdateOne(game) &&
					await UserRepo.UpdateOne(awayTeam) &&
					await UserRepo.UpdateOne(homeTeam);

	if (updated) return replyWithSuccessEmbed(msg, "Baseball", `<@${homeTeam.userId}> accepted a baseball game challenge from <@${awayTeam.userId}>. Play ball!`);
};

const replyWithGamestateEmbed = (msg: Message, game: Baseball): void => {
	replyWithSuccessEmbed(msg, "Baseball", getGamestate(game));
};

const getGamestate = (game: Baseball): string => {
	return `<@${game.awayTeam.userId}>: ${game.awayTeamRuns} | <@${game.homeTeam.userId}>: ${game.homeTeamRuns}\n\n` + 
	getInningAndOutsDisplayText(game.inning, game.outs) + "\n" +
	getBaserunnersDisplayText(game.bases) + "\n\n" + 
	getUserActionPromptDisplayText(game);
};

const getInningAndOutsDisplayText = (inning: string, outs: number): string => {
	let inningHalf: string = (inning.charAt(0) === "T" ? "Top" : "Bottom") + " of the ";
	let inningNumSuffix: string;
	const inningNum: string = inning.slice(1);
	
	if (inningNum.endsWith("1") && !inningNum.endsWith("11")) {
		inningNumSuffix = "st";
	} else if (inningNum.endsWith("2") && !inningNum.endsWith("12")) {
		inningNumSuffix = "nd";
	} else if (inningNum.endsWith("3") && !inningNum.endsWith("13")) {
		inningNumSuffix = "rd";
	} else {
		inningNumSuffix = "th";
	}

	let outsText: string = `, ${outs} Out${outs === 1 ? "" : "s"}`;

	return inningHalf + inningNum + inningNumSuffix + outsText;
};

const getBaserunnersDisplayText = (bases: string): string => {
	switch (bases) {
	case "000": return "Bases Empty";
	case "100": return "Runner on 1st";
	case "010": return "Runner on 2nd";
	case "001": return "Runner on 3rd";
	case "110": return "Runners on 1st & 2nd";
	case "101": return "Runners on 1st & 3rd";
	case "011": return "Runners on 2nd & 3rd";
	case "111": return "Bases Loaded";
	default: throw "Invalid format!";
	}
};

const getUserActionPromptDisplayText = (game: Baseball): string => {
	const teamAtBatUserId: string = game.inning.charAt(0) === "T" ? game.awayTeam.userId : game.homeTeam.userId;
	return `<@${teamAtBatUserId}> is up to bat. Here comes the pitch! Run ` + "```!swing``` to take a swing.";
};

const findGuildMemberByUsername = (msg: Message, username: string): GuildMember => {
	const found = msg.guild.members.cache.find(member => member.user.username.toUpperCase().trim() === username.toUpperCase().trim());
	if (found) return found;
	else throw `${username}: User not found!`;
};

const replyWithSuccessEmbed = (msg: Message, title: any, body: any): void => {
	const successEmbed: MessageEmbed = new MessageEmbed();
	successEmbed.setColor(Colors.green).setTitle(title);
	successEmbed.setDescription(body);
	msg.reply(successEmbed);
};

const replyWithErrorEmbed = (msg: Message, error: any): void => {
	const errorEmbed: MessageEmbed = new MessageEmbed();
	errorEmbed.setColor(Colors.red).setTitle("Error");
	errorEmbed.setDescription(error);
	msg.reply(errorEmbed);
};