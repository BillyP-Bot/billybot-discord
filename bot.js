const Discord = require('discord.js');
const client = new Discord.Client();

const message = require('./messages');
const boyd = require('./boyd');
const dianne = require('./dianne');
const whatshowardupto = require('./whatshowardupto');

// Environment variables:
const botToken = process.env.BOT_TOKEN;

var channels = {};
var triggersAndResponses = [['vendor', 'Don\'t blame the vendor!'], ['linear', 'We have to work exponentially, not linearly!']];
var commandsAndResponses = [['!Dianne', 'Posts just one bad meme'], ['!FridayFunnies', 'Posts a bunch of boomer memes'], ['!whereshowwie?', 'Gets Employment Status of Howard']];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    channels = populateChannels(client, channels);
});

client.on('message', msg => {
    message.includesAndResponse(msg, triggersAndResponses);
    boyd.townRoad(msg);
    dianne.fridayFunny(msg);
    dianne.fridayFunnies(msg);
    whatshowardupto.howardUpdate(msg);
});

const populateChannels = function(client, channels){
    var serverChannels = client.guilds.channels;
    for(const channel of serverChannels.values()){
        channels[channel.name] = channel.id;
        console.log('Added channel ' + channel.name + ' with ID: ' + channel.id);
    }
    return channels;
}

module.exports = { channels, client };

client.login(botToken);