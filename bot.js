const Discord = require('discord.js');
const client = new Discord.Client();

import { equalsAndResponse } from './messages';

// Environment variables:
const botToken = process.env.BOT_TOKEN;

prompts = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    prompts.foreach(val => {
        equalsAndResponse(msg, val[0], val[1]);
    });
});

client.login(botToken);