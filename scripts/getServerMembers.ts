import fs from "fs";

import { client } from "../src";

async function main(guild: string) {
	const { members } = await client.guilds.fetch(guild);
	await members.fetch({ force: true });
	for (const [id, { user }] of members.cache.entries()) {
		console.log(id);
		if(user.bot) continue;
		const { id: user_id, username, avatar, discriminator } = user;
		fs.appendFileSync("users.txt", `${JSON.stringify({ server_id: members.guild.id, user_id, username, avatar, discriminator  })},\n`);
	}
}

main("");
