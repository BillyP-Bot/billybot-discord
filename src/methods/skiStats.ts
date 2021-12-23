// import { Message, MessageEmbed } from "discord.js";
// import axios from "axios";

// export const all = (msg: Message): void => {
// 	axios.get("https://skifreejs.herokuapp.com/api/leaderboard/10").then(r => {
// 		const card: MessageEmbed = new MessageEmbed()
// 			.setColor("#1bb0a2")
// 			.setTitle("SkiFreeJs LeaderBoard!")
// 			.setURL("https://skifreejs.herokuapp.com")
// 			.setAuthor("BillyP Bot")
// 			.setTimestamp();
// 		for (let i = 0; i < r.data.data.length; i++) {
// 			if (i !== 0)
// 				card.addField(`${r.data.data[i].username}`, `${r.data.data[i].score}`);
// 			else
// 				card.addField(`${r.data.data[i].username} 👑`, `${r.data.data[i].score}`);
// 		}
// 		msg.channel.send(card);
// 	}).catch((e: Error) => {
// 		console.log(e);
// 	});
// };
