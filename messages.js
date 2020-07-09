const equalsAndResponse = function(msg, equalWord, botResponse){
    if((msg.content === equalWord) && !msg.author.bot){
        msg.reply(botResponse);
    }
}

module.exports = {equalsAndResponse};