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

export const getLottoDrawTimeString = () => {
	const drawTime = new Date(Date.UTC(0, 0, 0, 16));
	return drawTime.toLocaleTimeString("en-US", {
		timeZone: "America/New_York",
		hour: "2-digit",
		minute: "2-digit"
	});
};
