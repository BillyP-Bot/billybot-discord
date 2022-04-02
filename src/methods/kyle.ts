import fetch from "node-fetch";
import getColors from "get-image-colors";
import { GuildEmoji, Message, Role, MessageEmbed } from "discord.js";

export class KyleMethods {

	private static readonly discordMsgLmt: number = 1200;
	private static readonly drinkPrefix: string = "!drink ";
	private static readonly drinkSearchPrefix: string = "!searchDrinks ";
	private static readonly ingredientPrefix: string = "!ingredients ";
	private static readonly categoryPrefix: string = "!category ";
	
	static KyleNoWorking(msg: Message): void {
		if (msg.channel.type !== "dm" && msg.member.roles.cache.find((r: Role) => r.name === "FormerPartnerIncorporated") && msg.channel.name === "work-stuff") {
			msg.react(msg.guild.emojis.cache.find((e: GuildEmoji) => e.name === "BillyMad"));
		}
	}
	
	private static GetApi(endpoint: string): Promise<void> {
		return new Promise((resolve, reject) => {
			fetch(`https://cocktails-heroku.herokuapp.com/cocktails/${endpoint}`)
				.then(r => r.json())
				.then(data => {
					return resolve(data);
				}).catch(e => {
					reject(e);
				});
		});
	}
	
	static GetKyleCommand(msg: Message): void {
		/*
		if(msg.content.startsWith(drinkSearchPrefix) && msg.author.id == judeId && dropReg.test(msg.content)) {
			msg.reply(`${scaryResponse}\n'db.Collection(fg876h89f0n98hgn9)' dropped`);
			return;
		};
		*/
		if (msg.content.startsWith(KyleMethods.drinkSearchPrefix) && !msg.author.bot) {
			const command: string = msg.content.replace(KyleMethods.drinkSearchPrefix, "").replace(" ", "%20");
			const drinkName: string = command.replace("%20", " ");
			// fetch
			KyleMethods.GetApi(`drink-search/?drink=${command}`)
				.then((returnedDrinks: any) => {
					let addedDrinks = 0;
					let messageReply = `Here is the list of drinks with ${drinkName} in the name!\n`;
					for (let i = 0;
						(i < returnedDrinks.length) && (messageReply.length < KyleMethods.discordMsgLmt); i++) {
						messageReply += returnedDrinks[i].drink + "\n";
						addedDrinks += 1;
					}
					if (returnedDrinks.length > addedDrinks) {
						messageReply += "\n... Too many to list them all! Discord limits my message size :( \n";
					}
					messageReply += "\nRequest ingredients and instructions by typing " + KyleMethods.drinkPrefix + " followed by the desired drink name!";
					msg.reply(messageReply);
				});
		} else if (msg.content.startsWith(KyleMethods.drinkPrefix) && !msg.author.bot && !msg.content.startsWith(KyleMethods.drinkSearchPrefix)) {
			const command: string = msg.content.replace(KyleMethods.drinkPrefix, "").replace(" ", "%20");
			// fetch
			KyleMethods.GetApi(`drink/?drink=${command}`)
				.then((returnedDrink: any) => {
					if (returnedDrink.length > 0) {
						const drink: any = returnedDrink[0];
						KyleMethods.GetPrimaryColor(drink.drink_thumb)
							.then(color => {
								const drinkEmbed: MessageEmbed = new MessageEmbed()
									.setColor(color)
									.addField("Glass:", drink.glass)
									.setTitle("Drink Name: " + drink.drink)
									.setDescription(drink.instructions)
									.setImage(drink.drink_thumb);
								for (let i = 0; i < drink.ingredients.length; i++) {
									drinkEmbed.addField(drink.ingredients[i] + ":", (drink.measurement[i] === "" || drink.measurement[i] === undefined ? "Not specified" : drink.measurement[i]));
								}
								msg.reply(drinkEmbed);
							});
					} else {
						msg.reply("Sorry, we don't have instructions for that one!");
					}
				});
		} else if (msg.content.startsWith(KyleMethods.ingredientPrefix) && !msg.author.bot) {
			const command: string = msg.content.replace(KyleMethods.ingredientPrefix, "").replace(" ", "%20");
			KyleMethods.GetApi(`ingredient/?ingredient=${command}`)
				.then((returnedDrinks: any) => {
					if (returnedDrinks.length > 0) {
						let addedDrinks = 0;
						let messageReply = "Here's the list of drinks with the provided ingredient(s)!\n";
						for (let i = 0;
							(i < returnedDrinks.length) && (messageReply.length < KyleMethods.discordMsgLmt); i++) {
							messageReply += returnedDrinks[i].drink + "\n";
							addedDrinks += 1;
						}
						if (returnedDrinks.length > addedDrinks) {
							messageReply += "\n... Too many to list them all! Discord limits my message size :( \n";
						}
						messageReply += "\nRequest ingredients and instructions by typing " + KyleMethods.drinkPrefix + " followed by the desired drink name!";
						msg.reply(messageReply);
					} else {
						msg.reply("I don't have any drinks with that ingredient :(");
					}
				});
		} else if (msg.content.startsWith(KyleMethods.categoryPrefix) && !msg.author.bot) {
			//const args = msg.content.slice(categoryPrefix.length).trim().split(" ");
			//const command = args.shift().toLowerCase();
			msg.reply(KyleMethods.GetDrinksByCategory());
		}
	}
	
	private static GetDrinksByCategory(): string {
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
	
	private static async GetPrimaryColor(image: any): Promise<string> {
		const primaryColor: string = await getColors(image)
			.then(colors => {
				return colors[0].name();
			});
		return primaryColor;
	}
}