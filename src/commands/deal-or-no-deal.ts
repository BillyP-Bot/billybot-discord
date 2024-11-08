import type { IDealOrNoDeal, IUser } from "btbot-types";
import { DealOrNoDealReacts } from "btbot-types";
import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	MessageReaction
} from "discord.js";

import { CommandNames } from "@enums";
import { Api, Embed, getInteractionOptionValue, mentionCommand } from "@helpers";
import { ISlashCommand } from "@types";

export const dealOrNoDealCommand: ISlashCommand = {
	name: CommandNames.dealornodeal,
	description: "Play a game of Deal or No Deal!",
	options: [
		{
			name: "case",
			description: "The number of the case to select (1 thru 18)",
			type: ApplicationCommandOptionType.Integer,
			required: true,
			min_value: 1,
			max_value: 18
		}
	],
	handler: async (int: ChatInputCommandInteraction) => {
		await int.deferReply();
		const case_num = getInteractionOptionValue<number>("case", int);

		const game = await Api.post<IDealOrNoDeal>("dealornodeal/open", {
			server_id: int.guild.id,
			user_id: int.user.id,
			case_num
		});

		const msg = buildStatusMessage(game);
		const embed = buildEmbed(game, msg);
		const replyInt = await int.editReply({ embeds: [embed] });

		if (game.to_open === 0) {
			const replyMsg = await replyInt.fetch();
			await Promise.all([
				replyMsg.react(DealOrNoDealReacts.deal),
				replyMsg.react(DealOrNoDealReacts.noDeal)
			]);
		}
	},
	reactHandler: async (react: MessageReaction, sender_id: string) => {
		const is_deal = react.emoji.toString() === DealOrNoDealReacts.deal;
		const game = await Api.put<IDealOrNoDeal>("dealornodeal/respond", {
			server_id: react.message.guild.id,
			user_id: sender_id,
			is_deal
		});
		if (!game || game.user_id !== sender_id) return;
		if (game.is_complete) {
			const { billy_bucks } = await Api.get<IUser>(
				`users?user_id=${game.user_id}&server_id=${game.server_id}`
			);

			const winnings = is_deal ? game.offer : game.cases[game.selected_case - 1].value;
			const embed = Embed.success(
				is_deal
					? `<@${
							game.user_id
						}>\n\n**DEAL!** You accepted the bank's offer of ${winnings} BillyBucks.\n\nYou now have ${billy_bucks} BillyBucks.\n\nYour case contained... \`${
							game.cases[game.selected_case - 1].value
						} BillyBucks\`!`
					: `<@${game.user_id}>\n\n**NO DEAL!** You stubbornly reject BillyP's generous offer of \`${game.offer} BillyBucks\`.\n\nThere are only two unopened cases left, so you automatically win the contents of your own case: \`${winnings} BillyBucks\`!\n\nYou now have ${billy_bucks} BillyBucks.`,
				"Deal or No Deal"
			);
			await react.message.channel.send({ embeds: [embed] });
			return;
		}
		const msg = buildStatusMessage(game, true);
		const embed = buildEmbed(game, msg);
		await react.message.channel.send({ embeds: [embed] });
	}
};

const buildStatusMessage = (game: IDealOrNoDeal, justRejectedOffer?: boolean) => {
	const { cases, selected_case, last_opened_case, to_open, offer } = game;

	const openedAmounts = cases
		.filter((c, i) => c.is_open && selected_case - 1 !== i)
		.map((c) => c.value);
	const openedAmountsSorted = openedAmounts.sort((a, b) => a - b).map((value) => `\`$${value}\``);

	const remainingAmounts = cases.filter((c) => !c.is_open).map((c) => c.value);
	const remainingAmountsSorted = remainingAmounts
		.sort((a, b) => a - b)
		.map((value) => `\`$${value}\``);

	let msg = "";
	if (justRejectedOffer) {
		msg += `<@${game.user_id}>\n\n**NO DEAL!** You stubbornly reject BillyP's generous offer of \`${offer} BillyBucks\`.\n\n`;
	} else {
		const caseValue = last_opened_case > 0 ? cases[last_opened_case - 1].value : undefined;
		msg +=
			openedAmounts.length === 0
				? `Welcome to Deal or No Deal! You selected case **${selected_case}**.\n\n`
				: `You opened case **${last_opened_case}** - it contains \`${caseValue} BillyBuck${
						caseValue === 1 ? "" : "s"
					}\`!\n\n`;
	}

	if (to_open > 0) {
		msg += `Cases to open before next offer: **${to_open} more**\n\n`;
		msg += `Run ${mentionCommand(CommandNames.dealornodeal)} to open a case.\n\n`;
	} else {
		msg += `The Bank of BillyP is pleased to offer you \`${offer} BillyBucks\` for your case. *DEAL* or *NO DEAL*?!?\n\n`;
		msg += `${DealOrNoDealReacts.deal} **DEAL** (accept offer and end the game)\n${DealOrNoDealReacts.noDeal} **NO DEAL** (reject offer and continue opening)\n\n`;
	}

	msg += `Your case: **${selected_case}** 🔒\n\n`;

	if (openedAmountsSorted.length > 0)
		msg += "Opened:\n" + openedAmountsSorted.join(", ") + "\n\n";

	if (remainingAmountsSorted.length > 0)
		msg += "Remaining:\n" + remainingAmountsSorted.join(", ") + "\n\n";
	return msg;
};

const buildEmbed = (game: IDealOrNoDeal, msg: string) => {
	const embed = Embed.success(msg, "Deal or No Deal");
	embed.setFields(
		game.cases.map((c, i) => ({
			name: `${i + 1}`,
			value: game.selected_case - 1 === i ? "🔒" : c.is_open ? `\`$${c.value}\`` : "💼",
			inline: true
		}))
	);
	return embed;
};
