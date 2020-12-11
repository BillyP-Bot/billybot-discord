const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();
var CronJob = require('cron').CronJob;

const message = require('./methods/messages');
const boyd = require('./methods/boyd');
const dianne = require('./methods/dianne');
const whatshowardupto = require('./methods/whatshowardupto');
const anthony = require('./methods/anthony');
const kyle = require('./methods/kyle');
const {
	job
} = require('cron');
const {
	post
} = require('request');

// Environment variables:
const {
	BOT_TOKEN,
	GOOGLE_API_KEY,
	GOOGLE_CX_KEY,
	YOUTUBE_API_KEY
} = process.env;

var triggersAndResponses = [
	['!loop', 'no !loop please'],
	['vendor', 'Don\'t blame the vendor!'],
	['Vendor', 'Don\'t blame the vendor!'],
	['linear', 'We have to work exponentially, not linearly!']
];
var commandsAndResponses = [
	['!Dianne', 'Posts just one bad meme'],
	['!FridayFunnies', 'Posts a bunch of boomer memes'],
	['!whereshowwie?', 'Gets Employment Status of Howard']
];
var kanyePosted = 0;

// Cron Jobs scheduled for tobyFriday method
var clearKanyeFlagCronJob = new CronJob('0 0 12 * * 5', function () {
	kanyePosted = 0;
	console.log('Kanye flag cleared');
});

//clearKanyeFlagCronJob.start();

var postKanyeCronJob = new CronJob('0 0 16 * * 5', function () {
	if (kanyePosted === 0) {
		anthony.goodFridayBot(client, YOUTUBE_API_KEY);
	} else {
		console.log('Kanye was already posted');
	}
});

//postKanyeCronJob.start();

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	client.user.setActivity('Farmville');
});


client.on('message', msg => {
	message.includesAndResponse(msg, triggersAndResponses);
	boyd.townRoad(msg, client);
	boyd.exitStream(msg, client);
	dianne.fridayFunny(msg);
	dianne.fridayFunnies(msg);
	whatshowardupto.howardUpdate(msg, GOOGLE_API_KEY, GOOGLE_CX_KEY);
	anthony.goodFriday(msg, YOUTUBE_API_KEY);
	kyle.kyleNoWorking(msg);
	kyle.getKyleCommand(msg);
	if (msg.content.includes('G.O.O.D')) {
		kanyePosted = 1;
	}
});

client.on('unhandledRejection', error => {
	console.error('Unhanded promise rejection: ', error);
});

module.exports = {
	client
};

client.login(BOT_TOKEN);

client.boydTownRoad = null;