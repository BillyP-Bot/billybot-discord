const logger = require('../services/logger');

const itsTime = function(client) {
    channel = client.channels.cache.find(TextChannel => TextChannel.name === 'memes');
    //const attachment = new MessageAttachment('../videos/rockandroll.mp4');
    channel.send(`Good Morning!`, { files: ['./videos/rockandroll.mp4'] })
    .then(message => console.log(`Its time to rock and roll`))
    .catch(console.error);
};

module.exports = {
	itsTime
};