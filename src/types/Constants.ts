/* eslint-disable no-unused-vars */
import { ICommand } from "./Abstract";

export enum Colors {
	green = "#00e64d",
	red = "#ff6666"
}

export enum Images {
	billyBuck = "https://cdn.discordapp.com/attachments/734145168776757429/812553027856236605/BullyBuck.png",
	billyMad = "https://cdn.discordapp.com/emojis/694721037006405742.png?v=1"
}

export enum Activities {
	farmville = "Farmville"
}

export enum Roles {
	billyDev = "BillyPBotDev"
}

export const enum Nums {
	oneDay = 86400000, // 24 * 60 * 60 * 1000
	oneWeek = 604800000 // 7 * 24 * 60 * 60 * 1000
}

export const Checks = {
	help: /.*(!help).*/gmi,
	townRoad: /.*!boydTownRoad.*/gmi,
	exitStream: /.*!stop.*/gmi,
	skiStats: /.*(!skistats).*/gmi,
	fridayFunny: /.*!diane.*/gmi,
	fridayFunnies: /.*!fridayfunnies*/gmi,
	bucksReg: /.*!bucks*/gmi,
	allowance: /.*!allowance*/gmi,
	getNobles: /.*!noblemen*/gmi,
	howardUpdate: /.*!whereshowwie*/gmi,
	configure: /.*!configure*/gmi,
	spin: /.*!spin*/gmi,
	bookloan: /.*!bookloan*/gmi,
	payloan: /.*!payloan*/gmi,
	loan: /.*!loan*/gmi,
	creditscore: /.*!creditscore*/gmi,
	billypay: /.*!billypay*/gmi, 
	goodBot: /.*good bot*/gmi,
	badBot: /.*bad bot*/gmi
};

export class Commands {
	public static readonly help: RegExp = /.*!help.*/gmi;
	public static readonly townRoad: RegExp = /.*!boydTownRoad.*/gmi;
	public static readonly exitStream: RegExp = /.*!stop.*/gmi;
	public static readonly skiStats: RegExp = /.*(!skistats).*/gmi;
	public static readonly fridayFunny: RegExp = /.*!diane.*/gmi;
	public static readonly fridayFunnies: RegExp = /.*!fridayfunnies*/gmi;
	public static readonly bucksReg: RegExp = /.*!bucks*/gmi;
	public static readonly allowance: RegExp = /.*!allowance*/gmi;
	public static readonly howardUpdate: RegExp = /.*!whereshowwie*/gmi;
	public static readonly configure: RegExp = /.*!configure*/gmi;
	public static readonly spin: RegExp = /.*!spin*/gmi;
	public static readonly bookloan: RegExp = /.*!bookloan*/gmi;
	public static readonly payloan: RegExp = /.*!payloan*/gmi;
	public static readonly loan: RegExp = /.*!loan*/gmi;
	public static readonly creditscore: RegExp = /.*!creditscore*/gmi;
	public static readonly billypay: RegExp = /.*!billypay*/gmi;
	public static readonly goodBot: RegExp = /.*good bot*/gmi;
	public static readonly badBot: RegExp = /.*bad bot*/gmi;
}

export const CommandDescriptor: ICommand[] = [
	{ prefix: "!help", description: "Shows a list of my commands." },
	{ prefix: "!boydTownRoad", description: "I join voice chat and play an awesome song!" },
	{ prefix: "!stop", description: "Stops the song I play for !boydTownRoad." },
	{ prefix: "!skistats", description: "Fetch the current leaderboard from skifree.js!" },
	{ prefix: "!diane", description: "A hilarious meme straight from Diane's Facebook." },
	{ prefix: "!fridayfunnies", description: "A big 'ole meme dump right into your feed." },
	{ prefix: "!bucks", description: "Get your current balance of BillyBucks, (Optional !bucks [username]) " },
	{ prefix: "!allowance", description: "Collect your weekly BillyBuck allowance! Only available once a week." },
	{ prefix: "!whereshowwie", description: "Get updates on Howard's job status." },
	{ prefix: "!configure", description: "Command for admins to prep the server." },
	{ prefix: "!spin", description: "Let's play Roulette! Usage: '!spin [betAmount] [red/black]'" },
	{ prefix: "!creditscore", description: "Show your current credit score, interest rate, and credit limit that BillyBank will offer you!" },
	{ prefix: "!bookloan", description: "Book a loan with BillyBank today! Usage: '!bookloan [amount]'" },
	{ prefix: "!payloan", description: "Pay off part or all of the outstanding balance on your active loan. Usage: '!payloan [amount]'" },
	{ prefix: "!loan", description: "Show info about your active loan." },
	{ prefix: "!billypay", description: "Pay BillyBucks directly to another user! Usage: '!billypay [username/@user] [amount]'" },
	{ prefix: "good bot", description: "Give me a pat on the head :)" },
	{ prefix: "bad bot", description: "Tell me if I'm doing a bad job." }
];
