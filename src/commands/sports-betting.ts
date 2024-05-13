import { ISportsBet, ISportsBetUpcomingGame, SportKey } from "btbot-types";
import { ApplicationCommandOptionType, ChatInputCommandInteraction } from "discord.js";

import { CommandNames, SportEmoji } from "@enums";
import { Api, Embed, formatDateET, mentionCommand } from "@helpers";
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
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const subcommand = int.options.getSubcommand();
		const sport = int.options.getString("sport");
		const sport_key = SportKey[sport as keyof typeof SportKey];
		if (subcommand === CommandNames.sportsbet_games) {
			const embed = await getUpcomingGames(sport, sport_key);
			await int.editReply({ embeds: [embed] });
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
		}
	}
};

const getUpcomingGames = async (sport: string, sport_key: SportKey) => {
	const upcomingGames = await Api.get<ISportsBetUpcomingGame[]>(
		`/sportsbetting/upcoming?sport_key=${sport_key}`
	);
	let output = "";
	upcomingGames.forEach((game) => {
		const awayTeamOdds = game.bookmakers[0].markets[0].outcomes.find(
			(o) => o.name === game.away_team
		).price;
		const homeTeamOdds = game.bookmakers[0].markets[0].outcomes.find(
			(o) => o.name === game.home_team
		).price;
		output += `Away Team: **${game.away_team}** (${awayTeamOdds})\n`;
		output += `Home Team: **${game.home_team}** (${homeTeamOdds})\n`;
		output += `Start Time: **${formatDateET(new Date(game.commence_time))}**\n`;
		output += `Game ID: \`${game.id}\`\n\n`;
	});
	output += `To bet on a game, copy its Game ID from above and run ${mentionCommand(
		CommandNames.sportsbet,
		CommandNames.sportsbet_bet
	)}`;
	return Embed.success(output, `Upcoming ${sport} Games ${SportEmoji[sport]}`);
};

const betOnGame = async (
	server_id: string,
	user_id: string,
	sport_key: SportKey,
	game_id: string,
	bet_on_home_team: boolean,
	amount: number
) => {
	const { team, bet_amount, odds, bucks } = await Api.post<ISportsBet>(`/sportsbetting/bet`, {
		server_id,
		user_id,
		sport_key,
		game_id,
		bet_on_home_team,
		bet_amount: amount
	});
	return Embed.success(
		`You bet ${bet_amount} BillyBucks on the ${team} at ${odds}!\n\nYou now have ${bucks} BillyBucks.`,
		"Bet Placed 💸"
	);
};
