const Discord = require('discord.js');
const client = new Discord.Client();

const message = require('./messages');
const boyd = require('./boyd');
const dianne = require('./dianne');

// Environment variables:
const botToken = process.env.BOT_TOKEN;

prompts = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    message.includesAndResponse(msg, prompts);
    boyd.townRoad(msg);
    dianne.fridayFunny(msg);
});


client.login(botToken);