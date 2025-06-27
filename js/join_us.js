// js/join_us.js
// Handles logic for the Join Us page (join_us.html)
// Adapted from its inline script

// Global variables for language and theme, mirroring main.js logic if this page is standalone
// If main.js is guaranteed to run before this and expose globals, these could be simplified.
let currentLang = localStorage.getItem("language") || "en";
let currentTheme = localStorage.getItem("theme") || "light"; // Used by applyTheme

const joinModalContainer = document.getElementById('join-modal'); // This is the main overlay div in join_us.html
const closeModalButton = document.getElementById('close-modal-btn');
const joinForm = document.getElementById('join-form');

// Mobile menu elements specific to join_us.html
const mobileMenuToggleBtn = document.getElementById('mobile-menu-toggle');
const mobileServicesMenu = document.getElementById('mobile-services-menu'); // ID from join_us.html for its menu

// Theme toggle specific to join_us.html page (if one exists with #theme-toggle)
const pageThemeToggle = document.getElementById('theme-toggle'); // Assumes an element with ID "theme-toggle" exists on join_us.html

function closeModalDisplay() {
  if (joinModalContainer) {
    // If join_us.html is meant to be a page you can navigate away from,
    // this might redirect or simply hide the form if it's part of a larger SPA (not the case here).
    // For now, let's assume closing means "go back" or clear.
    // As it's a full page, "closing" it might mean navigating away, e.g., to index.html.
    // For dev, it was display:none. If this page is standalone, this button might not be needed,
    // or it could redirect: window.location.href = 'index.html';
    console.log("INFO:join_us/closeModalDisplay: Close button clicked. On standalone page, this might mean navigate away.");
    // joinModalContainer.style.display = 'none'; // Hides the main content area
  }
}

if (closeModalButton) {
  closeModalButton.onclick = closeModalDisplay;
}

// If the overlay itself is clicked (relevant if it's a true modal, less so for a full page view)
if (joinModalContainer) {
  joinModalContainer.addEventListener('click', function(event) {
    if (event.target === joinModalContainer) {
      // closeModalDisplay(); // Only if it's meant to behave like a dismissable modal background
    }
  });
}

// ESC key behavior - less relevant if it's a full page, but kept from original script
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape' && joinModalContainer && getComputedStyle(joinModalContainer).display === 'flex') {
    // closeModalDisplay();
  }
});

if (joinForm) {
  joinForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // console.log(currentLang === 'es' ? 'Formulario enviado.' : 'Form submitted.'); // Replaced alert
    console.log(currentLang === 'es' ? 'INFO:join_us/submit: Formulario enviado (simulado).' : 'INFO:join_us/submit: Form submitted (simulated).');
    // Add actual form submission logic here (e.g., AJAX)
    // For now, just log it.
    const formData = new FormData(joinForm);
    const data = {};
    formData.forEach((value, key) => { data[key] = value; });
    console.log("INFO:join_us/submit: Join Us Form data:", data);
    // joinForm.reset(); // Optionally reset form
  });
}

function updatePageLanguage(lang, parentNode = document.body) {
  if (!parentNode) return;
  document.documentElement.lang = lang;

  const elements = parentNode.matches('[data-en], [data-es], [data-placeholder-en], [data-placeholder-es], [data-aria-label-en], [data-aria-label-es]') ?
                   [parentNode, ...parentNode.querySelectorAll('[data-en], [data-es], [data-placeholder-en], [data-placeholder-es], [data-aria-label-en], [data-aria-label-es]')] :
                   [...parentNode.querySelectorAll('[data-en], [data-es], [data-placeholder-en], [data-placeholder-es], [data-aria-label-en], [data-aria-label-es]')];

  elements.forEach(el => {
    const targetLang = lang;
    const fallbackLang = 'en';

    let textToSet = el.dataset[targetLang] || el.dataset[fallbackLang];
    if (el.placeholder !== undefined) {
      const placeholderText = el.dataset[targetLang + 'Placeholder'] || el.dataset[fallbackLang + 'Placeholder'] || textToSet;
      if (placeholderText !== undefined) el.placeholder = placeholderText;
    } else if (el.childElementCount === 0 || (el.childNodes.length === 1 && el.childNodes[0].nodeType === Node.TEXT_NODE)) {
      // Only update textContent if it's a leaf node or only contains text
      if (textToSet !== undefined) el.textContent = textToSet;
    }
    // Special handling for buttons or elements that might contain only an icon (like font-awesome)
    // This part needs to be robust. The original script checked childElementCount.
    // For now, if textToSet is defined and element has no children elements (only text or icon font), set textContent.
    // This assumes complex buttons (text + icon) are structured with spans for text.

    const ariaLabelText = el.dataset[targetLang + 'AriaLabel'] || el.dataset[fallbackLang + 'AriaLabel'];
    if (ariaLabelText) el.setAttribute('aria-label', ariaLabelText);

    // Update title attribute for elements like the main page title
    if (el.tagName === 'TITLE') {
        const titleText = el.dataset[targetLang] || el.dataset[fallbackLang];
        if (titleText) document.title = titleText;
    }
  });

  // Update language toggle button text if it exists on this page
  const langToggleButton = document.querySelector('.lang-toggle'); // Assuming a class .lang-toggle for the button
  if (langToggleButton) {
    langToggleButton.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
  }
}


function masterToggleLanguageJoinPage(langToSet) {
    const newLang = langToSet ? langToSet : (currentLang === "en" ? "es" : "en");
    if (newLang !== currentLang) {
        currentLang = newLang;
        localStorage.setItem("language", currentLang);
        updatePageLanguage(currentLang, document.body);
        console.log(`INFO:join_us/masterToggleLanguageJoinPage: Language changed to ${currentLang.toUpperCase()}`);
    }
}

