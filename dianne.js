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

const redditAPIFridayFunny = function(msg){
    
    if(msg.content == '!redditFridayFunny' && !msg.author.bot){
        var fridayFunnies = "Here's your Friday Funnies!\n\n";
        fetch('https://www.reddit.com/r/boomershumor/top.json?sort=top&t=week&limit=7&over_18=false')
            .then(response => response.json())
            .then(data =>  {
                
                data.children.forEach(redditPost => {
                    fridayFunnies.concat('\n', redditPost.data.url);
                })
                
                msg.reply(fridayFunnies);
            });
    }
}

module.exports = { fridayFunny, redditAPIFridayFunny };