/*****************************************************
 * main.js
 * Handles language switching, side menu toggles,
 * services sub-menu, modals, form submissions, and
 * theme toggles (desktop & mobile).
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  // Show secure content after load
  const secureContent = document.getElementById("secure-content");
  if (secureContent) secureContent.style.display = "block";
/*****************************************************
  // Language toggle setup
*****************************************************/
  let currentLanguage = localStorage.getItem("language") || "en";
  const langToggleDesktop = document.getElementById("language-toggle-desktop");
  const langToggleMobile = document.getElementById("mobile-language-toggle");

  function updateLanguage(lang) {
    document.querySelectorAll("[data-en]").forEach(el => {
      el.textContent = (lang === "en") ? el.getAttribute("data-en") : el.getAttribute("data-es");
    });
  }
  document.body.lang = currentLanguage;
  updateLanguage(currentLanguage);

  function setLanguageButtonLabels() {
    if (langToggleDesktop) langToggleDesktop.textContent = (currentLanguage === "en") ? "ES" : "EN";
    if (langToggleMobile) langToggleMobile.textContent = (currentLanguage === "en") ? "ES" : "EN";
  }
  setLanguageButtonLabels();

  function toggleLanguage() {
    currentLanguage = (currentLanguage === "en") ? "es" : "en";
    localStorage.setItem("language", currentLanguage);
    document.body.lang = currentLanguage;
    updateLanguage(currentLanguage);
    setLanguageButtonLabels();
  }
  langToggleDesktop?.addEventListener("click", toggleLanguage);
  langToggleMobile?.addEventListener("click", toggleLanguage);
  
/*****************************************************
  // Theme toggle setup
*****************************************************/

  const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
  const themeToggleMobile = document.getElementById("mobile-theme-toggle");
  const body = document.body;
  let currentTheme = localStorage.getItem("theme") || "light";
  body.dataset.theme = currentTheme;

  function setupThemeToggle(btn) {
    if (!btn) return;
    btn.textContent = (currentTheme === "light") ? "Dark" : "Light";
    btn.addEventListener("click", () => {
      currentTheme = (body.dataset.theme === "light") ? "dark" : "light";
      body.dataset.theme = currentTheme;
      localStorage.setItem("theme", currentTheme);
      btn.textContent = (currentTheme === "light") ? "Dark" : "Light";
    });
  }
  setupThemeToggle(themeToggleDesktop);
  setupThemeToggle(themeToggleMobile);
/*****************************************************
  // Modal handling
*****************************************************/
  
  const modalOverlays = document.querySelectorAll(".modal-overlay");
  const closeBtns = document.querySelectorAll("[data-close]");
  const floatingIcons = document.querySelectorAll(".floating-icon");

  floatingIcons.forEach(icon => {
    icon.addEventListener("click", () => {
      const modalId = icon.dataset.modal;
      const modal = document.getElementById(modalId);
      modal?.classList.add("active");
      modal?.focus();
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-overlay")?.classList.remove("active");
    });
  });

  modalOverlays.forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) overlay.classList.remove("active");
    });
    overlay.addEventListener("keydown", e => {
      if (e.key === "Escape") overlay.classList.remove("active");
    });
  });
/*****************************************************
        // Mobile services toggle
*****************************************************/

  const servicesToggle = document.getElementById("mobile-services-toggle");
  const mobileServicesMenu = document.getElementById("mobile-services-menu");
  servicesToggle?.addEventListener("click", () => {
    mobileServicesMenu?.classList.toggle("active");
  });

/*****************************************************
  // Sanitize inputs to prevent XSS
*****************************************************/

  function sanitizeInput(input) {
    return input.replace(/<[^>]*>/g, "").trim();
  }
  
/*****************************************************
  // Join form
*****************************************************/
  
  const joinForm = document.getElementById("join-form");
  joinForm?.addEventListener("submit", e => {
    e.preventDefault();
    const data = {
      name: sanitizeInput(document.getElementById("join-name").value),
      email: sanitizeInput(document.getElementById("join-email").value),
      contact: sanitizeInput(document.getElementById("join-contact").value),
      comment: sanitizeInput(document.getElementById("join-comment").value),
    };
    console.log("Sanitized Join Form Submission →", data);
    alert("Thank you for joining us! Your information has been safely received.");
    joinForm.reset();
    document.getElementById("join-modal").classList.remove("active");
  });

  /*****************************************************
  // Contact form
*****************************************************/

  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", e => {
    e.preventDefault();
    const data = {
      contactName: sanitizeInput(document.getElementById("contact-name").value),
      contactEmail: sanitizeInput(document.getElementById("contact-email").value),
      contactMessage: sanitizeInput(document.getElementById("contact-comments").value),
    };
    console.log("Sanitized Contact Form Submission →", data);
    alert("Thank you for contacting us! We will get back to you soon.");
    contactForm.reset();
    document.getElementById("contact-modal").classList.remove("active");
  });
});
