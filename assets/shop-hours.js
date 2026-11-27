const easternTime = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});
const DAY = 86_400_000;
const CLOSING_SOON_MINUTES = 30;
const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));
const dateKey = day => new Date(day).toISOString().slice(0, 10);

function hoursForDate(content, date) {
  const weekday = (new Date(date + "T00:00:00Z").getUTCDay() + 6) % 7;
  const exception = content.holidays.find(item => item.date === date);
  return { date, weekday, exception, today: exception?.hours ?? content.hours[weekday] };
}
export function hoursForToday(content, now = new Date()) {
  if (!content.hoursConfirmed) return null;
  const parts = Object.fromEntries(easternTime.formatToParts(now).map(part => [part.type, part.value]));
  const date = [parts.year, parts.month, parts.day].join("-");
  return { ...hoursForDate(content, date), minuteOfDay: Number(parts.hour) * 60 + Number(parts.minute) };
}
function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`;
}
export function timeRange(pair) {
  return pair[0] && pair[1] ? formatTime(pair[0]) + " – " + formatTime(pair[1]) : "Closed";
}
export function hoursStatus(content, now = new Date()) {
  const current = hoursForToday(content, now);
  if (!current) return { label: "Shop hours", time: "" };
  const [opens, closes] = current.today;
  if (opens && closes) {
    if (current.minuteOfDay < minutes(opens)) return { label: "Opens at", time: formatTime(opens) };
    const remaining = minutes(closes) - current.minuteOfDay;
    if (remaining > 0) return {
      label: remaining <= CLOSING_SOON_MINUTES ? "Closing soon at" : "Open until",
      time: formatTime(closes),
    };
  }
  const start = Date.parse(current.date + "T00:00:00Z");
  // Every set of seven days has an opening unless it is overridden by a holiday.
  const lookahead = 7 * (content.holidays.length + 1);
  for (let offset = 1; offset <= lookahead; offset++) {
    const [nextOpen, nextClose] = hoursForDate(content, dateKey(start + offset * DAY)).today;
    if (nextOpen && nextClose) return { label: "Opens at", time: formatTime(nextOpen) };
  }
  return { label: "Shop hours", time: "" };
}

export function hoursTone(label) {
  return { "Open until": "open", "Closing soon at": "closing", "Opens at": "closed" }[label] || "neutral";
}

export function easternMidnight(date){
 const desired=Date.parse(date+'T00:00:00Z');if(!Number.isFinite(desired))throw Error('Invalid date.');let instant=desired;
 for(let i=0;i<3;i++){const parts=Object.fromEntries(easternTime.formatToParts(new Date(instant)).map(p=>[p.type,p.value]));const shown=Date.UTC(Number(parts.year),Number(parts.month)-1,Number(parts.day),Number(parts.hour),Number(parts.minute));const offset=shown-desired;if(!offset)break;instant-=offset}
 return instant/1000;
}
