export const getTrendEmoji = (delta: number) => {
	switch (true) {
		case delta > 0:
			return "📈";
		case delta < 0:
			return "📉";
		default:
			return "";
	}
};

export const plusSignIfNotNegative = (amount: number) => (amount >= 0 ? "+" : "");

export const pluralIfNotOne = (amount: number) => (amount === 1 ? "" : "s");
