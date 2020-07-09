const includesAndResponse = function(msg, equalWord, botResponse){
    if((msg.content.includes(equalWord)) && !msg.author.bot){
        msg.reply(botResponse);
    }
}

module.exports = {includesAndResponse};