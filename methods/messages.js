const includesAndResponse = function (msg, prompts) {
	let m = msg.content.toUpperCase().trim();
	prompts.forEach(val => {
		let p = val[0].toUpperCase().trim();
		if ((m.includes(p)) && !msg.author.bot) {
			msg.reply(val[1]);
		}
	});
};

const makeRole = (msg, roleName, roleColor) => {
	let role = msg.guild.roles.cache.find(role => role.name === roleName);
	if (role || role != undefined) {
		return msg.channel.send(`> Role ${roleName} Already Exists`);
	}
	msg.guild.roles.create({
		data: {
			name: roleName,
			color: roleColor.toUpperCase(),
		},
		reason: 'This Role Must Exist',
	}).catch(console.error);
	return msg.channel.send(`> Created Role ${roleName}.`);
};

module.exports = {
	includesAndResponse,
	makeRole
};