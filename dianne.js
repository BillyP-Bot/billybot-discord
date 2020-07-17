const fetch = require('node-fetch');

// Meme API: https://github.com/R3l3ntl3ss/Meme_Api

const fridayFunny = function(msg){
    if(msg.content == '!fridayFunny' || msg.content == '!Dianne' || msg.content == '!dianne'  && !msg.author.bot){
        fetch('https://meme-api.herokuapp.com/gimme/boomershumor')
            .then(response => response.json())
            .then(data =>  {
                msg.reply(data.url);
            });
    }
}

module.exports = { fridayFunny };