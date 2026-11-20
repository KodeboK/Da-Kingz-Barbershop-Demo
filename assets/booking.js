const DAY = 86_400_000;
const eastern = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
});
let monthLabel = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", year: "numeric", month: "long" });
let fullDate = new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" });
const sampleTimes = [540, 630, 720, 810, 900, 990, 1080, 1170];
const dateKey = day => new Date(day).toISOString().slice(0, 10);
const monthStart = (day, offset = 0) => {
  const date = new Date(day);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1);
};
const minutes = time => {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
};
function displayTime(time) {
  const hour = Math.floor(time / 60);
  return (hour % 12 || 12) + ":" + String(time % 60).padStart(2, "0") + (hour < 12 ? " AM" : " PM");
}
export function exampleSlots(day, schedule) {
  const weekday = (new Date(day).getUTCDay() + 6) % 7;
  const exception = schedule.holidays.find(entry => entry.date === dateKey(day));
  const [opens, closes] = exception?.hours ?? schedule.hours?.[weekday] ?? ["08:30", "18:00"];
  if (!opens || !closes) return [];
  return sampleTimes.filter(time => time >= minutes(opens) && time + 30 <= minutes(closes));
}
export function setupBookingPreview(dialog) {
  if (!dialog) return;
  const schedule = JSON.parse(dialog.dataset.bookSchedule);
  const one = selector => dialog.querySelector(selector);
  const provider = one("[data-book-provider]");
  provider?.addEventListener("change",()=>{
    one("[data-provider-note]").textContent=provider.value==="calendly" ? "Calendly-managed appointment preview. Times below are examples; no appointment is submitted." : "Google Calendar appointment preview. Times below are examples.";
    dialog.dispatchEvent(new Event("booking-language-update"));
  });
  dialog.addEventListener("change",()=>{selection.textContent="";slots.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed","false"));});
  const dates = one("[data-book-dates]");
  const slots = one("[data-book-slots]");
  const selection = one("[data-book-selection]");
  const prev = one('[data-book-shift="-1"]');
  const next = one('[data-book-shift="1"]');
  const { year, month: easternMonth, day } = Object.fromEntries(eastern.formatToParts(new Date()).map(part => [part.type, part.value]));
  const today = Date.UTC(Number(year), Number(easternMonth) - 1, Number(day));
  const last = today + DAY * 62;
  const enabled = day => day >= today && day <= last && exampleSlots(day, schedule).length > 0;
  let month = monthStart(today);
  let selectedDay = null;

  function firstInMonth(view) {
    const end = Math.min(monthStart(view, 1), last + DAY);
    for (let day = Math.max(view, today); day < end; day += DAY) {
      if (enabled(day)) return day;
    }
    return null;
  }
  function renderDates(focus = null) {
    const locale=document.documentElement.lang==='es'?'es-US':'en-US';
    monthLabel=new Intl.DateTimeFormat(locale,{timeZone:'UTC',year:'numeric',month:'long'});
    fullDate=new Intl.DateTimeFormat(locale,{timeZone:'UTC',weekday:'long',month:'long',day:'numeric'});
    one("[data-book-month]").textContent = monthLabel.format(month);
    prev.disabled = month <= monthStart(today);
    next.disabled = month >= monthStart(last);
    const blanks = Array.from({ length: new Date(month).getUTCDay() }, () => '<span aria-hidden="true"></span>');
    const first = selectedDay ?? firstInMonth(month);
    const days = [];
    for (let day = month; day < monthStart(month, 1); day += DAY) {
      days.push(`<button type="button" data-book-date="${day}" aria-label="${fullDate.format(day)}" aria-pressed="${day === selectedDay}"${day === today ? ' aria-current="date"' : ""}${enabled(day) ? "" : " disabled"} tabindex="${day === (focus ?? first) ? 0 : -1}">${new Date(day).getUTCDate()}</button>`);
    }
    dates.innerHTML = blanks.concat(days).join("");
    if (focus !== null) one('[data-book-date="' + focus + '"]')?.focus({ preventScroll: true });
  }
  function renderTimes() {
    one("[data-book-day]").textContent = selectedDay === null ? "Choose a date" : fullDate.format(selectedDay);
    selection.textContent = "";
    slots.innerHTML = selectedDay === null ? "<p>No sample times this month.</p>" : exampleSlots(selectedDay, schedule)
      .map(time => `<button type="button" data-book-time="${time}" aria-pressed="false">${displayTime(time)}</button>`).join("");
  }
  function chooseMonth(view) {
    month = view;
    selectedDay = firstInMonth(view);
    renderDates();
    renderTimes();
  }
  dialog.addEventListener("click", event => {
    const action = event.target.closest("[data-book-date],[data-book-time],[data-book-shift]");
    if (!action) return;
    if (action.hasAttribute("data-book-date")) {
      selectedDay = Number(action.dataset.bookDate);
      renderDates(selectedDay);
      renderTimes();
    } else if (action.hasAttribute("data-book-time")) {
      slots.querySelectorAll("button").forEach(button => button.setAttribute("aria-pressed", button === action));
      selection.textContent = [one("[data-book-barber]").selectedOptions[0].textContent,one("[data-book-service]").selectedOptions[0].textContent,displayTime(Number(action.dataset.bookTime)),provider.selectedOptions[0].textContent].join(" · ");
    } else {
      chooseMonth(monthStart(month, Number(action.dataset.bookShift)));
    }
  });
  dates.addEventListener("keydown", event => {
    const button = event.target.closest("[data-book-date]");
    const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 }[event.key];
    if (!button || !move) return;
    event.preventDefault();
    let day = Number(button.dataset.bookDate) + move * DAY;
    while (day >= today && day <= last && !enabled(day)) day += Math.sign(move) * DAY;
    if (!enabled(day)) return;
    if (month !== monthStart(day)) {
      month = monthStart(day);
      selectedDay = day;
      renderTimes();
    }
    renderDates(day);
  });
  document.addEventListener("kingz-language",()=>{renderDates();renderTimes()});
  chooseMonth(month);
}
