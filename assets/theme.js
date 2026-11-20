(() => {
  const root = document.documentElement;
  const system = matchMedia("(prefers-color-scheme: light)");
  const read = () => {
    try { return localStorage.getItem("kingz-theme"); } catch { return null; }
  };
  const apply = (theme = read() || (system.matches ? "light" : "dark")) => {
    root.dataset.theme = theme;
    const toggle = document.querySelector(".theme");
    if (toggle) toggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  };
  apply();
  system.addEventListener("change", () => { if (!read()) apply(); });
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    document.querySelector(".theme")?.addEventListener("click", () => {
      const theme = root.dataset.theme === "light" ? "dark" : "light";
      try { localStorage.setItem("kingz-theme", theme); } catch {}
      apply(theme);
    });
  });
})();
