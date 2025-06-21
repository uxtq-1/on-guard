/*****************************************************
 * main.js
 * Handles language switching, side menu toggles,
 * services sub-menu, modals, form submissions, and
'use strict';
 * main.js
 * Handles language switching, side menu toggles,
 * services sub-menu, modals, form submissions, and
 * theme toggles (desktop & mobile).
 *****************************************************/

const RECAPTCHA_V3_SITE_KEY = 'YOUR_ACTUAL_RECAPTCHA_SITE_KEY'; // TODO: Replace with your actual reCAPTCHA v3 Site Key

// ======= APi ======= // USER_SHOULD_REPLACE_THIS_PLACEHOLDER_WITH_ACTUAL_BACKEND_URL // ======= APi ======= //
const BACKEND_SUBMISSION_URL = 'YOUR_ACTUAL_BACKEND_URL/submit'; // TODO: Replace with your actual backend submission URL

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
      // Update text content for elements like labels, buttons, titles
      if (el.hasAttribute(`data-${lang}`)) { // Check if the target language attribute exists
        el.textContent = el.getAttribute(`data-${lang}`);
      } else { // Fallback to 'en' if specific language attribute is missing
        el.textContent = el.getAttribute("data-en");
      }
    });

    // Update placeholders for input and textarea elements
    document.querySelectorAll("input[data-placeholder-en], textarea[data-placeholder-en]").forEach(el => {
      const placeholderAttr = `data-placeholder-${lang}`;
      if (el.hasAttribute(placeholderAttr)) {
        el.placeholder = el.getAttribute(placeholderAttr);
      } else { // Fallback to 'en' placeholder
        el.placeholder = el.getAttribute("data-placeholder-en");
      }
    });

    // Update aria-labels for elements that have them
    document.querySelectorAll("[data-en-aria-label]").forEach(el => {
      const ariaLabelAttr = `data-${lang}-aria-label`;
      if (el.hasAttribute(ariaLabelAttr)) {
        el.setAttribute('aria-label', el.getAttribute(ariaLabelAttr));
      } else { // Fallback to 'en' aria-label
        el.setAttribute('aria-label', el.getAttribute("data-en-aria-label"));
      }
    });
  }
  document.documentElement.lang = currentLanguage;
  updateLanguage(currentLanguage);

  function setLanguageButtonLabels() {
    if (langToggleDesktop) langToggleDesktop.textContent = (currentLanguage === "en") ? "ES" : "EN";
    if (langToggleMobile) langToggleMobile.textContent = (currentLanguage === "en") ? "ES" : "EN";
  }
  setLanguageButtonLabels();

  function toggleLanguage() {
    currentLanguage = (currentLanguage === "en") ? "es" : "en";
    localStorage.setItem("language", currentLanguage);
    document.documentElement.lang = currentLanguage;
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
  // Join form
*****************************************************/
  
  const joinForm = document.getElementById("join-form");
  joinForm?.addEventListener("submit", e => {
    e.preventDefault();
    const formElement = e.target;
    const formType = 'join_modal';
    const siteKey = RECAPTCHA_V3_SITE_KEY;
    const backendUrl = BACKEND_SUBMISSION_URL;

    formElement.querySelector('button[type="submit"]').disabled = true;

    FormEncryptor.processForm(formElement, formType, siteKey, backendUrl, 'RCH385-Magnus_Maximus')

        .then(response => {
            console.log('Join form submission response:', response);
            alert('Application submitted successfully! (Simulated)');
            formElement.reset();
            document.getElementById('join-modal').classList.remove('active');
        })
        .catch(error => {
            console.error('Join form submission error:', error);
            alert('An error occurred during submission: ' + error.message);
        })
        .finally(() => {
            formElement.querySelector('button[type="submit"]').disabled = false;
        });
  });

  /*****************************************************
  // Contact form
*****************************************************/

  const contactForm = document.getElementById("contact-form");
  contactForm?.addEventListener("submit", e => {
    e.preventDefault();
    const formElement = e.target;
    const formType = 'contact_modal';
    const siteKey = RECAPTCHA_V3_SITE_KEY;
    const backendUrl = BACKEND_SUBMISSION_URL;

    formElement.querySelector('button[type="submit"]').disabled = true;

    FormEncryptor.processForm(formElement, formType, siteKey, backendUrl, 'Magd@lena-Silv3r')

        .then(response => {
            console.log('Contact form submission response:', response);
            alert('Message sent successfully! (Simulated)');
            formElement.reset();
            document.getElementById('contact-modal').classList.remove('active');
        })
        .catch(error => {
            console.error('Contact form submission error:', error);
            alert('An error occurred during submission: ' + error.message);
        })
        .finally(() => {
            formElement.querySelector('button[type="submit"]').disabled = false;
        });
  });
});
