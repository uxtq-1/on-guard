/*****************************************************
 * main.js
 * Handles language switching, side menu toggles,
 * services sub-menu, modals, form submissions, and
 * theme toggles (desktop & mobile).
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
  // ================== LANGUAGE TOGGLE ================================
  let currentLanguage = localStorage.getItem("language") || "en";
  const langToggleDesktop = document.getElementById("language-toggle-desktop");
  const langToggleMobile  = document.getElementById("language-toggle-mobile"); // <-- FIXED

  // Helper: set text to either data-en or data-es
  function updateLanguage(lang) {
    const translatableElements = document.querySelectorAll("[data-en]");
    translatableElements.forEach((el) => {
      el.textContent = (lang === "en")
        ? el.getAttribute("data-en")
        : el.getAttribute("data-es");
    });
  }
  document.body.setAttribute("lang", currentLanguage);
  updateLanguage(currentLanguage);

  function setLanguageButtonLabels() {
    if (langToggleDesktop) {
      langToggleDesktop.textContent = (currentLanguage === "en") ? "ES" : "EN";
    }
    if (langToggleMobile) {
      const mobileSpan = langToggleMobile.querySelector("span") || langToggleMobile;
      mobileSpan.textContent = (currentLanguage === "en") ? "ES" : "EN";
    }
  }
  setLanguageButtonLabels();

  function toggleLanguage() {
    currentLanguage = (currentLanguage === "en") ? "es" : "en";
    localStorage.setItem("language", currentLanguage);
    document.body.setAttribute("lang", currentLanguage);
    updateLanguage(currentLanguage);
    setLanguageButtonLabels();
  }
  if (langToggleDesktop) langToggleDesktop.addEventListener("click", toggleLanguage);
  if (langToggleMobile) langToggleMobile.addEventListener("click", toggleLanguage);

  // ================== THEME TOGGLE ================================
  const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
  const themeToggleMobile  = document.getElementById("theme-toggle-mobile"); // <-- FIXED
  const bodyElement = document.body;
  const savedTheme = localStorage.getItem("theme") || "light";
  bodyElement.setAttribute("data-theme", savedTheme);

  function setupThemeToggle(button) {
    if (!button) return;
    button.textContent = (savedTheme === "light") ? "Dark" : "Light";
    button.addEventListener("click", () => {
      const currentTheme = bodyElement.getAttribute("data-theme");
      if (currentTheme === "light") {
        bodyElement.setAttribute("data-theme", "dark");
        button.textContent = "Light";
        localStorage.setItem("theme", "dark");
      } else {
        bodyElement.setAttribute("data-theme", "light");
        button.textContent = "Dark";
        localStorage.setItem("theme", "light");
      }
    });
  }
  setupThemeToggle(themeToggleDesktop);
  setupThemeToggle(themeToggleMobile);

  // ================== (Other code unchanged, skipped for brevity) ===================

  // ================== SANITIZE & FORM SUBMISSIONS ===================
  function sanitizeInput(input) {
    return input.replace(/<[^>]*>/g, '').trim(); // Basic XSS protection
  }
  // Join Us Form
  const joinForm = document.getElementById('join-form');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = sanitizeInput(document.getElementById("join-name").value);
      const email = sanitizeInput(document.getElementById("join-email").value);
      const contact = sanitizeInput(document.getElementById("join-contact").value);
      const comment = sanitizeInput(document.getElementById("join-comment").value);

      console.log("Sanitized Join Form Submission →", { name, email, contact, comment });
      alert('Thank you for joining us! Your information has been safely received.');
      joinForm.reset();
      document.getElementById('join-modal').classList.remove('active');
    });
  }
  // Contact Us Form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // FIXED FIELD NAME!
      const contactName = sanitizeInput(document.getElementById("contact-name").value);
      const contactEmail = sanitizeInput(document.getElementById("contact-email").value);
      const contactMessage = sanitizeInput(document.getElementById("contact-comments").value); // <-- FIXED

      console.log("Sanitized Contact Form Submission →", { contactName, contactEmail, contactMessage });
      alert('Thank you for contacting us! We will get back to you soon.');
      contactForm.reset();
      document.getElementById('contact-modal').classList.remove('active');
    });
  }
});
