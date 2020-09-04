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

const listOfDrinks = {
    drinks: [
        {
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
        },
        {
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
        },
        {
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
    ]
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
	.setTitle('Drink Name: ' + result.drink)
	.setDescription(result.instructions)
    .setImage(result.image)
    for(var i = 0; i < result.ingredients.length; i++){
        exampleEmbed.addField(result.ingredients[i], result.measures[i], true)
    }
    return exampleEmbed;
}

const getDrinksByIngredients = function(ingredients){
    // fetch('ourapilink/ingredients/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
    const resultDrinks = listOfDrinks;
    var messageReply = "Here's the list of drinks with the provided ingredient(s)!\n"
    for(var i = 0; i < resultDrinks.drinks.length; i++){
        messageReply += resultDrinks.drinks[i].drink + '\n';
    }
    messageReply += '\nRequest ingredients and instructions by typing !kyle followed by the desired drink name!';
    return messageReply;
}

const getDrinksByCategory = function(category){
    // fetch('ourapilink/category/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
    const resultDrinks = listOfDrinks;
    var messageReply = "Here's the list of drinks with the provided category!\n"
    for(var i = 0; i < resultDrinks.drinks.length; i++){
        messageReply += resultDrinks.drinks[i].drink + '\n';
    }
    messageReply += '\nRequest ingredients and instructions by typing !kyle followed by the desired drink name!';
    return messageReply;
}


module.exports = { kyleNoWorking, getKyleCommand };
