const ytdl = require('ytdl-core-discord');

const townRoad = function(msg){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(msg.member.voiceChannel){
            msg.member.voiceChannel.join()
                .then(connection => {
                    const dispatcher = connection.playFile(ytdl('https://www.youtube.com/watch?v=7ysFgElQtjI&pbjreload=101', {filter:'audioonly'}));
                    dispatcher.on('end', () => {
                        voiceChannel.leave();
                    });
                    dispatcher.on('error', e => {
                        console.log(e);
                    });
                })
                .catch(console.log);
        }
        else{
            msg.reply('You need to join a voice channel first!');
        }
    }
}

module.exports = { townRoad };