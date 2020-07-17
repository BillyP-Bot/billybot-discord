const fetch = require('node-fetch');

// Meme API: https://github.com/R3l3ntl3ss/Meme_Api

const fridayFunny = function(msg){
    if(msg.content == '!Dianne' || msg.content == '!dianne'  && !msg.author.bot){
        var fridayFunny = []
        fetch('https://www.reddit.com/r/boomershumor/hot.json?limit=1&over_18=false')
            .then(response => response.json())
            .then(data =>  {
                data.data.children.forEach(redditPost => {
                    if(redditPost.data.selftext == ""){
                        fridayFunny.push(redditPost.data.url);
                    }
                })

                msg.reply("I just found this great meme on my Facebook feed!\n\n", {files: fridayFunnies});
            });
    }
}

const fridayFunnies = function(msg){
    
    if(msg.content == '!FridayFunnies' && !msg.author.bot){
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

module.exports = { fridayFunny, fridayFunnies };