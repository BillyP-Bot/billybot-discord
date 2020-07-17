const fridayFunny = function(msg){
    if(msg.content == '!fridayFunny' && !msg.author.bot){
        fetch('https://meme-api.herokuapp.com/gimme/boomershumor')
            .then(response => response.json())
            .then(data =>  {
                msg.reply(data.url);
            });
    }
}

module.exports = { fridayFunny };