const axios = require('axios');
const Discord = require('discord.js');

const skiReg = /.*(!skistats).*/gmi;

const all = msg => {
	if (skiReg.test(msg.content) && !msg.author.bot) {
		axios.get('https://skifreejs.herokuapp.com/api/leaderboard/10').then(r => {
			const card = new Discord.MessageEmbed()
				.setColor('#1bb0a2')
				.setTitle('SkiFreeJs LeaderBoard!')
				.setURL('https://skifreejs.herokuapp.com')
				.setAuthor('BillyP Bot')
				.setTimestamp();
			for (let i = 0; i < r.data.data.length; i++) {
				if (i !== 0)
					card.addField(`${r.data.data[i].username}`, `${r.data.data[i].score}`);
				else
					card.addField(`${r.data.data[i].username} 👑`, `${r.data.data[i].score}`);
			}
			return msg.channel.send(card);
		}).catch(e => {
			console.log(e);
		});
	}
};

module.exports = { all: all };