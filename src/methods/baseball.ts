import { Message, GuildMember } from "discord.js";

import { Baseball } from "../models/Baseball";
import { BaseballRepository as BaseballRepo } from "../repositories/BaseballRepository";
import { User } from "../models/User";
import { UserRepository as UserRepo } from "../repositories/UserRepository";
import { IAtBatOutcome } from "../types/Abstract";
import { IBaserunningResult } from "../types/Abstract";
import { replyWithSuccessEmbed, replyWithErrorEmbed } from "./messages";

const innings: number = 5;

/*
	!baseball @[username]
	when current user is not already in an active game: challenge another user to a game, or accept a challenge that has already been extended to you

	!baseball
	when current user is already in an active game: show the current state of the game
*/
export const baseball = async (msg: Message, prefix: string, mention: GuildMember): Promise<void> => {
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
			if (game) return showGamestate(msg, game);
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

/*
	!swing
	when current user is already in an active game, and is currently at bat: get a random "at bat outcome" and update the gamestate accordingly
*/
export const swing = async (msg: Message): Promise<void> => {
	try {
		const user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		const game = await BaseballRepo.FindActiveGameForUser(user, msg.guild.id);
		if (!game) throw "No active baseball game found! Run ```!baseball @[username]``` to challenge another user to a game, or to accept another user's pending challenge to you.";

		const atBatUserId = game.inning.charAt(0) === "T" ? game.awayTeam.userId : game.homeTeam.userId;
		if (user.userId !== atBatUserId) throw `Whoah, easy there, slugger! Wait your turn! Your opponent <@${atBatUserId}> is currently at bat.`;

		const atBatOutcome = getAtBatOutcome(game);
		const updatedGame = atBatOutcome.game;

		let saved, removed;

		// check if game is over
		let gameOverOutput = "";
		if (updatedGame.gameOver) {
			const winnerUserId = updatedGame.awayTeamRuns > updatedGame.homeTeamRuns ? updatedGame.awayTeam.userId : updatedGame.homeTeam.userId;
			gameOverOutput = `Game Over! <@${winnerUserId}> wins!\n\n`;
			removed = await BaseballRepo.RemoveOne(game, winnerUserId);
		} else {
			saved = await BaseballRepo.UpdateOne(game);
		}
		
		if (removed || saved) {
			const body = `${atBatOutcome.output}\n\n` + 
			gameOverOutput +
			getGamestate(updatedGame);
			return replyWithSuccessEmbed(msg, "Baseball", body);
		}
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

/*
	!baseballrecord @[username]
	get the win/loss record for the specified user, or for the current user if run with no arguments
*/
export const getRecord = async (msg: Message, prefix: string, mention: GuildMember): Promise<void> => {
	try {
		const args: string[] = msg.content.slice(prefix.length).trim().split(" ");
		if (args[0] === "") args.splice(0, 1);
		if (args.length > 1) throw "Invalid format! Expects 0 or 1 argument.";

		let user;
		if (args.length === 1 || mention) {
			const guildMember = mention ? mention : findGuildMemberByUsername(msg, args[0]);
			user = await UserRepo.FindOne(guildMember.user.id, msg.guild.id);
		} else {
			user = await UserRepo.FindOne(msg.author.id, msg.guild.id);
		}

		if (!user) throw "Unable to retrieve baseball record!";
		replyWithSuccessEmbed(msg, "Baseball Record", `<@${user.userId}>\n\nWins: ${user.baseballWins}\nLosses: ${user.baseballLosses}`);
	} catch (error) {
		replyWithErrorEmbed(msg, error);
	}
};

// 21 outcomes: hit (6), walk (3), out (12)
const getAtBatOutcome = (game: Baseball): IAtBatOutcome => {
	const roll = getAtBatRoll();
	switch (true) {
	case roll <= 6:
		return hit(game, roll);
	case roll <= 9:
		return walk(game);
	default:
		return out(game, roll);
	}
};

// random int 1 thru 21 inclusive
const getAtBatRoll = (): number => {
	return Math.floor(Math.random() * 21) + 1;
};


// 6 outcomes: single (2), double (2), triple (1), home run (1)
const hit = (game: Baseball, roll: number): IAtBatOutcome => {
	let result, output;
	switch (true) {
	case roll <= 2:
		result = advanceBatterAndBaserunners(game.bases, 1); // single
		output = "It's a single!";
		break;
	case roll <= 4:
		result = advanceBatterAndBaserunners(game.bases, 2); // double
		output = "It's a double!";
		break;
	case roll <= 5:
		result = advanceBatterAndBaserunners(game.bases, 3); // triple
		output = "Oooh baby, a triple!";
		break;
	default:
		result = advanceBatterAndBaserunners(game.bases, 4); // home run
		output = "Home run! It's outta here!";
		break;
	}

	if (result) {
		output += getRunsScoredDisplayText(result.rbi);
		game.bases = result.bases;
		getInningHalf(game.inning) === "T" ? game.awayTeamRuns += result.rbi : game.homeTeamRuns += result.rbi;
	}

	if (isGameOver(game)) game.gameOver = true;
	return { game, output };
};

// 3 outcomes: walk (3)
const walk = (game: Baseball): IAtBatOutcome => {
	let output = "That's a walk, take your base!";
	const result = advanceBatterAndBaserunners(game.bases, 1, true); // optional 3rd param indicates to only advance baserunners if forced

	if (result) {
		output += getRunsScoredDisplayText(result.rbi);
		game.bases = result.bases;
		getInningHalf(game.inning) === "T" ? game.awayTeamRuns += result.rbi : game.homeTeamRuns += result.rbi;
	}

	if (isGameOver(game)) game.gameOver = true;
	return { game, output };
};

// 12 outcomes: fly out/sac fly (1), ground out/double play (1), ground out (3), pop out (2), fly out (3), strike out (2)
const out = (game: Baseball, roll: number): IAtBatOutcome => {
	let result, output;
	switch(true) {
	case roll <= 10:
		if (game.outs < 2 && atLeastOneBaserunnerIsOn(game.bases)) {
			result = advanceBaserunnersOnly(game.bases, 1); // fly out (sac fly if less than 2 outs and at least one runner is on base)
			output = "It's a sac fly! The batter is out, but the runners advance!";
		} else {
			output = "Fly out!";
		}
		game.outs++;
		break;
	case roll <= 11:
		if (game.outs < 2 && game.bases.charAt(0) === "1") { // ground out (double play if force available)
			output = "It's a double play!";
			game.outs += 2;
			// update the bases appropriately for a double play
			if (game.bases === "111") {
				game.bases = "011";
			} else if (game.bases === "110") {
				game.bases = Math.floor(Math.random() * 2) === 0 ? "010" : "001";
			} else if (game.bases === "101") {
				game.bases = "001";
			} else if (game.bases === "100") {
				game.bases = "000";
			}
		} else {
			output = "Ground out!";
			game.outs ++;
		}
		break;
	case roll <= 14:
		output = "Ground out!";
		game.outs++; // ground out
		break;
	case roll <= 16:
		output = "Pop out!";
		game.outs++; // pop out
		break;
	case roll <= 19:
		output = "Fly out!";
		game.outs++; // fly out
		break;
	default:
		output = "Strikeout!";
		game.outs++; // strike out
	}

	if (result) {
		output += getRunsScoredDisplayText(result.rbi);
		game.bases = result.bases;
		getInningHalf(game.inning) === "T" ? game.awayTeamRuns += result.rbi : game.homeTeamRuns += result.rbi;
	}

	if (isGameOver(game)) {
		game.gameOver = true;
		if (game.outs === 3) output += " The side is retired.";
	} else if (game.outs === 3){
		game.outs = 0;
		game.bases = "000";
		game.inning = advanceInning(game.inning);
		output += " The side is retired.";
	}
	return { game, output };
};

const advanceInning = (inning: string): string => {
	const isTop: boolean = getInningHalf(inning) === "T";
	const inningNum: number = getInningNum(inning);

	return (isTop ? "B" : "T") + (isTop ? inningNum : inningNum + 1).toString();
};

const getInningHalf = (inning: string): string => {
	return inning.charAt(0);
};

const getInningNum = (inning: string): number => {
	return parseInt(inning.slice(1));
};

const advanceBatterAndBaserunners = (bases: string, num: number, isWalk?: boolean): IBaserunningResult => {
	// on a walk, baserunners only advance if forced
	if (isWalk) bases = bases.replace("0", "");
	return roundTheBases(bases, num);
};

const advanceBaserunnersOnly = (bases: string, num: number): IBaserunningResult => {
	return roundTheBases(bases, num, true);
};

// advance batter and/or baserunners the specified number of times
// return the updated bases value and the number of runs batted in
const roundTheBases = (bases: string, num: number, baserunnersOnly?: boolean): IBaserunningResult => {
	let toPrepend: string = baserunnersOnly ? "0" : "1";
	for (let i = 0; i < num - 1; i++) {
		toPrepend = "0" + toPrepend;
	}

	bases = toPrepend + bases;

	let rbi = 0;
	const rbiString = bases.slice(3);
	for (let i = 0; i < rbiString.length; i++) {
		if (rbiString[i] === "1") rbi++;
	}

	bases = bases.substring(0, 3);

	return { bases, rbi };
};

const atLeastOneBaserunnerIsOn = (bases: string): boolean => {
	return bases.indexOf("1") >= 0;
};

const acceptChallengeAndStartGame = async (msg: Message, game: Baseball, awayTeam: User, homeTeam: User): Promise<void> => {
	game.inning = "T1";
	awayTeam.inBaseballGame = true;
	homeTeam.inBaseballGame = true;

	const updatedGame = await BaseballRepo.UpdateOne(game);
	const updatedUsers = await UserRepo.UpdateOne(awayTeam) &&
						await UserRepo.UpdateOne(homeTeam);

	if (updatedGame && updatedUsers) {
		const body = `<@${homeTeam.userId}> accepted a baseball game challenge from <@${awayTeam.userId}>. Play ball!\n\n` + 
		getGamestate(updatedGame);
		return replyWithSuccessEmbed(msg, "Baseball", body);
	}
	
};

const showGamestate = (msg: Message, game: Baseball): void => {
	replyWithSuccessEmbed(msg, "Baseball", getGamestate(game));
};

const getGamestate = (game: Baseball): string => {
	return `<@${game.awayTeam.userId}>: ${game.awayTeamRuns} | <@${game.homeTeam.userId}>: ${game.homeTeamRuns}\n\n` + 
	(!game.gameOver ? (getInningAndOutsDisplayText(game.inning, game.outs) + " | " +
		getBaserunnersDisplayText(game.bases) + "\n\n" + 
		getUserActionPromptDisplayText(game)) : "");
};

const getInningAndOutsDisplayText = (inning: string, outs: number): string => {
	const inningHalf: string = (getInningHalf(inning) === "T" ? "Top" : "Bottom") + " of the ";
	const inningNum: string = getInningNum(inning).toString();
	let inningNumSuffix: string;
	
	if (inningNum.endsWith("1") && !inningNum.endsWith("11")) {
		inningNumSuffix = "st";
	} else if (inningNum.endsWith("2") && !inningNum.endsWith("12")) {
		inningNumSuffix = "nd";
	} else if (inningNum.endsWith("3") && !inningNum.endsWith("13")) {
		inningNumSuffix = "rd";
	} else {
		inningNumSuffix = "th";
	}

	let outsText: string = ` | ${outs} Out${outs === 1 ? "" : "s"}`;

	return inningHalf + inningNum + inningNumSuffix + outsText;
};

const getRunsScoredDisplayText = (runsScored: number): string => {
	if (runsScored === 0) return "";
	return `\n\n${runsScored} run${runsScored > 1 ? "s" : ""} score${runsScored == 1 ? "s" : ""} on the play.`;
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
	default: throw `'${bases}': Invalid bases value!`;
	}
};

const getUserActionPromptDisplayText = (game: Baseball): string => {
	const teamAtBatUserId: string = game.inning.charAt(0) === "T" ? game.awayTeam.userId : game.homeTeam.userId;
	return `<@${teamAtBatUserId}> is up to bat. Here comes the pitch! Run ` + "```!swing``` to take a swing!";
};

// the game is over if either of the following is true:
// - it is the bottom half of the last inning (9th is standard) or later, and either the away team is winning with 3 outs recorded or the home team is winning regardless of the number of outs.
// - it is the top half of the last inning (9th is standard), and the home team is winning with 3 outs recorded (no need to play the bottom half of the last inning).
const isGameOver = (game: Baseball): boolean => {
	const inningHalf = getInningHalf(game.inning);
	const inningNum = getInningNum(game.inning);

	return (inningHalf === "B" && inningNum >= innings && ((game.awayTeamRuns > game.homeTeamRuns && game.outs === 3) || game.homeTeamRuns > game.awayTeamRuns)) || 
		(inningHalf === "T" && inningNum === innings && game.awayTeamRuns < game.homeTeamRuns && game.outs === 3);
};

const findGuildMemberByUsername = (msg: Message, username: string): GuildMember => {
	const found = msg.guild.members.cache.find(member => member.user.username.toUpperCase().trim() === username.toUpperCase().trim());
	if (found) return found;
	else throw `${username}: User not found!`;
};