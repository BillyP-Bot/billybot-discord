const fetch = require('node-fetch');

const howardUpdate = function (msg, googleAPIKey, googleCXKey) {
	if (msg.content == '!WheresHoward?' || msg.content == '!whereshoward?' || msg.content == '!whereshowwie?' && !msg.author.bot) {
		fetch('https://www.googleapis.com/customsearch/v1?key=' + googleAPIKey + '&cx=' + googleCXKey + '&q=howard+bruck+linkedin&num=1')
			.then(response => response.json())
			.then(data => {
				console.log('Successfully Queried Google');
				msg.reply('I thought I got rid of him! Where is he?\n' + data.items[0].title + '\n' + data.items[0].snippet + '\n' + data.items[0].link);
			});
	}
};

module.exports = {
	howardUpdate
};