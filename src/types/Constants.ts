/* eslint-disable no-unused-vars */

export enum Colors {
	green = "#00e64d",
	red = "#ff6666"
}

export class Checks {
	public static readonly townRoad: RegExp = /.*!boydTownRoad.*/gmi;
	public static readonly exitStream: RegExp = /.*!stop.*/gmi;
	public static readonly skiStats: RegExp = /.*(!skistats).*/gmi;
	public static readonly fridayFunny: RegExp = /.*!diane.*/gmi;
	public static readonly fridayFunnies: RegExp = /.*!fridayfunnies*/gmi;
	public static readonly bucksReg: RegExp = /.*!bucks*/gmi;
	public static readonly getNobles: RegExp = /.*!noblemen*/gmi;
	public static readonly howardUpdate: RegExp = /.*!whereshowwie*/gmi;
	public static readonly configure: RegExp = /.*!configure*/gmi;
	public static readonly goodBot: RegExp = /.*good bot*/gmi;
	public static readonly badBot: RegExp = /.*bad bot*/gmi;
}