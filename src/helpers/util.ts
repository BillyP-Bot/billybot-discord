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
