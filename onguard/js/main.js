/*****************************************************
 * main.js
 * Handles language switching, theme toggles, modals,
 * new side menu, mobile services menu, and SW registration.
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
    console.log('INFO:Main/DOMContentLoaded: Initializing core functionalities.');

    /* ================================================================
       1) LANGUAGE TOGGLE (Desktop & Mobile)
       ================================================================= */
    let currentLanguage = localStorage.getItem("language") || "en";

    const langToggleDesktop = document.getElementById("language-toggle-desktop");
    const langToggleMobile  = document.getElementById("language-toggle-mobile");

    function updateNodeLanguageTexts(lang, parentNode = document.body) {
        if (!parentNode) return;
        document.documentElement.lang = lang;

        const elements = parentNode.matches('[data-en], [data-es], [data-en-placeholder], [data-es-placeholder], [data-en-label], [data-es-label], [data-en-title], [data-es-title]') ?
                         [parentNode, ...parentNode.querySelectorAll('[data-en], [data-es], [data-en-placeholder], [data-es-placeholder], [data-en-label], [data-es-label], [data-en-title], [data-es-title]')] :
                         [...parentNode.querySelectorAll('[data-en], [data-es], [data-en-placeholder], [data-es-placeholder], [data-en-label], [data-es-label], [data-en-title], [data-es-title]')];

        elements.forEach(el => {
            const targetLang = lang;
            const fallbackLang = 'en';

            let textToSet = el.dataset[targetLang] || el.dataset[fallbackLang];
            if (el.placeholder !== undefined) {
                const placeholderText = el.dataset[targetLang + 'Placeholder'] || el.dataset[fallbackLang + 'Placeholder'] || textToSet;
                if (placeholderText !== undefined) el.placeholder = placeholderText;
            } else if (el.value !== undefined && (el.tagName === 'INPUT' || el.tagName === 'BUTTON')) {
                if (textToSet !== undefined) el.value = textToSet;
            } else {
                let hasNonTextChildNodes = false;
                for(let i=0; i < el.childNodes.length; i++) {
                    if(el.childNodes[i].nodeType !== Node.TEXT_NODE) {
                        hasNonTextChildNodes = true; break;
                    }
                }
                if (!hasNonTextChildNodes || el.childNodes.length === 0) {
                    if (textToSet !== undefined) el.textContent = textToSet;
                }
            }

            const ariaLabel = el.dataset[targetLang + 'Label'] || el.dataset[fallbackLang + 'Label'];
            if (ariaLabel) el.setAttribute('aria-label', ariaLabel);

            const title = el.dataset[targetLang + 'Title'] || el.dataset[fallbackLang + 'Title'];
            if (title) el.setAttribute('title', title);
        });
    }

    function setLanguageButtonVisuals() {
        const newButtonText = (currentLanguage === "en") ? "ES" : "EN";
        const newAriaLabel = (currentLanguage === "en") ? "Switch to Spanish" : "Cambiar a Inglés"; // Example, use data-attributes on buttons for this

        if (langToggleDesktop) {
            langToggleDesktop.textContent = newButtonText;
            langToggleDesktop.setAttribute('aria-label', langToggleDesktop.dataset[currentLanguage + 'Label'] || newAriaLabel);
        }
        if (langToggleMobile) {
            const mobileSpan = langToggleMobile.querySelector("span") || langToggleMobile;
            mobileSpan.textContent = newButtonText;
            langToggleMobile.setAttribute('aria-label', langToggleMobile.dataset[currentLanguage + 'Label'] || newAriaLabel);
        }
    }

    window.masterToggleLanguage = function(langToSet) {
        currentLanguage = langToSet ? langToSet : (currentLanguage === "en" ? "es" : "en");
        localStorage.setItem("language", currentLanguage);
        updateNodeLanguageTexts(currentLanguage, document.body);
        setLanguageButtonVisuals();
        console.log(`INFO:Main/masterToggleLanguage: Language changed to ${currentLanguage.toUpperCase()}`);
    };

    if (langToggleDesktop) langToggleDesktop.addEventListener("click", () => window.masterToggleLanguage());
    if (langToggleMobile) langToggleMobile.addEventListener("click", () => window.masterToggleLanguage());

    window.updateDynamicContentLanguage = function(nodeToUpdate) {
        updateNodeLanguageTexts(currentLanguage, nodeToUpdate);
    };

    // Initial language setup on page load
    updateNodeLanguageTexts(currentLanguage, document.body);
    setLanguageButtonVisuals();
    console.log(`INFO:Main/LangInit: Initial language set to ${currentLanguage.toUpperCase()}`);


    /* ================================================================
       2) THEME TOGGLE (Desktop & Mobile)
       ================================================================= */
    const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
    const themeToggleMobile  = document.getElementById("theme-toggle-mobile");
    const bodyElement = document.body;
    let currentTheme = localStorage.getItem("theme") || "light";

    function applyTheme(theme) {
        bodyElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        const buttonText = (theme === "light") ? "Dark" : "Light";
        // Use data-attributes for ARIA labels on buttons for translation
        const ariaLabel = (theme === 'light') ?
            (themeToggleDesktop?.dataset?.enLabelDark || "Switch to Dark Theme") :
            (themeToggleDesktop?.dataset?.enLabelLight || "Switch to Light Theme");

        if (themeToggleDesktop) {
            themeToggleDesktop.textContent = buttonText;
            if(ariaLabel) themeToggleDesktop.setAttribute('aria-label', ariaLabel);
        }
        if (themeToggleMobile) {
            themeToggleMobile.textContent = buttonText;
            if(ariaLabel) themeToggleMobile.setAttribute('aria-label', ariaLabel);
        }
        console.log(`INFO:Main/applyTheme: Theme set to ${theme}`);
    }

    window.masterToggleTheme = function(themeToSet) {
        currentTheme = themeToSet ? themeToSet : (bodyElement.getAttribute("data-theme") === "light" ? "dark" : "light");
        applyTheme(currentTheme);
    };

    if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", () => window.masterToggleTheme());
    if (themeToggleMobile) themeToggleMobile.addEventListener("click", () => window.masterToggleTheme());

    // Initial theme application
    applyTheme(currentTheme);


    /* ==================================================================
       3) Right-Side Main Menu: Open/Close (NEW FEATURE)
       ================================================================== */
    const menuOpenBtn = document.getElementById('menu-open');
    const menuCloseBtn = document.getElementById('menu-close');
    const rightSideMenu = document.getElementById('rightSideMenu');

    if (menuOpenBtn && menuCloseBtn && rightSideMenu) {
        menuOpenBtn.addEventListener('click', () => {
            rightSideMenu.classList.add('open');
            console.log('EVENT:Main/menuOpenBtn#click - Right side menu opened.');
        });
        menuCloseBtn.addEventListener('click', () => {
            rightSideMenu.classList.remove('open');
            console.log('EVENT:Main/menuCloseBtn#click - Right side menu closed.');
            const servicesSubMenuInstance = document.getElementById('servicesSubMenu');
            if (servicesSubMenuInstance) servicesSubMenuInstance.classList.remove('open');
        });
    } else {
        // console.warn('WARN:Main/RightSideMenu: Elements for right side menu not found.');
    }

    /* ==================================================================
       4) Services Sub-Menu in Right-Side Menu
       ================================================================== */
    const servicesTriggerBtn = document.querySelector('.services-trigger > button');
    const servicesSubMenu = document.getElementById('servicesSubMenu');

    if (servicesTriggerBtn && servicesSubMenu) {
        servicesTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = servicesSubMenu.classList.toggle('open');
            servicesTriggerBtn.setAttribute('aria-expanded', isOpen.toString());
            console.log(`EVENT:Main/servicesTrigger#click - Services sub-menu toggled ${isOpen ? 'open' : 'closed'}.`);
        });
        document.addEventListener('click', (evt) => {
            if (servicesSubMenu.classList.contains('open')) {
                if (!servicesTriggerBtn.contains(evt.target) && !servicesSubMenu.contains(evt.target)) {
                    servicesSubMenu.classList.remove('open');
                    servicesTriggerBtn.setAttribute('aria-expanded', 'false');
                    console.log('INFO:Main/document#click - Services sub-menu closed via outside click.');
                }
            }
        });
    } else {
        // console.warn('WARN:Main/ServicesSubMenu: Services trigger or sub-menu element not found.');
    }

    /* ==================================================================
       5) Modals (General Logic: Join Us & Contact Us on index.html)
       ================================================================== */
    const modalTriggers = document.querySelectorAll('.floating-icon[data-modal], button[data-modal]');
    const closeModalButtons = document.querySelectorAll('.modal-overlay .close-modal[data-close]');
    const allModalOverlays = document.querySelectorAll('.modal-overlay');

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (event) => {
            const modalId = event.currentTarget.dataset.modal;
            if (!modalId) return;
            const targetModal = document.getElementById(modalId);
            if (targetModal) {
                targetModal.classList.add('active');
                console.log(`EVENT:Main/modalTrigger[data-modal=${modalId}]#click - Modal ${modalId} opened.`);
                const focusableElement = targetModal.querySelector('input:not([type="hidden"]), button, [tabindex="0"], a[href], textarea, select');
                if (focusableElement) focusableElement.focus();
                else targetModal.focus();
            }
        });
    });

    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            const parentModal = event.currentTarget.closest('.modal-overlay');
            if (parentModal) parentModal.classList.remove('active');
        });
    });

    allModalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('active');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) activeModal.classList.remove('active');
        }
    });

    /* ================================================================
       6) Form Submission Logic (DEFERRED to specific component scripts)
          - onguard/js/contact_us.js for #contact-form
          - onguard/js/join_docs/join-us-form.js (via onguard/js/join_us.js) for #joinUsForm
          - The old static #join-form from index.html is no longer used for Join Us.
       ================================================================ */
    console.log('INFO:Main/FormSubmissions: Form submission logic deferred to specific scripts.');

    /* ================================================================
       7) Mobile Services Menu Toggle (for index.html's bottom nav menu)
       ================================================================= */
    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu'); // This is for index.html's menu

    if (mobileServicesToggle && mobileServicesMenu) {
        mobileServicesToggle.addEventListener('click', () => {
            const isOpen = mobileServicesMenu.classList.toggle('active');
            mobileServicesToggle.setAttribute('aria-expanded', isOpen.toString());
        });
        // Click outside to close for this specific mobile services menu
        document.addEventListener('click', (event) => {
            if (mobileServicesMenu.classList.contains('active')) {
                if (!mobileServicesMenu.contains(event.target) && !mobileServicesToggle.contains(event.target)) {
                    mobileServicesMenu.classList.remove('active');
                    mobileServicesToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    } else {
        // console.warn('WARN:Main/MobileServicesMenu: index.html mobile services toggle/menu not found.');
    }

    /* ================================================================
       8) Service Worker Registration
       ================================================================= */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js') // Assuming SW is at root of onguard/
                .then(reg => console.log('INFO:Main/ServiceWorker: Registered. Scope:', reg.scope))
                .catch(err => console.error('ERROR:Main/ServiceWorker: Registration failed:', err));
        });
    } else {
        console.warn('WARN:Main/ServiceWorker: Not supported in this browser.');
    }

    console.log('INFO:Main/DOMContentLoaded: All core initializations complete.');
});

/**
 * Basic input sanitization for client-side use.
 * WARNING: This is NOT a comprehensive XSS filter. Use server-side validation and a library like DOMPurify for robust protection.
 * @param {string} inputString The string to sanitize.
 * @returns {string} The sanitized string or original input if not a string.
 */
window.sanitizeInput = function(inputString) {
    if (typeof inputString !== 'string') return inputString;
    let sanitized = inputString;
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, "");
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^>\s]+)/gi, "");
    sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s]+/gi, "href=\"#\"");
    const PII_PATTERNS = [
        /\b\d{3}-\d{2}-\d{4}\b/g,
        /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})\b/g,
    ];
    PII_PATTERNS.forEach(pattern => {
        sanitized = sanitized.replace(pattern, '[REDACTED PII]');
    });
    if (inputString !== sanitized) {
        console.warn("WARN:sanitizeInput: Input modified for security/PII.");
    }
    return sanitized;
};
