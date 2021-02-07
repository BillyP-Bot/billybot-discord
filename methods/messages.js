const includesAndResponse = function (msg, prompts) {
	let m = msg.content.toUpperCase().trim();
	prompts.forEach(val => {
		let p = val[0].toUpperCase().trim();
		if ((m.includes(p)) && !msg.author.bot) {
			msg.reply(val[1]);
		}
	});
};

module.exports = {
	includesAndResponse
};