/* Taha Daboussi — portfolio. Vanilla, no deps, no build step. */
(() => {
  "use strict";
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme: persisted, else system, default dark ------------------- */
  const themeBtn = $("#themeToggle");
  const useIcon = (on) => $("use", themeBtn).setAttribute("href", on === "dark" ? "#i-sun" : "#i-moon");
  const stored = localStorage.getItem("theme");
  const initial = stored || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const applyTheme = (t) => {
    root.dataset.theme = t;
    useIcon(t);
    themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    root.querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim());
  };
  applyTheme(initial);
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("theme", next);
  });

  /* ---- Mobile nav ---------------------------------------------------- */
  const burger = $("#burger");
  const links = $("#navlinks");
  const setMenu = (open) => {
    links.toggleAttribute("data-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!links.hasAttribute("data-open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---- Scroll progress + sticky-nav border + back-to-top ------------- */
  const bar = $("#scrollbar");
  const nav = $("#nav");
  const toTop = $("#toTop");
  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    nav.toggleAttribute("data-stuck", y > 8);
    toTop.toggleAttribute("data-show", y > innerHeight * 0.9);
    toTop.hidden = y <= innerHeight * 0.9;
    ticking = false;
  };
  addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  toTop.addEventListener("click", () =>
    scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  /* ---- Scroll-reveal ------------------------------------------------- */
  const reveals = $$(".reveal");
  root.classList.add("reveal-ready"); // arms the hidden state only now that JS is live
  if (reduce || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---- Active section in nav ---------------------------------------- */
  const navMap = new Map($$(".nav__links a").map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const a = navMap.get(en.target.id);
      if (a && en.isIntersecting) {
        navMap.forEach((x) => x.removeAttribute("aria-current"));
        a.setAttribute("aria-current", "true");
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => { if (navMap.has(s.id)) spy.observe(s); });

  /* ---- Hero local clock (Beirut) + footer year ----------------------- */
  const clock = $("#clock");
  const tick = () => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Beirut", hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());
  };
  tick(); setInterval(tick, 30000);
  $("#year").textContent = new Date().getFullYear();

  /* ---- Contact form → mailto (no backend) ---------------------------- */
  const form = $("#mailForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = (f.get("name") || "").toString().trim();
    const from = (f.get("from") || "").toString().trim();
    const msg = (f.get("body") || "").toString().trim();
    const subject = `Portfolio enquiry — ${name || "no name"}`;
    const body = `${msg}\n\n— ${name}\n${from}`;
    location.href =
      `mailto:Taha_daboussi@hotmail.com?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
  });
})();
