const includesAndResponse = function(msg, prompts){
    prompts.forEach(val => {
        if((msg.content.includes(val[0])) && !msg.author.bot){
            msg.reply(val[1]);
        }
    });
}

module.exports = {includesAndResponse};