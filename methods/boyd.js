// eslint-disable-next-line no-unused-vars
const { Message } = require('discord.js');
const logger = require('../services/logger');

const ytdl = require('ytdl-core');

const townRoad = async function (msg, client) {
	if (msg.content == '!boydTownRoad' && !msg.author.bot) {
		if (msg.member.voice.channel) {
			const channel = msg.member.voice.channel;
			const connection = await channel.join();
			client.boydTownRoad = connection.play(ytdl('https://www.youtube.com/watch?v=GngH-vNbDgI', {
				filter: 'audioonly'
			}));
			client.boydTownRoad.setVolume(0.2);

			client.boydTownRoad.on('finish', () => {
				msg.channel.send('That\'s it! Hope you enjoyed!');
				connection.disconnect();
				client.boydTownRoad = null;
			});
		} else {
			msg.reply('You need to join a voice channel first!');
		}
	}
};

const exitStream = function (msg, client) {
	if (msg.content == '!stop') {
		if (client.boydTownRoad != null) {
			logger.info('!stop command executed');
			client.boydTownRoad.end();
		} else {
			msg.channel.send('I\'m not in a voice channel!');
		}
	}
};

module.exports = {
	townRoad,
	exitStream
};