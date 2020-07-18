const Discord = require('discord.js');
const client = new Discord.Client();

const message = require('./messages');
const boyd = require('./boyd');
const dianne = require('./dianne');

// Environment variables:
const botToken = process.env.BOT_TOKEN;

triggersAndResponses = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];
commandsAndResponses = [['!Dianne', 'Posts just one bad meme'], ['!FridayFunnies', 'Posts a bunch of boomer memes'], ['!whereshowwie?', 'Gets Employment Status of Howard']];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    message.includesAndResponse(msg, triggersAndResponses);
    boyd.townRoad(msg);
    dianne.fridayFunny(msg);
    dianne.fridayFunnies(msg);
    whatshowardupto.howardUpdate(msg);
});


client.login(botToken);