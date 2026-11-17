function banglaPeriod(hour: number): string {
  if (hour >= 4 && hour < 6) return "ভোর";
  if (hour >= 6 && hour < 12) return "সকাল";
  if (hour >= 12 && hour < 15) return "দুপুর";
  if (hour >= 15 && hour < 18) return "বিকাল";
  if (hour === 18) return "সন্ধ্যা";
  return "রাত";
}

export function clockText(
  hour: number,
  minute: number,
  locale: string,
): string {
  const twelve = hour % 12 || 12;
  const mm = String(minute).padStart(2, "0");
  if (locale === "bn") {
    const digits = new Intl.NumberFormat("bn-BD", { useGrouping: false });
    return `${banglaPeriod(hour)} ${digits.format(twelve)}:${digits.format(Number(mm[0]))}${digits.format(Number(mm[1]))}`;
  }
  return `${twelve}:${mm} ${hour < 12 ? "AM" : "PM"}`;
}

export function formatTime(time: string, locale: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return clockText(hour, minute, locale);
}

export function formatDhakaMoment(
  value: string | Date,
  locale: string,
  dateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
): string {
  const moment = new Date(value);
  const day = new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-US", {
    ...dateOptions,
    timeZone: "Asia/Dhaka",
  }).format(moment);
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Dhaka",
  }).formatToParts(moment);
  const number = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);
  return `${day}, ${clockText(number("hour"), number("minute"), locale)}`;
}
