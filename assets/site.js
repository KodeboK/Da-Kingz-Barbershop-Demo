import { setupExperience } from "./experience.js?v=17";
import { setupBanner } from "./banner.js";
import { setupDockEffects } from "./dock-effects.js";
import { setupBookingPreview } from "./booking.js?v=10";
import { hoursStatus, hoursTone } from "./shop-hours.js";

(() => {
  const one = (selector, parent = document) => parent.querySelector(selector);
  const all = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const root = document.documentElement;
  setupBanner();
  setupExperience();
  const noMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const network = navigator.connection;
  const motion = !noMotion.matches && !network?.saveData && !/^(slow-2g|2g)$/.test(network?.effectiveType || "") && (navigator.hardwareConcurrency || 4) > 2;
  const canMeasure = root.dataset.page === "home" && navigator.doNotTrack !== "1" && !navigator.globalPrivacyControl;
  function track(action, detail = "") {
    if (!canMeasure) return;
    let source = "";
    try {
      const hostname = new URL(document.referrer).hostname;
      if (hostname !== location.hostname) source = hostname;
    } catch {}
    const body = JSON.stringify({ action, detail, source });
    const url = "/events";
    if (!navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) {
      fetch(url, { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }

  const headerHours = one("[data-hours-config]");
  if (headerHours) {
    const settings = JSON.parse(headerHours.dataset.hoursConfig);
    const label = one("[data-hours-label]", headerHours);
    const time = one("[data-hours-time]", headerHours);
    function refreshHours() {
      const status = hoursStatus(settings);
      if (label.textContent !== status.label) label.textContent = status.label;
      if (time.textContent !== status.time) time.textContent = status.time;
      time.hidden = !status.time;
      label.parentElement.dataset.hoursTone = hoursTone(status.label);
    }
    refreshHours();
    setInterval(refreshHours, 15000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) refreshHours();
    });
  }
  for (const details of all(".schedule")) {
    let dismissal;
    if (matchMedia("(hover: hover)").matches) {
      details.addEventListener("mouseenter",()=>{clearTimeout(dismissal);details.open=true;});
      details.addEventListener("mouseleave",()=>{dismissal=setTimeout(()=>details.open=false,250);});
    }
    details.addEventListener("toggle", () => {
      clearTimeout(dismissal);
      if (!details.open) return;
      if(details.matches(":hover")) return;
      dismissal = setTimeout(() => {
        if (!details.open) return;
        if (one(".schedule-panel", details).contains(document.activeElement)) {
          one("summary", details).focus({ preventScroll: true });
        }
        details.open = false;
      }, 5000);
    });
  }

  const nudge = one(".booking-nudge");
  const mobile = matchMedia("(max-width: 700px)");
  let nudgeTimer, hideTimer;
  function dismissBookingNudge() {
    clearTimeout(nudgeTimer);
    clearTimeout(hideTimer);
    if (nudge) nudge.hidden = true;
  }
  if (nudge && mobile.matches) {
    nudgeTimer = setTimeout(() => {
      if (!mobile.matches || document.hidden || one("dialog[open], .dock-effect")) return;
      nudge.hidden = false;
      hideTimer = setTimeout(dismissBookingNudge, 8000);
    }, Number(document.body.dataset.bookingDelay) * 1000);
  }
  setupDockEffects(one(".dock-home"), document.body.dataset.dockAnimation,
    () => !noMotion.matches && !network?.saveData, dismissBookingNudge);

  const hero = one(".hero");
  const driftingPhotos = all(".hero-photo, .inside-photo");
  if (motion) {
    root.classList.add("motion");
    try {
      if (!sessionStorage.getItem("kingz-entered")) {
        sessionStorage.setItem("kingz-entered", "1");
        hero?.classList.add("intro");
      }
    } catch {}
    const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        reveal.unobserve(entry.target);
      }
    }), { threshold: .12 });
    all(".reveal").forEach(element => reveal.observe(element));
  }
  const head = one(".site-head");
  let prior = scrollY;
  let queued = false;
  const dockLinks = all('.dock a[href="#services"]');
  const dockSections = dockLinks.map(anchor => one(anchor.getAttribute("href")));
  function frame() {
    const top = scrollY;
    const total = root.scrollHeight - innerHeight;
    root.style.setProperty("--remaining", 100 - (total > 0 ? Math.max(0, Math.min(100, top * 100 / total)) : 0));
    if (top <= 90) head.classList.remove("compact");
    else if (Math.abs(top - prior) >= 6) {
      head.classList.toggle("compact", top > prior);
      prior = top;
    }
    if (motion && !noMotion.matches) {
      if (hero && top <= hero.offsetHeight) hero.style.setProperty("--parallax", (top * .12) + "px");
      driftingPhotos.forEach(photo => {
        const box = photo.parentElement.getBoundingClientRect();
        if (box.bottom < 0 || box.top > innerHeight) return;
        const amount = Math.min(28, box.height * .054);
        const progress = (innerHeight * .5 - box.top - box.height * .5) / (innerHeight * .6);
        photo.style.setProperty("--photo-drift", Math.max(-amount, Math.min(amount, progress*amount)) + "px");
      });
    }
    dockLinks.forEach((link, index) => {
      const rect = dockSections[index].getBoundingClientRect();
      const active = rect.top <= innerHeight * .43 && rect.bottom >= innerHeight * .43;
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    queued = false;
  }
  const requestFrame = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  };
  addEventListener("scroll", requestFrame, { passive: true });
  addEventListener("resize", requestFrame, { passive: true });
  const resize = new ResizeObserver(requestFrame);
  resize.observe(document.body);
  requestFrame();

  const book = one("#book-dialog"), lightbox = one("#photo-dialog");
  setupBookingPreview(book);
  let activeDialog = null, opener = null;
  function show(dialog, from) {
    if (!dialog?.showModal || activeDialog) return false;
    dismissBookingNudge();
    activeDialog = dialog;
    opener = from;
    history.pushState({ kingzDialog: dialog.id }, "", location.href);
    dialog.showModal();
    one("[data-close]", dialog).focus();
    return true;
  }
  function dismiss() {
    if (!activeDialog) return;
    if (history.state?.kingzDialog === activeDialog.id) history.back();
    else finishDialog();
  }
  function finishDialog() {
    if (!activeDialog) return;
    activeDialog.close();
    activeDialog = null;
    opener?.focus({ preventScroll: true });
    opener = null;
  }
  addEventListener("popstate", finishDialog);
  for (const dialog of [book, lightbox].filter(Boolean)) {
    dialog.addEventListener("cancel", event => {
      event.preventDefault();
      dismiss();
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog || event.target.closest("[data-close]")) dismiss();
    });
  }

  const galleryPhotos = all(".gallery-grid [data-photo]");
  const photos = galleryPhotos.length ? galleryPhotos : [...new Map(all("[data-photo]").map(photo => [photo.dataset.photo,photo])).values()];
  const photoImage = one(".lightbox img");
  const photoSource = one(".lightbox figcaption a");
  let filter = "", photoSet = [], position = 0;
  function renderPhoto() {
    const current = photoSet[position];
    const image = one("img", current);
    photoImage.src = image.getAttribute("src");
    photoImage.alt = image.alt;
    photoSource.hidden = !current.dataset.source;
    if (current.dataset.source) photoSource.href = current.dataset.source;
    else photoSource.removeAttribute("href");
    one(".photo-count").textContent = (position + 1) + " / " + photoSet.length;
    all("[data-photo-step]").forEach(button => { button.disabled = photoSet.length <= 1; });
  }
  function movePhoto(by) {
    if (photoSet.length < 2) return;
    position = (position + by + photoSet.length) % photoSet.length;
    renderPhoto();
  }
  let finger;
  photoImage.addEventListener("touchstart", event => {
    const point = event.changedTouches[0];
    finger = [point.clientX, point.clientY];
  }, { passive: true });
  photoImage.addEventListener("touchend", event => {
    if (!finger) return;
    const point = event.changedTouches[0];
    const delta = point.clientX - finger[0];
    if (Math.abs(delta) > 48 && Math.abs(delta) > Math.abs(point.clientY - finger[1]) * 1.5) movePhoto(delta < 0 ? 1 : -1);
    finger = null;
  }, { passive: true });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") all(".schedule[open]").forEach(details => {
      details.open = false;
      one("summary", details).focus();
    });
    if (!lightbox.open || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    movePhoto(event.key === "ArrowLeft" ? -1 : 1);
  });

  const serviceMedia = one(".service-media");
  const rows = all(".service");
  function servicePhoto(service) {
    if (!serviceMedia) return;
    const original = one(".service-mobile-photo", service);
    const previous = one(".service-active", serviceMedia);
    if (!original) {
      if (previous) previous.hidden = true;
      return;
    }
    const next = original.cloneNode();
    next.className = "service-active";
    next.loading = "eager";
    serviceMedia.append(next);
    previous?.remove();
    if (motion && !noMotion.matches) next.animate([{ opacity: .4 }, { opacity: 1 }], { duration: 260 });
  }
  rows.forEach(row => row.addEventListener("toggle", () => {
    if (!row.open) return;
    rows.forEach(other => { if (other !== row) other.open = false; });
    servicePhoto(row);
  }));
  const reviews = all(".review-slides article");
  let reviewIndex = 0;
  document.addEventListener("click", event => {
    all(".schedule[open]").forEach(details => {
      if (!details.contains(event.target)) details.open = false;
    });
    const action = event.target.closest("[data-book],[data-event],[data-photo],[data-photo-step],[data-filter],[data-map],[data-review],.service summary");
    if (!action) return;
    if (action.dataset.event === "booking_link") dismissBookingNudge();
    if (action.hasAttribute("data-book")) {
      track("booking_prompt");
      if (show(book, action === nudge ? one(".dock-book") : action)) event.preventDefault();
    } else if (action.dataset.event) {
      track(action.dataset.event);
    } else if (action.dataset.photo) {
      const match = photos.find(button => button.dataset.photo === action.dataset.photo);
      if (!match) return;
      photoSet = action.closest(".gallery-grid") ? photos.filter(photo => !filter || photo.dataset.tag === filter) : photos;
      position = photoSet.indexOf(match);
      renderPhoto();
      show(lightbox, action);
      track("gallery_photo");
    } else if (action.hasAttribute("data-photo-step")) {
      movePhoto(Number(action.dataset.photoStep));
    } else if (action.hasAttribute("data-filter")) {
      filter = action.dataset.filter;
      all("[data-filter]").forEach(button => button.setAttribute("aria-pressed", button === action));
      galleryPhotos.forEach(photo => { photo.hidden = Boolean(filter && photo.dataset.tag !== filter); });
      track("gallery_filter");
    } else if (action.dataset.map) {
      const card = one("#map-card");
      if (one("iframe", card)) return;
      const frame = document.createElement("iframe");
      frame.title = "Map showing the shop location";
      frame.src = action.dataset.map;
      frame.referrerPolicy = "no-referrer-when-downgrade";
      card.append(frame);
      action.textContent = "Map loaded";
      action.disabled = true;
    } else if (action.dataset.review) {
      reviews[reviewIndex].hidden = true;
      reviewIndex = (reviewIndex + (action.dataset.review === "next" ? 1 : -1) + reviews.length) % reviews.length;
      reviews[reviewIndex].hidden = false;
    } else {
      const service = action.parentElement;
      if (!service.open) track("service_open", service.dataset.service);
    }
  });
  track("page_view");
})();
