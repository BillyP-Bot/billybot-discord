import { Message, MessageEmbed } from "discord.js";

/**
 *
 * @export
 * @param {Message} msg
 * @param {*} error
 * ---
 * will try to extract an api error, but will default to error message
 */
export function ErrorMessage(msg: Message, error: any) {
	const message = error?.response?.data?.error ?? error;
	console.log(message);
	const embed = new MessageEmbed();
	embed.setColor("RED");
	embed.addFields([
		{ name: "Error:", value: `\`\`\`${message}\`\`\`` || "```An Error Has Occured```" }
	]);
	embed.setTimestamp();
	msg.channel.send({ embeds: [embed] });
}