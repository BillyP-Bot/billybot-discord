import { type ISportsBet, type ISportsBetUpcomingGame, type IUser, SportKey } from "btbot-types";
import { type ChatInputCommandInteraction, SlashCommandBuilder, userMention } from "discord.js";

import { Api } from "@/helpers/api";
import { mentionCommand } from "@/helpers/command";
import { Embed } from "@/helpers/embed";
import { PaginatedEmbed } from "@/helpers/pagination";
import { formatDateET, pluralIfNotOne, withPlusSignIfPositive } from "@/helpers/util";
import type { SlashCommand } from "@/types";
import { CommandNames } from "@/types/enums";

enum Subcommands {
  games = "games",
  bet = "bet",
  stats = "stats",
}

type Sport = keyof typeof SportKey;

// typed against SportKey so that a sport added to btbot-types can't be missing an emoji
const SportEmoji: Record<Sport, string> = {
  NBA: "🏀",
  WNBA: "🏀",
  NFL: "🏈",
  NHL: "🏒",
  MLB: "⚾",
};

const sportChoices = (Object.keys(SportKey) as Sport[]).map(sport => ({
  name: `${sport} ${SportEmoji[sport]}`,
  value: sport,
}));

const isSport = (value: string): value is Sport => Object.hasOwn(SportKey, value);

// the choices limit the option to valid sports, but the value still arrives as a plain string
const getSportOption = (interaction: ChatInputCommandInteraction) => {
  const sport = interaction.options.getString("sport", true);
  if (!isSport(sport)) throw new Error("Invalid sport!");
  return sport;
};

export const sportsBetting: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName(CommandNames.sportsbet)
    .setDescription("Bet BillyBucks on upcoming sports games!")
    .addSubcommand(subcommand =>
      subcommand
        .setName(Subcommands.games)
        .setDescription("View the betting odds offered for upcoming sports games")
        .addStringOption(option =>
          option
            .setName("sport")
            .setDescription("The sport league to get upcoming games and odds for")
            .setRequired(true)
            .addChoices(...sportChoices),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(Subcommands.bet)
        .setDescription("Bet on the outcome of a sports game")
        .addStringOption(option =>
          option
            .setName("sport")
            .setDescription("The sport league of the game you want to bet on")
            .setRequired(true)
            .addChoices(...sportChoices),
        )
        .addStringOption(option =>
          option
            .setName("game_id")
            .setDescription("The Game ID of the game you want to bet on")
            .setRequired(true)
            .setMinLength(32)
            .setMaxLength(32),
        )
        .addStringOption(option =>
          option
            .setName("team")
            .setDescription("The team you want to bet on to win the game")
            .setRequired(true)
            .addChoices({ name: "Away Team", value: "away" }, { name: "Home Team", value: "home" }),
        )
        .addIntegerOption(option =>
          option
            .setName("amount")
            .setDescription("The amount of BillyBucks you want to bet")
            .setRequired(true)
            .setMinValue(1),
        ),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName(Subcommands.stats)
        .setDescription("See who the most winning and losing sports bettors are"),
    ),
  async execute(interaction) {
    await interaction.deferReply();
    switch (interaction.options.getSubcommand()) {
      case Subcommands.games: {
        const sport = getSportOption(interaction);
        const pagEmbed = await buildUpcomingGamesEmbed(sport);
        // the interaction was deferred, so this follow up replaces the "thinking..." message
        await pagEmbed.send({ options: { interaction, followUp: true } });
        await interaction.editReply({
          content: `To bet on a game, copy its Game ID and run ${mentionCommand(
            CommandNames.sportsbet,
            Subcommands.bet,
          )}`,
        });
        return;
      }
      case Subcommands.bet: {
        const sport = getSportOption(interaction);
        const gameId = interaction.options.getString("game_id", true);
        const betOnHomeTeam = interaction.options.getString("team", true) === "home";
        const amount = interaction.options.getInteger("amount", true);
        const embed = await betOnGame(
          interaction.guildId,
          interaction.user.id,
          SportKey[sport],
          gameId,
          betOnHomeTeam,
          amount,
        );
        await interaction.editReply({ embeds: [embed] });
        return;
      }
      case Subcommands.stats: {
        const embed = await getStats(interaction.guildId);
        await interaction.editReply({ embeds: [embed] });
        return;
      }
    }
  },
};

