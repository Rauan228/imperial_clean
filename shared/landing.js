"use strict";

const header = document.querySelector(".top");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const compactLayout = window.matchMedia("(max-width: 1040px)");
const isKazakh = document.documentElement.lang === "kk";
const copy = isKazakh ? {
  menuOpen: "Мәзірді ашу",
  menuClose: "Мәзірді жабу",
  phoneFormat: "Телефон нөмірін кодымен бірге жазыңыз, 10–15 цифр.",
  phoneRequired: "Телефон нөмірін енгізіңіз.",
  serviceRequired: "Тазалау қызметін таңдаңыз.",
  areaFormat: "Ауданын санмен көрсетіңіз (кемінде 1 м²).",
  greeting: brand => `Сәлеметсіз бе! ${brand} компаниясынан тазалау қызметінің құнын білгім келеді.`,
  serviceLabel: "Қызмет",
  areaLabel: "Ауданы",
  notesLabel: "Түсініктеме",
  phoneLabel: "Байланыс нөмірі",
  ready: "Өтінім дайын. Мәтінді көшіріңіз немесе бөлісіңіз.",
  copied: "Өтінім мәтіні көшірілді.",
  selected: "Мәтін белгіленді. Оны құрылғы мәзірі арқылы көшіріңіз.",
  shareTitle: "Тазалауға өтінім",
  shared: "Мәтін бөлісу мәзіріне берілді.",
  shareFallback: "Өтінімді жіберу үшін мәтінді көшіріңіз.",
} : {
  menuOpen: "Открыть меню",
  menuClose: "Закрыть меню",
  phoneFormat: "Введите номер телефона с кодом, от 10 до 15 цифр.",
  phoneRequired: "Введите номер телефона.",
  serviceRequired: "Выберите услугу.",
  areaFormat: "Укажите площадь числом (от 1 м²).",
  greeting: brand => `Здравствуйте! Хочу узнать стоимость уборки в ${brand}.`,
  serviceLabel: "Услуга",
  areaLabel: "Площадь",
  notesLabel: "Комментарий",
  phoneLabel: "Номер для связи",
  ready: "Заявка подготовлена. Скопируйте текст или поделитесь им.",
  copied: "Текст заявки скопирован.",
  selected: "Текст выделен. Скопируйте его через меню устройства.",
  shareTitle: "Заявка на уборку",
  shared: "Текст передан в меню отправки.",
  shareFallback: "Скопируйте текст, чтобы отправить заявку.",
};

function setMenu(open) {
  const expanded = compactLayout.matches && open;
  menuToggle.setAttribute("aria-expanded", String(expanded));
  menuToggle.setAttribute("aria-label", expanded ? copy.menuClose : copy.menuOpen);
  nav.hidden = compactLayout.matches && !expanded;
}

setMenu(false);
menuToggle.hidden = false;
compactLayout.addEventListener("change", () => {
  const restoreFocus = compactLayout.matches && nav.contains(document.activeElement);
  setMenu(false);
  if (restoreFocus) menuToggle.focus();
});

menuToggle.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") === "false");
});

document.addEventListener("pointerdown", (event) => {
  if (!header.contains(event.target)) setMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    menuToggle.focus();
  }
});

header.addEventListener("click", (event) => {
  const link = event.target.closest("a[href^='#']");
  if (!link || menuToggle.getAttribute("aria-expanded") !== "true") return;
  setMenu(false);

  const section = document.getElementById(link.hash.slice(1));
  const heading = section?.querySelector("h1, h2");
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
});

const progressBar = header.querySelector(".scroll-progress");
const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const landmarks = [...document.querySelectorAll('main section[id]')];
let currentNavLink;
let currentSection;
let framePending = false;

function updateScrollState() {
  framePending = false;
  const offset = compactLayout.matches ? 32 : header.offsetHeight + 32;
  const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
  const section = landmarks.findLast(landmark => landmark.getBoundingClientRect().top <= offset);
  const navLink = navLinks.find(link => link.hash === `#${section?.id}`);

  currentSection = section;
  header.classList.toggle("is-scrolled", window.scrollY > 10);
  progressBar.style.setProperty("--scroll-progress", pageHeight > 0 ? Math.min(1, window.scrollY / pageHeight) : 0);
  if (navLink !== currentNavLink) {
    currentNavLink?.removeAttribute("aria-current");
    navLink?.setAttribute("aria-current", "location");
    currentNavLink = navLink;
  }
}

