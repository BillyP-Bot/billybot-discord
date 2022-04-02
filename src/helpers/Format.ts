export class Format {
	
	static UTCToESTString = (time: Date): string => {
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric", month: "numeric", day: "numeric",
			hour: "numeric", minute: "numeric", second: "numeric",
			hour12: true,
			timeZone: "America/Toronto",
			timeZoneName: "short"
		};
		return new Intl.DateTimeFormat("en-US", options).format(time).toString();
	}
}