// the games are split across pages to stay under discord's embed description length limit
const MAX_PAGE_LENGTH = 4096;

const buildUpcomingGamesEmbed = async (sport: Sport) => {
  const upcomingGames = await Api.get<ISportsBetUpcomingGame[]>(
    `sportsbetting/upcoming?sport_key=${SportKey[sport]}`,
  );
  const pages: string[] = [];
  let page = "";
  for (const game of upcomingGames) {
    const outcomes = game.bookmakers.at(0)?.markets.at(0)?.outcomes;
    const awayTeamOdds = outcomes?.find(o => o.name === game.away_team)?.price;
    const homeTeamOdds = outcomes?.find(o => o.name === game.home_team)?.price;
    // games without odds yet can't be bet on
    if (awayTeamOdds === undefined || homeTeamOdds === undefined) continue;
    let entry = `Away Team: **${game.away_team}** (${withPlusSignIfPositive(awayTeamOdds)})\n`;
    entry += `Home Team: **${game.home_team}** (${withPlusSignIfPositive(homeTeamOdds)})\n`;
    entry += `Start Time: **${formatDateET(new Date(game.commence_time))}**\n`;
    entry += `Game ID: \`${game.id}\`\n\n`;
    if (page && page.length + entry.length > MAX_PAGE_LENGTH) {
      pages.push(page);
      page = "";
    }
    page += entry;
  }
  pages.push(page || "No upcoming games found!");

  return new PaginatedEmbed({
    itemsPerPage: 1,
    paginationType: "description",
    showFirstLastBtns: true,
    useEmoji: true,
  })
    .setDescriptions(pages)
    .setTitles([`Upcoming ${sport} Games ${SportEmoji[sport]}`]);
};

const betOnGame = async (
  serverId: string,
  userId: string,
  sportKey: SportKey,
  gameId: string,
  betOnHomeTeam: boolean,
  amount: number,
) => {
  const { team, bet_amount, odds, bucks } = await Api.post<
    Pick<ISportsBet, "team" | "bet_amount" | "odds"> & { bucks: number }
  >("sportsbetting/bet", {
    server_id: serverId,
    user_id: userId,
    sport_key: sportKey,
    game_id: gameId,
    bet_on_home_team: betOnHomeTeam,
    bet_amount: amount,
  });
  return Embed.success(
    `You bet ${bet_amount} BillyBucks on the ${team} at ${withPlusSignIfPositive(
      odds,
    )}!\n\nYou now have ${bucks} BillyBucks.`,
    "Bet Placed 💸",
  );
};

const getNet = (user: IUser) =>
  user.metrics.gambling.sports_betting.total_amount_won -
  user.metrics.gambling.sports_betting.total_amount_bet;

const formatBettor = (user: IUser, index: number) => {
  const { bets } = user.metrics.gambling.sports_betting;
  return `${index + 1}. ${userMention(user.user_id)}: ${withPlusSignIfPositive(getNet(user))} BillyBucks on ${bets} bet${pluralIfNotOne(bets)}\n`;
};

// the backend responds with the 3 biggest winners followed by the 3 biggest losers
const getStats = async (serverId: string) => {
  const users = await Api.get<IUser[]>(`sportsbetting/stats/${serverId}`);
  const winners = users.slice(0, 3).filter(user => getNet(user) > 0);
  const losers = users.slice(-3).filter(user => getNet(user) < 0);
  let message = "**Chads**\n";
  message += winners.map(formatBettor).join("");
  if (winners.length === 0) message += "None!\n";
  message += "\n**Degens**\n";
  message += losers.map(formatBettor).join("");
  if (losers.length === 0) message += "None!";
  return Embed.success(message, "Sports Betting Stats");
};
