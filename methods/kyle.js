const Discord = require('discord.js');
const fetch = require('node-fetch');
const getColors = require('get-image-colors')

const kylesId = '637446755897835556';
const workStuffChannel = '689463821869383690';
const billyMad = '694721037006405742';
const discordMsgLmt = 1200;

const drinkPrefix = '!drink ';
const drinkSearchPrefix = '!searchDrinks ';
const ingredientPrefix = '!ingredients ';
const categoryPrefix = '!category ';

const kyleNoWorking = function(msg){
    if(msg.author.id == kylesId && msg.channel == workStuffChannel){
        msg.react(msg.guild.emojis.cache.get(billyMad))
            .then(console.log)
            .catch(console.error);
    }
}

const getKyleCommand = function(msg){
    if(msg.content.startsWith(drinkSearchPrefix) && !msg.author.bot){
        const command = msg.content.replace(drinkSearchPrefix, "").replace(" ", "%20");
        const drinkName = command.replace('%20', " ");
        getDrinksByPartialName(command)
            .then(returnedDrinks => {
                var addedDrinks = 0;
                var messageReply = "Here's the list of drinks with " + drinkName + " in the name!\n"
                for(var i = 0; (i < returnedDrinks.length) && (messageReply.length < discordMsgLmt); i++){
                    messageReply += returnedDrinks[i].drink + '\n';
                    addedDrinks += 1;
                }
                if(returnedDrinks.length > addedDrinks){
                    messageReply += '\n... Too many to list them all! Discord limits my message size :( \n';
                }
                messageReply += '\nRequest ingredients and instructions by typing ' + drinkPrefix + ' followed by the desired drink name!';
                msg.reply(messageReply)
            })
    }
    else if(msg.content.startsWith(drinkPrefix) && !msg.author.bot && !msg.content.startsWith(drinkSearchPrefix)){
        const command = msg.content.replace(drinkPrefix, "").replace(" ", "%20");
        getDrinkByName(command)
            .then(returnedDrink => {
                if(returnedDrink.length > 0){
                    const drink = returnedDrink[0];
                    getPrimaryColor(drink.drink_thumb)
                        .then(color => {
                            const drinkEmbed = new Discord.MessageEmbed()
                            .setColor(color)
                            .addField('Glass:', drink.glass)
                            .setTitle('Drink Name: ' + drink.drink)
                            .setDescription(drink.instructions)
                            .setImage(drink.drink_thumb)
                            for(var i = 0; i < drink.ingredients.length; i++){
                                drinkEmbed.addField(drink.ingredients[i] + ':', (drink.measurement[i] === '' || drink.measurement[i] === undefined ? 'Not specified' : drink.measurement[i]))
                            }
                            msg.reply(drinkEmbed);
                        })
                }
                else{
                    msg.reply("Sorry, we don't have instructions for that one!");
                }
            })
    }
    else if(msg.content.startsWith(ingredientPrefix) && !msg.author.bot){
        const command = msg.content.replace(ingredientPrefix, "").replace(" ", "%20");
        getDrinksByIngredients(command)
            .then(returnedDrinks => {
                if(returnedDrinks.length > 0){
                    var addedDrinks = 0;
                    var messageReply = "Here's the list of drinks with the provided ingredient(s)!\n"
                    for(var i = 0; (i < returnedDrinks.length) && (messageReply.length < discordMsgLmt); i++){
                        messageReply += returnedDrinks[i].drink + '\n';
                        addedDrinks += 1;
                    }
                    if(returnedDrinks.length > addedDrinks){
                        messageReply += '\n... Too many to list them all! Discord limits my message size :( \n';
                    }
                    messageReply += '\nRequest ingredients and instructions by typing ' + drinkPrefix + ' followed by the desired drink name!';
                    msg.reply(messageReply)
                }
                else{
                    msg.reply("I don't have any drinks with that ingredient :(");
                }
            })
    }
    else if(msg.content.startsWith(categoryPrefix) && !msg.author.bot){
        const args = msg.content.slice(categoryPrefix.length).trim().split(' ');
        const command = args.shift().toLowerCase();
        msg.reply(getDrinksByCategory(command));
    }
}

const getDrinksByPartialName = async function(drink){
    const returnedDrinks = fetch('https://cocktails-heroku.herokuapp.com/cocktails/drink-search/?drink=' + drink)
        .then(response => response.json())
        .then(data => {
            return data;
        })
    
    return returnedDrinks;
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
    // fetch('ourapilink/category/name')
    //     .then(response => response.json())
    //     .then(data =>  {
    //         return data;
    //     });
    // const resultDrinks = listOfDrinks;
    // var messageReply = "Here's the list of drinks with the provided category!\n"
    // for(var i = 0; i < resultDrinks.drinks.length; i++){
    //     messageReply += resultDrinks.drinks[i].drink + '\n';
    // }
    // messageReply += '\nRequest ingredients and instructions by typing !kyle followed by the desired drink name!';
    // return messageReply;
    return "Feature is not yet implemented.";
}

const getPrimaryColor = async function(image){
    const primaryColor = await getColors(image)
        .then(colors => {
            return colors[0].name();
        })
    return primaryColor;
}

module.exports = { kyleNoWorking, getKyleCommand };
