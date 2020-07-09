export function equalsAndResponse(msg, equalWord, botResponse){
    if((msg.content === equalWord) && !msg.author.bot){
        msg.reply(botResponse);
    }
}