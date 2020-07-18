const Discord = require('discord.js');
const client = new Discord.Client();
require('dotenv').config();

const message = require('./methods/messages');
const boyd = require('./methods/boyd');
const dianne = require('./methods/dianne');
const whatshowardupto = require('./methods/whatshowardupto');
const anthony = require('./methods/anthony');
const server = require('./methods/discordServer');

// Environment variables:
const botToken = process.env.BOT_TOKEN;
const googleAPIKey = process.env.GOOGLE_API_KEY;
const googleCXKey = process.env.GOOGLE_CX_KEY;

// TODO: Programatically grab all channel names + ID's and store in channels dictionary (use populateChannels func below).
const channels = server.populateChannels(client);

var triggersAndResponses = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];
var commandsAndResponses = [['!Dianne', 'Posts just one bad meme'], ['!FridayFunnies', 'Posts a bunch of boomer memes'], ['!whereshowwie?', 'Gets Employment Status of Howard']];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    //channels = populateChannels(client, channels);
});


client.on('message', msg => {
    message.includesAndResponse(msg, triggersAndResponses);
    boyd.townRoad(msg);
    dianne.fridayFunny(msg);
    dianne.fridayFunnies(msg);
    whatshowardupto.howardUpdate(msg, googleAPIKey, googleCXKey);
    if(msg.content == '!goodFriday'){
        anthony.goodFriday(msg);
    }
});

client.on('unhandledRejection', error => {
    console.error("Unhanded promise rejection: ", error);
});

module.exports = { channels, client };

client.login(botToken);