// If join_us.html has its own language toggle button
const pageLangToggle = document.querySelector('.lang-toggle'); // Generic class, could be an ID
if (pageLangToggle) {
  pageLangToggle.addEventListener('click', () => masterToggleLanguageJoinPage());
}


function applyPageTheme(theme) {
  document.body.classList.toggle('dark-mode', theme === 'dark');
  localStorage.setItem("theme", theme); // Save theme preference
  currentTheme = theme; // Update global variable

  if (pageThemeToggle) { // If a theme toggle button exists on this page
    pageThemeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }
  console.log(`INFO:join_us/applyPageTheme: Theme set to ${theme}`);
}

function masterToggleThemeJoinPage(themeToSet) {
    const newTheme = themeToSet ? themeToSet : (document.body.classList.contains("dark-mode") ? "light" : "dark");
    if (newTheme !== currentTheme) {
        applyPageTheme(newTheme);
    }
}

if (pageThemeToggle) {
  pageThemeToggle.addEventListener('click', () => masterToggleThemeJoinPage());
}

// Dynamic Form Sections (Skills, Education, etc.)
document.querySelectorAll('.form-section').forEach(section => {
  const addBtn = section.querySelector('.add');
  const removeBtn = section.querySelector('.remove');
  const acceptBtn = section.querySelector('.accept-btn');
  const editBtn = section.querySelector('.edit-btn');
  const inputsContainer = section.querySelector('.inputs');
  const titleElement = section.querySelector('h2');

  if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer || !titleElement) return;

  addBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'text'; // Default to text, can be made more specific if needed
    const titleEn = titleElement.dataset.en || 'info';
    const titleEs = titleElement.dataset.es || 'info';
    const placeholderEn = `Enter ${titleEn} info`;
    const placeholderEs = `Ingresa ${titleEs} info`;
    input.setAttribute('data-placeholder-en', placeholderEn);
    input.setAttribute('data-placeholder-es', placeholderEs);
    input.placeholder = currentLang === 'es' ? placeholderEs : placeholderEn;
    inputsContainer.appendChild(input);
  };

  removeBtn.onclick = () => {
    const allInputs = inputsContainer.querySelectorAll('input');
    if (allInputs.length) {
      inputsContainer.removeChild(allInputs[allInputs.length - 1]);
    }
  };

  acceptBtn.onclick = () => {
    const sectionInputs = inputsContainer.querySelectorAll('input');
    if (sectionInputs.length === 0) {
      console.warn(currentLang === 'es' ? 'User feedback: Agrega al menos una entrada (Join Us form section).' : 'User feedback: Please add at least one entry (Join Us form section).');
      // console.warn(currentLang === 'es' ? 'WARN:join_us/accept: Agrega al menos una entrada.' : 'WARN:join_us/accept: Please add at least one entry.'); // Replaced alert with more user-friendly console log
      return;
    }
    sectionInputs.forEach(input => input.disabled = true);
    acceptBtn.style.display = 'none';
    editBtn.style.display = 'inline-block';
    section.classList.add('completed');
  };

  editBtn.onclick = () => {
    inputsContainer.querySelectorAll('input').forEach(input => input.disabled = false);
    acceptBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
    section.classList.remove('completed');
    if (inputsContainer.querySelector('input')) {
      inputsContainer.querySelector('input').focus();
    }
  };
});

// Mobile Menu Toggle Logic for join_us.html's specific menu
if (mobileMenuToggleBtn && mobileServicesMenu) {
    mobileMenuToggleBtn.addEventListener('click', () => {
        const isOpen = mobileServicesMenu.classList.toggle('open');
        mobileMenuToggleBtn.setAttribute('aria-expanded', isOpen.toString());
        // Optional: If menu opens, focus on the first item or the menu itself
        if (isOpen) mobileServicesMenu.focus();
    });

    // Close menu if clicking outside of it (optional, good UX)
    document.addEventListener('click', (event) => {
        if (mobileServicesMenu.classList.contains('open') &&
            !mobileServicesMenu.contains(event.target) &&
            !mobileMenuToggleBtn.contains(event.target)) {
            mobileServicesMenu.classList.remove('open');
            mobileMenuToggleBtn.setAttribute('aria-expanded', 'false');
        }
    });
}


// Initial setup on page load
document.addEventListener('DOMContentLoaded', () => {
  // Retrieve stored language and theme, or use defaults
  currentLang = localStorage.getItem("language") || "en";
  currentTheme = localStorage.getItem("theme") ||
                 (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light");

  applyPageTheme(currentTheme);
  updatePageLanguage(currentLang, document.body);

  // Set initial state for theme toggle button text if it exists
  if (pageThemeToggle) {
      pageThemeToggle.textContent = currentTheme === 'dark' ? 'Light' : 'Dark';
  }
  // Set initial state for lang toggle button text if it exists
  const langToggleButton = document.querySelector('.lang-toggle');
  if (langToggleButton) {
      langToggleButton.textContent = currentLang === 'en' ? 'EN | ES' : 'ES | EN';
  }

  console.log('INFO:join_us/DOMContentLoaded: Join Us page script initialized.');
  console.log(`INFO:join_us/DOMContentLoaded: Initial language: ${currentLang}, Initial theme: ${currentTheme}`);

  // The "modal" on join_us.html is the main content div and is styled to be always visible.
  // The `joinModalContainer.style.display = 'flex';` was hardcoded in HTML.
  // If it needs to be dynamically shown (e.g. if it were a true pop-up modal on this page),
  // that logic would go here. For now, it's assumed to be part of the page flow.
});
