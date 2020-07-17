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
        var fridayFunnies = []
        fetch('https://www.reddit.com/r/boomershumor/top.json?sort=top&t=week&limit=10&over_18=false')
            .then(response => response.json())
            .then(data =>  {
                data.data.children.forEach(redditPost => {
                    fridayFunnies.push(redditPost.data.url);
                })

                msg.reply("Here's your Friday Funnies!\n\n", {files: fridayFunnies});
            });
    }
}

module.exports = { fridayFunny, redditAPIFridayFunny };