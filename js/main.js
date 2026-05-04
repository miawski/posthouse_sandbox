const root = document.documentElement;
const nav = document.querySelector(".site-nav");
const burger = document.querySelector(".burger");
const themeToggle = document.querySelector("#theme-toggle");
const themeSwitchText = document.querySelector(".theme-switch-text");
const scrollFab = document.querySelector(".scroll-fab");
const siteHeader = document.querySelector(".site-header");
const siteFooter = document.querySelector(".site-footer");
const mainSections = Array.from(document.querySelectorAll("main > section"));
const revealItems = document.querySelectorAll(".reveal");
const menuLinks = document.querySelectorAll(".nav-menu a");
const heroMotionSvg = document.querySelector(".hero-visual__path");
const heroMotionTrack = document.querySelector(".hero-visual__path-track");
const heroMotionProgress = document.querySelector(".hero-visual__path-progress");
const heroMotionPackage = document.querySelector(".hero-visual__package");
const heroNodeStart = document.querySelector(".hero-visual__node--start");
const heroNodeMid = document.querySelector(".hero-visual__node--mid");
const heroNodeEnd = document.querySelector(".hero-visual__node--end");
const heroStatusLabel = document.querySelector(".hero-visual__label--status");
const heroDestinationLabel = document.querySelector(".hero-visual__label--destination");
const heroMarker = document.querySelector(".hero-visual__marker");
const heroCompactViewport = window.matchMedia("(max-width: 859px)");

const storedTheme = localStorage.getItem("sandbox-theme");
root.dataset.theme = storedTheme === "light" || storedTheme === "dark" ? storedTheme : "dark";

function updateThemeButton() {
  if (!themeToggle) return;

  const isDark = root.dataset.theme === "dark";
  const tooltipText = isDark ? "light mode" : "dark mode";

  if (themeSwitchText) {
    themeSwitchText.textContent = isDark ? "Lys" : "Mørk";
  }

  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Skift til lys tilstand" : "Skift til mørk tilstand",
  );
  themeToggle.setAttribute("aria-checked", String(isDark));
  themeToggle.setAttribute("data-tooltip", tooltipText);
}

function setMenuState(isOpen) {
  if (!nav || !burger) return;

  nav.classList.toggle("is-open", isOpen);
  burger.setAttribute("aria-expanded", String(isOpen));
  burger.setAttribute("aria-label", isOpen ? "Luk menu" : "Åbn menu");
}

function headerOffset() {
  return siteHeader ? siteHeader.offsetHeight : 0;
}

function maxScrollY() {
  return Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
}

function atPageBottom() {
  return window.scrollY >= maxScrollY() - 24;
}

function footerOffset() {
  if (!siteFooter) return 16;

  const footerRect = siteFooter.getBoundingClientRect();
  const overlap = window.innerHeight - footerRect.top + 16;

  return Math.max(16, overlap);
}

function isTopMode() {
  return atPageBottom();
}

function nextTopLevelSection() {
  const currentMarker = window.scrollY + headerOffset() + 24;
  return mainSections.find((section) => section.offsetTop > currentMarker + 8);
}

function scrollForward() {
  const nextSection = nextTopLevelSection();
  const targetTop = nextSection
    ? nextSection.offsetTop - headerOffset() - 16
    : maxScrollY();

  window.scrollTo({
    top: Math.min(maxScrollY(), Math.max(0, targetTop)),
    behavior: "smooth",
  });
}

updateThemeButton();
setMenuState(false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("sandbox-theme", root.dataset.theme);
    updateThemeButton();
  });
}

if (burger) {
  burger.addEventListener("click", () => {
    setMenuState(!nav.classList.contains("is-open"));
  });
}

menuLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

function updateScrollFab() {
  if (!scrollFab) return;

  const topMode = isTopMode();
  scrollFab.textContent = topMode ? "Til toppen" : "Til indhold";
  scrollFab.classList.toggle("is-top", topMode);
  scrollFab.setAttribute(
    "aria-label",
    topMode ? "Til toppen" : "Til indhold",
  );
  scrollFab.style.bottom = `${footerOffset()}px`;
}

