const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();
var CronJob = require('cron').CronJob;

const message = require('./methods/messages');
const boyd = require('./methods/boyd');
const dianne = require('./methods/dianne');
const whatshowardupto = require('./methods/whatshowardupto');
const anthony = require('./methods/anthony');
const { job } = require('cron');
const { post } = require('request');

// Environment variables:
const botToken = process.env.BOT_TOKEN;
const googleAPIKey = process.env.GOOGLE_API_KEY;
const googleCXKey = process.env.GOOGLE_CX_KEY;
const youtubeAPIKey = process.env.YOUTUBE_API_KEY;

var triggersAndResponses = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];
var commandsAndResponses = [['!Dianne', 'Posts just one bad meme'], ['!FridayFunnies', 'Posts a bunch of boomer memes'], ['!whereshowwie?', 'Gets Employment Status of Howard']];
var kanyePosted = 0;

// Cron Jobs scheduled for tobyFriday method
var clearKanyeFlagCronJob = new CronJob('0 0 12 * * 5', function() {
    kanyePosted = 0;
    console.log('Kanye flag cleared');
});

clearKanyeFlagCronJob.start();

var postKanyeCronJob = new CronJob('0 0 16 * * 5', function() {
    if(kanyePosted === 0){
        anthony.goodFridayBot(client, youtubeAPIKey);
    }
    else{
        console.log('Kanye was already posted');
    }
});

postKanyeCronJob.start();


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
    whatshowardupto.howardUpdate(msg, googleAPIKey, googleCXKey);
    anthony.goodFriday(msg, youtubeAPIKey);
    if(msg.content.includes('G.O.O.D')){
        kanyePosted = 1;
    }
});

client.on('unhandledRejection', error => {
    console.error("Unhanded promise rejection: ", error);
});

module.exports = { client };

client.login(botToken);

client.boydTownRoad = null;




