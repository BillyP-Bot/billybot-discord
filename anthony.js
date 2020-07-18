const dianne = require('./dianne');
const bot = require('./bot')

var kanyeVideoIDs = [];

const goodFriday = function(msg){
    if(kanyeVideoIDs.length == 0){
        // Request youtube API to populate videoIDs list
        msg.channel.send('testing good friday func')
            .catch(console.error);
    }
    else{
        // Post random video from list
        console.log('Kanye videos list length: ' + kanyeVideoIDs.length);
        var randomInt = dianne.getRandomIntInclusive(0, kanyeVideoIDs.length);
        var videoID = kanyeVideoIDs.splice(randomInt, 1);
        console.log('Kanye videos list length: ' + kanyeVideoIDs.length);

        msg.channel.send('testing good friday func')
            .catch(console.error);
            
    }
}

module.exports = { goodFriday };

// kanyewest channel id: UCs6eXM7s8Vl5WcECcRHc2qQ

// kanyeVevo channel ID: UChpJbg7zMbi5jx9Gdjaxa9g

// kanye west videos playlist ID: PLdYwhvDpx0FLEfzLe3BVZip4V4kAF1g1H