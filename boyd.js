const ytdl = require('ytdl-core');

const townRoad = function(msg){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(msg.member.voiceChannel){
            const connection = msg.member.voiceChannel.join();
            const dispatcher = connection.play(ytdl('https://www.youtube.com/watch?v=7ysFgElQtjI&pbjreload=101', {filter:'audioonly'}));

            dispatcher.on('finish', () => {
                msg.reply("Hope you enjoyed!");
            });
            
        }
        else{
            msg.reply('You need to join a voice channel first!');
        }
    }
}

module.exports = { townRoad };