/* eslint-disable no-unused-vars */
const Discord = require('discord.js');
const logger = require('./services/logger');
const client = new Discord.Client();
require('dotenv').config();
var CronJob = require('cron').CronJob;

const message = require('./methods/messages');
const boyd = require('./methods/boyd');
const dianne = require('./methods/dianne');
const whatshowardupto = require('./methods/whatshowardupto');
const anthony = require('./methods/anthony');
const kyle = require('./methods/kyle');
const rockandroll = require('./methods/rockandroll');

const { job } = require('cron');
const { post } = require('request');
const { itsTime } = require('./methods/rockandroll');

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
	logger.info('Kanye flag cleared');
});

//clearKanyeFlagCronJob.start();

var postKanyeCronJob = new CronJob('0 0 16 * * 5', function () {
	if (kanyePosted === 0) {
		anthony.goodFridayBot(client, YOUTUBE_API_KEY);
	} else {
		logger.info('Kanye was already posted');
	}
});

//postKanyeCronJob.start();

var itsTimeToRockandRoll = new CronJob('0 0 8 * * 1-5', function (){
	rockandroll.itsTime(client);},
	null, null, 'America/New_York');



client.on('ready', () => {
	logger.info(`Logged in as ${client.user.tag}!`);
	client.user.setActivity('Farmville');
	itsTimeToRockandRoll.start();
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
	logger.error('Unhanded promise rejection: ', error);
});

module.exports = {
	client
};
client.login(BOT_TOKEN).catch(e => {
	logger.error(e);
});

client.boydTownRoad = null;