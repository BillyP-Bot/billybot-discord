const townRoad = function(msg){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(MessageChannel.member.voice.channel){
            const connection = message.member.voice.channel.join();
        }
        else{
            message.reply('You need to join a voice channel first!');
        }
    }
}

module.exports = { townRoad };