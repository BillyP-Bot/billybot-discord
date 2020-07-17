const fetch = require('node-fetch');

// Meme API: https://github.com/R3l3ntl3ss/Meme_Api
var cachedImages = [];

const fridayFunny = function(msg){
    if(msg.content == '!Dianne' || msg.content == '!dianne'  && !msg.author.bot){
        if(cachedImages.length == 0){
            fetch('https://www.reddit.com/r/terriblefacebookmemes/hot.json?limit=50&over_18=False')
            .then(response => response.json())
            .then(data =>  {
                data.data.children.forEach(redditPost => {
                    if(redditPost.data.selftext == "" && redditPost.data.over_18 == 'false'){
                        cachedImages.push(redditPost.data.url);
                    }
                })
                console.log('Populated cachedImages. Length: ' + cachedImages.length);
                var fridayFunny = [];
                fridayFunny.push(getRandomMeme(cachedImages));
                console.log(fridayFunny[0]);
                msg.reply("I just found this great meme on my Facebook feed!\n\n", {files: fridayFunny[0]});
            });
        }
        else{
            console.log('cachedImages contains content: Length: ' + cachedImages.length);
            var fridayFunny = [];
            fridayFunny.push(getRandomMeme(cachedImages));
            console.log(fridayFunny[0]);
            msg.reply("I just found this great meme on my Facebook feed!\n\n", {files: fridayFunny[0]});
        }
    }
}

const fridayFunnies = function(msg){
    
    if(msg.content == '!FridayFunnies' && !msg.author.bot){
        var fridayFunnies = []
        fetch('https://www.reddit.com/r/boomershumor/top.json?sort=top&t=week&limit=12&over_18=False')
            .then(response => response.json())
            .then(data =>  {
                data.data.children.forEach(redditPost => {
                    console.log(redditPost.data.over_18);
                    fridayFunnies.push(redditPost.data.url);
                })

                msg.reply("Here's your Friday Funnies!\n\n", {files: fridayFunnies});
            });
    }
}

const getRandomIntInclusive = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getRandomMeme = function(memes){
    var randomInt = getRandomIntInclusive(0, memes.length);
    var meme = memes.splice(randomInt, 1);
    return meme;
}

module.exports = { fridayFunny, fridayFunnies };