const dianne = require('./dianne');
const bot = require('../bot');
const fetch = require('node-fetch');

var kanyeVideoIDs = [];

const goodFriday = function(msg, googleAPIKey){
    if(msg.content == '!tobyFriday' && !msg.author.bot){
        fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=80&playlistId=PLdYwhvDpx0FLEfzLe3BVZip4V4kAF1g1H&key=' + googleAPIKey)
            .then(response => response.json())
            .then(data => {
                var randomInt = dianne.getRandomIntInclusive(0, data.items.length);
                var yeezus = data.items[randomInt].snippet.resourceId.videoId;
                
                msg.channel.send('G.O.O.D. FRIDAYS, I HOPE YOU HAVE A NICE WEEKEND! \n\nhttps://www.youtube.com/watch?v=' + yeezus);
            });
    }
}

const goodFridayBot = function(client, googleAPIKey){
    var generalChannel = '733810168302796850';
    fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=80&playlistId=PLdYwhvDpx0FLEfzLe3BVZip4V4kAF1g1H&key=' + googleAPIKey)
        .then(response => response.json())
        .then(data => {
            var randomInt = dianne.getRandomIntInclusive(0, data.items.length);
            var yeezus = data.items[randomInt].snippet.resourceId.videoId;
            
            client.channels.cache.get(generalChannel).send('G.O.O.D. FRIDAYS, I HOPE YOU HAVE A NICE WEEKEND! \n\nhttps://www.youtube.com/watch?v=' + yeezus);
        });
}


module.exports = { goodFriday, goodFridayBot };
