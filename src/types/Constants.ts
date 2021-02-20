/* eslint-disable no-unused-vars */

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
	oneWeek = 604800000 // 24 * 60 * 60 * 1000 * 7
}

export class Checks {
	public static readonly townRoad: RegExp = /.*!boydTownRoad.*/gmi;
	public static readonly exitStream: RegExp = /.*!stop.*/gmi;
	public static readonly skiStats: RegExp = /.*(!skistats).*/gmi;
	public static readonly fridayFunny: RegExp = /.*!diane.*/gmi;
	public static readonly fridayFunnies: RegExp = /.*!fridayfunnies*/gmi;
	public static readonly bucksReg: RegExp = /.*!bucks*/gmi;
	public static readonly allowance: RegExp = /.*!allowance*/gmi;
	public static readonly getNobles: RegExp = /.*!noblemen*/gmi;
	public static readonly howardUpdate: RegExp = /.*!whereshowwie*/gmi;
	public static readonly configure: RegExp = /.*!configure*/gmi;
	public static readonly goodBot: RegExp = /.*good bot*/gmi;
	public static readonly badBot: RegExp = /.*bad bot*/gmi;
}