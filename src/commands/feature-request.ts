import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle
} from "discord.js";

import { Api, Embed } from "../helpers";
import { config } from "../helpers/config";
import { CommandNames } from "../types/enums";

import type { IFeature } from "btbot-types";

import type { ISlashCommand } from "../types";

export const featuresCommand: ISlashCommand = {
	name: CommandNames.feature,
	description: "Use your BillyBucks to submit a new idea for the BillyP Bot to the developers",
	handler: async (int: ChatInputCommandInteraction) => {
		const modal = new ModalBuilder().setCustomId("featureModal").setTitle("Feature Request");
		const featureTitleInput = new TextInputBuilder()
			.setCustomId("featureTitleInput")
			.setLabel("New Feature Request Title")
			.setStyle(TextInputStyle.Short);
		const featureDetailsInput = new TextInputBuilder()
			.setCustomId("featureDetailsInput")
			.setLabel("New Feature Request Details")
			.setStyle(TextInputStyle.Paragraph);

		const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
			featureTitleInput
		);
		const secondActionRow =
			new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
				featureDetailsInput
			);
		modal.addComponents(firstActionRow, secondActionRow);
		//const embed = await feature(int.guild.id, int.user.id, title, details);
		await int.showModal(modal);
	}
};

export const postFeature = async (int: ModalSubmitInteraction) => {
	await int.deferReply();
	const featureTitle = int.fields.getTextInputValue("featureTitleInput");
	const featureDetails = int.fields.getTextInputValue("featureDetailsInput");
	const result = await Api.post<{ feature: IFeature & { billy_bucks: number } }>("features", {
		server_id: int.guild.id,
		user_id: int.user.id,
		title: featureTitle,
		body: featureDetails
	});
	const embed = Embed.success(
		`\`${result.feature.title}\` has been posted to the [Dashboard](${config.DASHBOARD_URL}/${int.guild.id})!\n\n> *${result.feature.body}*\n\nYou now have ${result.billy_bucks} BillyBucks.`,
		"Feature Posted"
	);
	await int.editReply({ embeds: [embed] });
};
