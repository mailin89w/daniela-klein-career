(() => {
  "use strict";

  const root = document.documentElement;
  const isEnglish = root.lang === "en";
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const header = document.querySelector("[data-header]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const systemTheme = () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const activeTheme = () => root.dataset.theme || systemTheme();

  const updateThemeControl = () => {
    if (!themeToggle) return;
    const isDark = activeTheme() === "dark";
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark
      ? (isEnglish ? "Switch to light mode" : "Helles Farbschema aktivieren")
      : (isEnglish ? "Switch to dark mode" : "Dunkles Farbschema aktivieren"));
  };

  themeToggle?.addEventListener("click", () => {
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    try { localStorage.setItem("theme", nextTheme); } catch (error) {}
    updateThemeControl();
  });
  updateThemeControl();

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealElements = document.querySelectorAll("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.12 });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const countElements = document.querySelectorAll("[data-count]");
  const animateCount = (element) => {
    const target = Number(element.dataset.count);
    if (!Number.isFinite(target) || reduceMotion) {
      element.textContent = String(target);
      return;
    }
    const duration = 850;
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.8 });
    countElements.forEach((element) => countObserver.observe(element));
  } else {
    countElements.forEach(animateCount);
  }
})();
