import type { ISOTimestamp } from "btbot-types";

// e.g. "5/17" (uses the bot's locale and timezone, like the original bot did)
export const formatDateMMDD = (date: ISOTimestamp) =>
  new Date(date).toLocaleDateString().slice(0, -5);

export const formatDateET = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "short",
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// the lottery is drawn every friday at 16:00 UTC (see the backend's lottery cron). this is all
// computed in UTC so that the result doesn't depend on the host's timezone
export const getLottoDrawDateString = () => {
  const now = new Date();
  const drawDate = new Date(now);
  drawDate.setUTCDate(now.getUTCDate() + ((7 + 5 - now.getUTCDay()) % 7));
  drawDate.setUTCHours(16, 0, 0, 0);
  // this week's draw already happened
  if (drawDate.getTime() <= now.getTime()) drawDate.setUTCDate(drawDate.getUTCDate() + 7);
  return formatDateET(drawDate);
};

export const pluralIfNotOne = (amount: number) => (amount === 1 ? "" : "s");

export const plusSignIfNotNegative = (amount: number) => (amount >= 0 ? "+" : "");

export const withPlusSignIfPositive = (amount: number) => (amount > 0 ? `+${amount}` : `${amount}`);

export const getTrendEmoji = (delta: number) => (delta > 0 ? "📈" : delta < 0 ? "📉" : "");

export const truncate = (text: string, maxLength: number) =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