if (scrollFab && mainSections.length) {
  scrollFab.addEventListener("click", () => {
    if (isTopMode()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    scrollForward();
  });
}

window.addEventListener("scroll", updateScrollFab, { passive: true });
window.addEventListener("load", updateScrollFab);
window.addEventListener("resize", () => {
  updateScrollFab();
  if (window.innerWidth >= 860) {
    setMenuState(false);
  }
});
updateScrollFab();

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
  );

  revealItems.forEach((item) => {
    if (item.classList.contains("is-visible")) return;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const heroPrefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupHeroMotion() {
  if (
    !heroMotionSvg ||
    !heroMotionTrack ||
    !heroMotionProgress ||
    !heroMotionPackage
  ) {
    return;
  }

  const pathLength = heroMotionTrack.getTotalLength();
  let lastHeroProgress = 0;

  heroMotionProgress.style.strokeDasharray = `${pathLength}`;
  heroMotionProgress.style.strokeDashoffset = `${pathLength}`;

  function getHeroPoint(progress) {
    const safeProgress = Math.min(1, Math.max(0, progress));
    const svgBox = heroMotionSvg.viewBox.baseVal;
    const scaleX = heroMotionSvg.clientWidth / svgBox.width;
    const scaleY = heroMotionSvg.clientHeight / svgBox.height;
    const point = heroMotionTrack.getPointAtLength(pathLength * safeProgress);

    return {
      x: point.x * scaleX,
      y: point.y * scaleY,
    };
  }

  function clampHeroValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function positionHeroElement(element, point, offsetX = 0, offsetY = 0) {
    if (!element || !point) return;

    element.style.left = `${point.x + offsetX}px`;
    element.style.top = `${point.y + offsetY}px`;
  }

  function positionHeroLabel(
    element,
    point,
    offsetX = 0,
    offsetY = 0,
    anchor = "center",
  ) {
    if (!element || !point || !heroMotionSvg) return;

    const labelWidth = element.offsetWidth || 112;
    const labelHeight = element.offsetHeight || 34;
    let desiredX = point.x + offsetX;

    if (anchor === "left-outside") {
      desiredX = point.x - labelWidth - offsetX;
    } else if (anchor === "right-outside") {
      desiredX = point.x + offsetX;
    } else if (anchor === "center") {
      desiredX = point.x - (labelWidth / 2) + offsetX;
    }

    const x = clampHeroValue(
      desiredX,
      12,
      heroMotionSvg.clientWidth - labelWidth - 12,
    );
    const y = clampHeroValue(
      point.y + offsetY,
      12,
      heroMotionSvg.clientHeight - labelHeight - 12,
    );

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
  }

  function positionHeroDecorations() {
    const compact = heroCompactViewport.matches;
    const startPoint = getHeroPoint(compact ? 0.04 : 0.02);
    const midPoint = getHeroPoint(compact ? 0.48 : 0.52);
    const endPoint = getHeroPoint(compact ? 0.76 : 0.86);
    const markerPoint = getHeroPoint(1);
    const statusPoint = getHeroPoint(compact ? 0.04 : 0.02);
    const destinationPoint = compact ? getHeroPoint(0.72) : markerPoint;

    positionHeroElement(heroNodeStart, startPoint);
    positionHeroElement(heroNodeMid, midPoint);
    positionHeroElement(heroNodeEnd, endPoint);
    positionHeroElement(heroMarker, markerPoint, 0, compact ? 1 : 0);
    positionHeroLabel(
      heroStatusLabel,
      statusPoint,
      compact ? 10 : 12,
      compact ? 16 : 18,
      "left-outside",
    );
    positionHeroLabel(
      heroDestinationLabel,
      destinationPoint,
      compact ? 6 : 36,
      compact ? -38 : -88,
      "right-outside",
    );
  }

  function setHeroProgress(progress) {
    const safeProgress = Math.min(1, Math.max(0, progress));
    const svgBox = heroMotionSvg.viewBox.baseVal;
    const currentLength = pathLength * safeProgress;
    const point = heroMotionTrack.getPointAtLength(currentLength);
    const ahead = heroMotionTrack.getPointAtLength(
      Math.min(pathLength, currentLength + 10),
    );
    const scaleX = heroMotionSvg.clientWidth / svgBox.width;
    const scaleY = heroMotionSvg.clientHeight / svgBox.height;
    const angle = Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);
    const packageAngle = angle * 0.78;
    const x = point.x * scaleX;
    const y = point.y * scaleY;

    lastHeroProgress = safeProgress;

    heroMotionPackage.style.left = `${x}px`;
    heroMotionPackage.style.top = `${y}px`;
    heroMotionPackage.style.transform =
      `translate(-50%, -50%) rotate(${packageAngle}deg)`;
    heroMotionProgress.style.strokeDashoffset = `${pathLength - currentLength}`;

    if (heroStatusLabel) {
      heroStatusLabel.classList.toggle("is-active", safeProgress < 0.68);
    }

    if (heroDestinationLabel) {
      heroDestinationLabel.classList.toggle("is-active", safeProgress > 0.54);
    }

    if (heroMarker) {
      heroMarker.classList.toggle("is-active", safeProgress > 0.76);
    }
  }

  if (heroPrefersReducedMotion.matches) {
    positionHeroDecorations();
    setHeroProgress(0.72);
    return;
  }

  const duration = 6200;
  let startTime = 0;

  function animateHeroMotion(timestamp) {
    if (!startTime) startTime = timestamp;

    const elapsed = (timestamp - startTime) % duration;
    setHeroProgress(elapsed / duration);
    window.requestAnimationFrame(animateHeroMotion);
  }

  positionHeroDecorations();
  window.requestAnimationFrame(animateHeroMotion);
  window.addEventListener("resize", () => {
    positionHeroDecorations();
    setHeroProgress(lastHeroProgress);
  });
}

setupHeroMotion();
