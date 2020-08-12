
const kylesId = '187360505994674176';
const workStuffChannel = '738194989917536317';
const billyMad = '694721037006405742';

const kyleNoWorking = function(msg){
    if(msg.author.id == kylesId && msg.channel == workStuffChannel){
        msg.react(msg.guild.emojis.cache.get(billyMad))
            .then(console.log)
            .catch(console.error);
    }
}


module.exports = { kyleNoWorking };
