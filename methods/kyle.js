const Discord = require('discord.js');

const kylesId = '637446755897835556';
const workStuffChannel = '689463821869383690';
const billyMad = '694721037006405742';

const drinkPrefix = '!kyle';
const ingredientPrefix = '!ingredients';
const categoryPrefix = '!category';

const exampleDrink = {
    drink: '1-900-FUK-MEUP',
    drinkId: '420',
    alcoholic: 'Alchoholic',
    category: 'Shot',
    glass: 'Old-fashioned glass',
    IBA: null,
    ingredients: ['Absolut Kurant', 'Grand Marnier', 'Chambord raspberry liqueur', 'Midori melon liqueur', 'Malibu rum', 'Amaretto', 'Cranberry juice', 'Pineapple juice'],
    measures: ['1/2 oz', '1/4 oz', '1/4 oz', '1/4 oz', '1/4 oz', '1/4 oz', '1/2 oz', '1/4 oz'],
    instructions: 'Shake ingredients in a mixing tin filled with ice cubes. Strain into a rocks glass.',
    image: 'http://www.thecocktaildb.com/images/media/drink/uxywyw1468877224.jpg'
}

const kyleNoWorking = function(msg){
    if(msg.author.id == kylesId && msg.channel == workStuffChannel){
        msg.react(msg.guild.emojis.cache.get(billyMad))
            .then(console.log)
            .catch(console.error);
    }
}

const getKyleCommand = function(msg){
    if (msg.content.startsWith(drinkPrefix) && !msg.author.bot){
        const args = msg.content.slice(drinkPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        msg.reply(getDrinkByName(command));
    }
    else if(msg.content.startsWith(ingredientPrefix) && !msg.author.bot){
        const args = msg.content.slice(ingredientPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        msg.reply(getDrinksByIngredients(command));
    }
    else if(msg.content.startsWith(categoryPrefix) && !msg.author.bot){
        const args = msg.content.slice(categoryPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        msg.reply(getDrinksByCategory(command));
    }
}

const getDrinkByName = function(drink){
    // fetch('ourapilink/drink/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
    const result = exampleDrink;
    const exampleEmbed = new Discord.MessageEmbed()
	.setColor('#0099ff')
	.setTitle(result.drink)
	.setURL('https://discord.js.org/')
	.setAuthor('Kyle', 'https://i.imgur.com/wSTFkRM.png', 'https://discord.js.org')
	.setDescription(result.instructions)
	.setThumbnail('https://i.imgur.com/wSTFkRM.png')
	.addFields(
		{ name: 'Alchoholic', value: 'Some value here' },
		{ name: '\u200B', value: '\u200B' },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
		{ name: 'Inline field title', value: 'Some value here', inline: true },
	)
	.addField('Inline field title', 'Some value here', true)
	.setImage(result.image)
	.setTimestamp()
    .setFooter('Some footer text here', 'https://i.imgur.com/wSTFkRM.png');
    return exampleEmbed;
}

const getDrinksByIngredients = function(ingredients){
    // fetch('ourapilink/ingredients/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
}

const getDrinksByCategory = function(category){
    // fetch('ourapilink/category/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
}


module.exports = { kyleNoWorking, getKyleCommand };
