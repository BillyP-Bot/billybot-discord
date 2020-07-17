const fetch = require('node-fetch');

const fridayFunny = function(msg){
    if(msg.content == '!fridayFunny' || msg.content == '!Dianne' || msg.content == '!dianne'  && !msg.author.bot){
        fetch('https://meme-api.herokuapp.com/gimme/boomershumor')
            .then(response => response.json())
            .then(data =>  {
                if(!data.NSFW){
                    msg.reply(data.url);
                }
                else{
                    this.fridayFunny(msg);
                }
            });
    }
}

module.exports = { fridayFunny };