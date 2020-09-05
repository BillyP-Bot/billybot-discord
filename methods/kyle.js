const Discord = require('discord.js');
const fetch = require('node-fetch');

const kylesId = '637446755897835556';
const workStuffChannel = '689463821869383690';
const billyMad = '694721037006405742';

const drinkPrefix = '!drink';
const ingredientPrefix = '!ingredients';
const categoryPrefix = '!category';

const kyleNoWorking = function(msg){
    if(msg.author.id == kylesId && msg.channel == workStuffChannel){
        msg.react(msg.guild.emojis.cache.get(billyMad))
            .then(console.log)
            .catch(console.error);
    }
}

const getKyleCommand = function(msg){
    if (msg.content.startsWith(drinkPrefix) && !msg.author.bot){
        const command = msg.content.replace(drinkPrefix + " ", "").replace(" ", "%20");
        getDrinkByName(command)
            .then(returnedDrink => {
                if(returnedDrink.length > 0){
                    const drink = returnedDrink[0];
                    const drinkEmbed = new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .addField('Glass:', drink.glass)
                    .setTitle('Drink Name: ' + drink.drink)
                    .setDescription(drink.instructions)
                    .setImage(drink.drink_thumb)
                    for(var i = 0; i < drink.ingredients.length; i++){
                        drinkEmbed.addField(drink.ingredients[i] + ':', drink.measurement[i])
                    }
                    msg.reply(drinkEmbed);
                }
                else{
                    msg.reply("Sorry, we don't have instructions for that one!");
                }
            })
    }
    else if(msg.content.startsWith(ingredientPrefix) && !msg.author.bot){
        const command = msg.content.replace(ingredientPrefix + " ", "").replace(" ", "%20");
        getDrinksByIngredients(command)
            .then(returnedDrinks => {
                var messageReply = "Here's the list of drinks with the provided ingredient(s)!\n"
                for(var i = 0; i < returnedDrinks.length; i++){
                    messageReply += returnedDrinks[i].drink + '\n';
                }
                messageReply += '\nRequest ingredients and instructions by typing !kyle followed by the desired drink name!';
                msg.reply(messageReply)
            })

    }
    else if(msg.content.startsWith(categoryPrefix) && !msg.author.bot){
        const args = msg.content.slice(categoryPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        msg.reply(getDrinksByCategory(command));
    }
}

const getDrinkByName = async function(drink){
    const returnedDrink = fetch('https://cocktails-heroku.herokuapp.com/cocktails/drink/?drink=' + drink)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    return returnedDrink;
}

const getDrinksByIngredients = function(ingredients){
    const returnedDrinks = fetch('https://cocktails-heroku.herokuapp.com/cocktails/ingredient/?ingredient=' + ingredients)
        .then(response => response.json())
        .then(data => {
            return data;
        })

    return returnedDrinks;

    
}

const getDrinksByCategory = function(category){
    fetch('ourapilink/category/name')
        .then(response => response.json())
        .then(data =>  {
            return data;
        });
    const resultDrinks = listOfDrinks;
    var messageReply = "Here's the list of drinks with the provided category!\n"
    for(var i = 0; i < resultDrinks.drinks.length; i++){
        messageReply += resultDrinks.drinks[i].drink + '\n';
    }
    messageReply += '\nRequest ingredients and instructions by typing !kyle followed by the desired drink name!';
    return messageReply;
}


module.exports = { kyleNoWorking, getKyleCommand };
