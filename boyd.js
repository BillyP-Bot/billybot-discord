const townRoad = function(msg){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(msg.member.voiceChannel){
            const connection = msg.member.voiceChannel.join();
        }
        else{
            msg.reply('You need to join a voice channel first!');
        }
    }
}

module.exports = { townRoad };