export const HOME_SECTIONS = {
  hero: "Hero",
  standard: "The Kingz Standard",
  featured: "Featured cuts",
  services: "Services and pricing",
  inside: "Inside Da Kingz",
  gallery: "Photo gallery",
  booking: "Book your chair",
  social: "Instagram",
  visit: "Visit and reviews",
};

export const DOCK_ANIMATIONS = {
  none: "Off",
  clipper: "Clipper page tear",
  fountain: "Barber blade fountain",
};

export function homeSettings(value) {
  const delay = value?.bookingDelay;
  const seconds = delay === "" || delay == null ? 10 : Number(delay);
  return {
    sections: Object.fromEntries(Object.keys(HOME_SECTIONS).map(section => [
      section, value?.sections?.[section] !== false,
    ])),
    bookingDelay: Number.isFinite(seconds) ? Math.min(120, Math.max(0, Math.round(seconds))) : 10,
    animation: Object.hasOwn(DOCK_ANIMATIONS, value?.animation) ? value.animation : "clipper",
  };
}
