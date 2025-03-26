import { ISOTimestamp } from "btbot-types";

export const formatDateMMDD = (birthday: ISOTimestamp) => {
	return new Date(birthday).toLocaleDateString().slice(0, -5);
};

export const isValidURL = (str: string) => {
	const pattern = new RegExp(
		"^(https?:\\/\\/)?" +
			"((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" +
			"((\\d{1,3}\\.){3}\\d{1,3}))" +
			"(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" +
			"(\\?[;&a-z\\d%_.~+=-]*)?" +
			"(\\#[-a-z\\d_]*)?$",
		"i"
	);
	return !!pattern.test(str);
};

export const sortArrayByField = <T>(arr: T[], field: keyof T) => {
	return arr.sort((a, b) => {
		if (a[field] < b[field]) return -1;
		if (a[field] > b[field]) return 1;
		return 0;
	});
};

export const getNextDayOfWeek = (date: Date, dayOfWeek: number) => {
	const resultDate = new Date(date.getTime());
	resultDate.setDate(date.getDate() + ((7 + dayOfWeek - date.getDay()) % 7));
	return resultDate;
};

export const formatDateET = (date: Date) =>
	date.toLocaleTimeString("en-US", {
		timeZone: "America/New_York",
		timeZoneName: "short",
		weekday: "long",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});

export const getLottoDrawDateString = () => {
	const now = new Date(Date.now());
	const drawDate = getNextDayOfWeek(now, 5);
	if (drawDate.getDate() == now.getDate() && drawDate.getUTCHours() >= 16) {
		drawDate.setDate(drawDate.getDate() + 7);
	}
	drawDate.setUTCHours(16);
	drawDate.setMinutes(0);
	return formatDateET(drawDate);
};

export const mentionChannel = (channelId: string) => `<#${channelId}>`;