function requestScrollUpdate() {
  if (framePending) return;
  framePending = true;
  requestAnimationFrame(updateScrollState);
}

updateScrollState();
window.addEventListener("scroll", requestScrollUpdate, { passive: true });
window.addEventListener("resize", requestScrollUpdate);
document.addEventListener("toggle", requestScrollUpdate, true);

for (const link of document.querySelectorAll("[data-language-link]")) {
  const targetPage = link.getAttribute("href");
  link.addEventListener("click", () => {
    link.href = currentSection ? `${targetPage}#${currentSection.id}` : targetPage;
  });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!entry.target.contains(document.activeElement)) {
        entry.target.setAttribute("data-entered", "");
      }
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.12 });

  for (const section of document.querySelectorAll("[data-reveal]")) {
    if (section.getBoundingClientRect().top > window.innerHeight) reveal.observe(section);
  }
}

const form = document.querySelector("#quote-form");
const service = document.querySelector("#service");
const area = document.querySelector("#area");
const phone = document.querySelector("#phone");
const notes = document.querySelector("#notes");
const result = document.querySelector("#quote-result");
const status = document.querySelector("#quote-status");
const message = document.querySelector("#quote-message");
const copyButton = document.querySelector("#quote-copy");
const shareButton = document.querySelector("#quote-share");

function clearResult() {
  if (result.hidden) return;
  result.hidden = true;
  status.textContent = "";
  message.value = "";
}

function validatePhone() {
  const value = phone.value.trim();
  const digits = value.replace(/\D/g, "");
  const valid = /^\+?[0-9\s().-]+$/.test(value) && digits.length >= 10 && digits.length <= 15;
  phone.setCustomValidity(value && !valid ? copy.phoneFormat : "");
}

document.addEventListener("click", (event) => {
  const serviceLink = event.target.closest("[data-service]");
  if (!serviceLink || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  service.value = serviceLink.dataset.service;
  service.setCustomValidity("");
  clearResult();
  if (event.detail === 0) {
    const heading = document.querySelector("#contact-title");
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
});

form.addEventListener("input", (event) => {
  event.target.setCustomValidity?.("");
  if (event.target === phone) validatePhone();
  clearResult();
});

form.addEventListener("invalid", (event) => {
  const field = event.target;
  if (field === service) field.setCustomValidity(copy.serviceRequired);
  if (field === phone && field.validity.valueMissing) field.setCustomValidity(copy.phoneRequired);
  if (field === area) field.setCustomValidity(copy.areaFormat);
}, true);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  validatePhone();
  if (!form.reportValidity()) return;

  const lines = [
    copy.greeting(document.body.dataset.brand),
    `${copy.serviceLabel}: ${service.value}`,
  ];

  if (area.value) lines.push(`${copy.areaLabel}: ${area.value} м²`);
  if (notes.value.trim()) lines.push(`${copy.notesLabel}: ${notes.value.trim()}`);
  lines.push(`${copy.phoneLabel}: ${phone.value.trim()}`);

  message.value = lines.join("\n");
  result.hidden = false;
  status.textContent = copy.ready;
  message.focus({ preventScroll: true });
  result.scrollIntoView({ block: "nearest" });
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(message.value);
    status.textContent = copy.copied;
  } catch {
    message.focus();
    message.select();
    if (document.execCommand("copy")) {
      status.textContent = copy.copied;
      copyButton.focus();
    } else {
      status.textContent = copy.selected;
    }
  }
});

if (typeof navigator.share === "function") {
  shareButton.hidden = false;
  shareButton.addEventListener("click", async () => {
    try {
      await navigator.share({ title: copy.shareTitle, text: message.value });
      status.textContent = copy.shared;
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = copy.shareFallback;
    }
  });
}

form.querySelector("button[type='submit']").disabled = false;
