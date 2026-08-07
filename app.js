(() => {
  "use strict";

  const root = document.documentElement;
  const isEnglish = root.lang === "en";
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  const backTop = document.querySelector(".back-top");
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

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuToggle || !navigation) return;
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
    root.classList.remove("menu-open");
    if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    navigation?.classList.toggle("is-open", willOpen);
    root.classList.toggle("menu-open", willOpen);
    if (willOpen) navigation?.querySelector("a")?.focus();
  });

  navigation?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle?.getAttribute("aria-expanded") === "true") {
      closeMenu({ restoreFocus: true });
    }
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const updateScrollState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
    backTop?.classList.toggle("is-visible", window.scrollY > Math.max(480, window.innerHeight * 0.75));
  };
  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);

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
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const copyText = async (value) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    document.execCommand("copy");
    field.remove();
  };

  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    button.addEventListener("click", async () => {
      const status = button.parentElement?.querySelector("[data-copy-status]");
      try {
        await copyText(button.dataset.copyEmail);
        button.textContent = button.dataset.copiedLabel;
        if (status) status.textContent = button.dataset.copiedLabel;
        window.setTimeout(() => {
          button.textContent = button.dataset.copyLabel;
          if (status) status.textContent = "";
        }, 2400);
      } catch (error) {
        if (status) status.textContent = isEnglish
          ? "Copying failed. Please select the email address."
          : "Kopieren fehlgeschlagen. Bitte die E-Mail-Adresse markieren.";
      }
    });
  });
})();
