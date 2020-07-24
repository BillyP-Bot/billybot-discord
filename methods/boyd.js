const { Message } = require("discord.js");

const ytdl = require('ytdl-core');
// var { client } = require("../bot");


const townRoad = async function(msg, client){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(msg.member.voice.channel){
            const channel = msg.member.voice.channel;
            const connection = await channel.join();
            const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=GngH-vNbDgI', {filter:'audioonly'}));
            dispatcher.setVolume(0.5);

            dispatcher.on('finish', () => {
                msg.channel.send('That\'s it! Hope you enjoyed!');
                connection.disconnect();
            })

        }
        else{
            msg.reply('You need to join a voice channel first!');
        }
    }
}

// TODO: Finish !stop command
const exitStream = function(msg, client){
    if(msg.content == '!stop'){
        if(client.voice.connections){
            console.log(client.voice.connections.channel);
        }
        else{
            msg.channel.send('I\'m not in a voice channel!');
        }
    }
}

module.exports = { townRoad, exitStream };