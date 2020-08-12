
const kylesId = '637446755897835556';
const workStuffChannel = '689463821869383690';
const billyMad = '694721037006405742';

const kyleNoWorking = function(msg){
    if(msg.author.id == kylesId && msg.channel == workStuffChannel){
        msg.react(msg.guild.emojis.cache.get(billyMad))
            .then(console.log)
            .catch(console.error);
    }
}


module.exports = { kyleNoWorking };
