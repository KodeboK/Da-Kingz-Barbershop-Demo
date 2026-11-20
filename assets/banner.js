export function bannerSettings(value) {
  const message = typeof value?.message === "string" ? value.message.trim().slice(0, 220) : "";
  const validDate = typeof value?.endsAt === "string" && /(?:Z|[+-]\d{2}:\d{2})$/.test(value.endsAt) && Number.isFinite(Date.parse(value.endsAt));
  return { enabled: value?.enabled === true, message, endsAt: validDate ? new Date(value.endsAt).toISOString() : "" };
}
export function countdownParts(endsAt, now = Date.now()) {
  const total = Math.max(0,Math.ceil((Date.parse(endsAt)-now)/1000));
  return {
    days: Math.floor(total/86400),
    hours: Math.floor(total%86400/3600),
    minutes: Math.floor(total%3600/60),
    seconds: total%60,
    expired: !Number.isFinite(total) || total === 0,
  };
}
export const endDateLabel = value => new Intl.DateTimeFormat("en-US", {
  timeZone:"America/New_York",month:"short",day:"numeric",year:"numeric",
  hour:"numeric",minute:"2-digit",timeZoneName:"short",
}).format(new Date(value));

export function setupBanner() {
  const banner = document.querySelector(".temporary-banner");
  if (!banner) return;
  const root = document.documentElement;
  const counters = Object.fromEntries([...banner.querySelectorAll("[data-count]")].map(el=>[el.dataset.count,el]));
  let interval;
  const measure = () => root.style.setProperty("--banner-height", Math.ceil(banner.getBoundingClientRect().height) + "px");
  const resize = new ResizeObserver(measure);
  resize.observe(banner);
  function tick() {
    const left = countdownParts(banner.dataset.endsAt);
    if (left.expired) {
      banner.hidden = true;
      root.classList.remove("has-temporary-banner");
      root.style.setProperty("--banner-height","0px");
      resize.disconnect();
      clearInterval(interval);
      return;
    }
    for (const part of ["days","hours","minutes","seconds"]) counters[part].textContent = String(left[part]).padStart(2,"0");
  }
  interval = setInterval(tick,1000);
  tick();
  measure();
  document.addEventListener("visibilitychange",()=>{if(!document.hidden) tick();});
}
