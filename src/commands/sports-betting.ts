import { ISportsBet, ISportsBetUpcomingGame, IUser, SportKey } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction, userMention } from "discord.js";

import { CommandNames, SportEmoji } from "@enums";
import { Api, Embed, formatDateET, mentionCommand, PaginatedEmbed, pluralIfNotOne } from "@helpers";
import { ISlashCommand } from "@types";

export const sportsBettingCommand: ISlashCommand = {
	name: CommandNames.sportsbet,
	description: "Bet BillyBucks on upcoming sports games!",
	options: [
		{
			name: CommandNames.sportsbet_games,
			description: "View the betting odds offered for upcoming sports games",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "sport",
					description: "The sport league to get upcoming games and odds for",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: Object.keys(SportKey).map((key) => ({
						name: `${key} ${SportEmoji[key]}`,
						value: key
					}))
				}
			]
		},
		{
			name: CommandNames.sportsbet_bet,
			description: "Bet on the outcome of a sports game",
			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "sport",
					description: "The sport league of the game you want to bet on",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: Object.keys(SportKey).map((key) => ({
						name: `${key} ${SportEmoji[key]}`,
						value: key
					}))
				},
				{
					name: "game_id",
					description: "The Game ID of the game you want to bet on",
					type: ApplicationCommandOptionType.String,
					required: true,
					//@ts-ignore
					min_length: 32,
					max_length: 32
				},
				{
					name: "team",
					description: "The team you want to bet on to win the game",
					type: ApplicationCommandOptionType.String,
					required: true,
					choices: [
						{ name: "Away Team", value: "away" },
						{ name: "Home Team", value: "home" }
					]
				},
				{
					name: "amount",
					description: "The amount of BillyBucks you want to bet",
					type: ApplicationCommandOptionType.Integer,
					required: true,
					// @ts-ignore
					min_value: 1
				}
			]
		},
		{
			name: CommandNames.sportsbet_stats,
			description: "See who the most winning and losing sports bettors are",
			type: ApplicationCommandOptionType.Subcommand
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const subcommand = int.options.getSubcommand();
		const sport = int.options.getString("sport");
		const sport_key = SportKey[sport as keyof typeof SportKey];
		if (subcommand === CommandNames.sportsbet_games) {
			const pagEmbed = await getUpcomingGames(sport, sport_key);
			// @ts-ignore
			await pagEmbed.send({ options: { interaction: int, followUp: true } });
			const reply = await int.fetchReply();
			const newContent = `To bet on a game, copy its Game ID and run ${mentionCommand(
				CommandNames.sportsbet,
				CommandNames.sportsbet_bet
			)}${reply.content}`;
			await int.editReply({ content: newContent });
		} else if (subcommand === CommandNames.sportsbet_bet) {
			const game_id = int.options.getString("game_id");
			const bet_on_home_team = int.options.getString("team") === "home";
			const amount = int.options.getInteger("amount");
			const embed = await betOnGame(
				int.guildId,
				int.user.id,
				sport_key,
				game_id,
				bet_on_home_team,
				amount
			);
			await int.editReply({ embeds: [embed] });
		} else if (subcommand === CommandNames.sportsbet_stats) {
			const embed = await getStats(int.guildId);
			await int.editReply({ embeds: [embed] });
		}
	}
};

const getUpcomingGames = async (sport: string, sport_key: SportKey) => {
	const maxLengthPerEmbed = 4096;
	const breakMarker = "*break*";
	const upcomingGames = await Api.get<ISportsBetUpcomingGame[]>(
		`sportsbetting/upcoming?sport_key=${sport_key}`
	);
	let output = "";
	let currentEmbedLength = 0;
	upcomingGames.forEach((game) => {
		const awayTeamOdds = game.bookmakers[0].markets[0].outcomes.find(
			(o) => o.name === game.away_team
		).price;
		const homeTeamOdds = game.bookmakers[0].markets[0].outcomes.find(
			(o) => o.name === game.home_team
		).price;
		let newOutput = `Away Team: **${game.away_team}** (${showPlusSignIfPositive(awayTeamOdds)})\n`;
		newOutput += `Home Team: **${game.home_team}** (${showPlusSignIfPositive(homeTeamOdds)})\n`;
		newOutput += `Start Time: **${formatDateET(new Date(game.commence_time))}**\n`;
		newOutput += `Game ID: \`${game.id}\`\n\n`;
		if (currentEmbedLength + newOutput.length > maxLengthPerEmbed) {
			output += breakMarker;
			currentEmbedLength = 0;
		}
		output += newOutput;
		currentEmbedLength += newOutput.length;
	});

	if (upcomingGames.length === 0) {
		output += "No upcoming games found!";
	}

	const splitOutput = output.split(breakMarker);
	const pagEmbed = new PaginatedEmbed({
		itemsPerPage: 1,
		paginationType: "description",
		showFirstLastBtns: true,
		useEmoji: true
	})
		.setDescriptions(splitOutput)
		.setTitles(
			splitOutput.map((_o, i) => {
				return i === 0 ? `Upcoming ${sport} Games ${SportEmoji[sport]}` : undefined;
			})
		);
	return pagEmbed;
};

const betOnGame = async (
	server_id: string,
	user_id: string,
	sport_key: SportKey,
	game_id: string,
	bet_on_home_team: boolean,
	amount: number
) => {
	const { team, bet_amount, odds, bucks } = await Api.post<ISportsBet>(`sportsbetting/bet`, {
		server_id,
		user_id,
		sport_key,
		game_id,
		bet_on_home_team,
		bet_amount: amount
	});
	return Embed.success(
		`You bet ${bet_amount} BillyBucks on the ${team} at ${showPlusSignIfPositive(
			odds
		)}!\n\nYou now have ${bucks} BillyBucks.`,
		"Bet Placed 💸"
	);
};

const getStats = async (server_id: string) => {
	const users = await Api.get<IUser[]>(`sportsbetting/stats/${server_id}`);
	const winners = users
		.slice(0, 3)
		.filter(
			(user) =>
				user.metrics.gambling.sports_betting.total_amount_won -
					user.metrics.gambling.sports_betting.total_amount_bet >
				0
		);
	const losers = users
		.slice(-3)
		.filter(
			(user) =>
				user.metrics.gambling.sports_betting.total_amount_bet -
					user.metrics.gambling.sports_betting.total_amount_won >
				0
		);
	let message = "**Chads**\n";
	winners.forEach((user, index) => {
		const net =
			user.metrics.gambling.sports_betting.total_amount_won -
			user.metrics.gambling.sports_betting.total_amount_bet;
		const bets = user.metrics.gambling.sports_betting.bets;
		message += `${index + 1}. ${userMention(user.user_id)}: ${showPlusSignIfPositive(net)} BillyBucks on ${bets} bet${pluralIfNotOne(bets)}\n`;
	});
	if (winners.length === 0) message += "None!\n";
	message += "\n**Degens**\n";
	losers.forEach((user, index) => {
		const net =
			user.metrics.gambling.sports_betting.total_amount_won -
			user.metrics.gambling.sports_betting.total_amount_bet;
		const bets = user.metrics.gambling.sports_betting.bets;
		message += `${index + 1}. ${userMention(user.user_id)}: ${showPlusSignIfPositive(net)} BillyBucks on ${bets} bet${pluralIfNotOne(bets)}\n`;
	});
	if (losers.length === 0) message += "None!";
	return Embed.success(message, "Sports Betting Stats");
};

const showPlusSignIfPositive = (num: number) => (num > 0 ? `+${num}` : `${num}`);
