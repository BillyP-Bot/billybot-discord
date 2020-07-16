const townRoad = function(msg){
    if(msg.content == '!boydTownRoad' && !msg.author.bot){
        if(msg.member.voice.channel){
            const connection = msg.member.voice.channel.join();
        }
        else{
            msg.reply('You need to join a voice channel first!');
        }
    }
}

module.exports = { townRoad };