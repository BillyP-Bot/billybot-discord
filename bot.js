const Discord = require('discord.js');
const client = new Discord.Client();

// Environment variables:
const botToken = process.env.BOT_TOKEN;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    if (msg.content.includes("vendor")){
        msg.reply('Stop blaming the vendor!');
    }
    else if(msg.content.includes("linear")){
        msg.reply('We need to work exponentially, not linearly.');
    }
});

client.login(botToken);