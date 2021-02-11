const Discord = require('discord.js');

const adminMsgPrefix = '!adminMsg';

const adminMsg = (msg, client) => {
	if (msg.content.startsWith(adminMsgPrefix) && msg.channel.type === 'dm'){
		const adminText = msg.content.replace(adminMsgPrefix, '').trim();
		const generalChannel = client.channels.cache.find(TextChannel => TextChannel.name === 'general');
		const card = new Discord.MessageEmbed()
			.setColor('#1bb0a2')
			.setTitle('Admin Update')
			.addField(`Update From ${msg.author.username}`, adminText);
		
		return generalChannel.send(card)
			.then(console.log(`Sent Admin message: ${adminText}`))
			.catch(function(e){
				console.error(e);}
			);
	}
};

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
	adminMsg,
	includesAndResponse,
	makeRole
};