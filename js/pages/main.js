/*****************************************************
 * main.js
 * Handles language switching, theme toggles, modals,
 * new side menu, mobile services menu (for index.html),
 * and Service Worker registration.
 *****************************************************/

document.addEventListener("DOMContentLoaded", () => {
    console.log('INFO:Main/DOMContentLoaded: Initializing core functionalities.');

    /* ================================================================
       1) LANGUAGE TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    let currentLanguage = localStorage.getItem("language") || "en";

    const langToggleDesktop = document.getElementById("language-toggle-desktop");
    const langToggleMobile  = document.getElementById("language-toggle-mobile");

    function updateNodeLanguageTexts(lang, parentNode = document.body) {
        if (!parentNode) {
            console.warn("WARN:Main/updateNodeLanguageTexts: parentNode is null for lang", lang);
            return;
        }
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
            } else if (el.value !== undefined && (el.tagName === 'INPUT' || el.tagName === 'BUTTON') && !el.classList.contains('lang-toggle-btn')) { // Avoid changing lang toggle button text here
                if (textToSet !== undefined) el.value = textToSet;
            } else if (el.tagName !== 'BUTTON' || !el.classList.contains('lang-toggle-btn')) { // Avoid changing lang toggle button text here
                let hasNonTextChildNodes = false;
                for(let i=0; i < el.childNodes.length; i++) {
                    if(el.childNodes[i].nodeType !== Node.TEXT_NODE && el.childNodes[i].nodeName !== 'I' /* Allow FontAwesome icons */) {
                        hasNonTextChildNodes = true; break;
                    }
                }
                if (!hasNonTextChildNodes || el.childNodes.length === 0 || (el.childNodes.length === 1 && el.childNodes[0].nodeName === 'I')) {
                    if (textToSet !== undefined) {
                        // Preserve icon if present
                        const icon = el.querySelector('i.fas, i.fab, i.far');
                        if (icon) {
                            el.innerHTML = textToSet + ' ' + icon.outerHTML;
                        } else {
                            el.textContent = textToSet;
                        }
                    }
                }
            }

            const ariaLabelText = el.dataset[targetLang + 'Label'] || el.dataset[fallbackLang + 'Label'];
            if (ariaLabelText) el.setAttribute('aria-label', ariaLabelText);

            const titleText = el.dataset[targetLang + 'Title'] || el.dataset[fallbackLang + 'Title'];
            if (titleText) el.setAttribute('title', titleText);
        });
    }

    function setLanguageButtonVisuals() {
        const newButtonText = (currentLanguage === "en") ? "ES" : "EN";
        // ARIA labels for global toggles should ideally have data-attributes themselves for full translation
        const newAriaLabel = (currentLanguage === "en") ?
                             (langToggleDesktop?.dataset?.esLabel || "Switch to Spanish") :
                             (langToggleDesktop?.dataset?.enLabel || "Switch to English");

        if (langToggleDesktop) {
            langToggleDesktop.textContent = newButtonText;
            if(newAriaLabel) langToggleDesktop.setAttribute('aria-label', newAriaLabel);
        }
        if (langToggleMobile) {
            // If mobile button has a span for text, target it, otherwise the button itself
            const mobileTextElement = langToggleMobile.querySelector("span") || langToggleMobile;
            mobileTextElement.textContent = newButtonText;
            if(newAriaLabel) langToggleMobile.setAttribute('aria-label', newAriaLabel);
        }
    }

    window.masterToggleLanguage = function(langToSet) {
        const newLang = langToSet ? langToSet : (currentLanguage === "en" ? "es" : "en");
        if (newLang !== currentLanguage) {
            currentLanguage = newLang;
            localStorage.setItem("language", currentLanguage);
            updateNodeLanguageTexts(currentLanguage, document.body);
            setLanguageButtonVisuals(); // Updates global toggle buttons
            console.log(`INFO:Main/masterToggleLanguage: Language changed to ${currentLanguage.toUpperCase()}`);
        }
    };
    if (langToggleDesktop) langToggleDesktop.addEventListener("click", () => window.masterToggleLanguage());
    if (langToggleMobile) langToggleMobile.addEventListener("click", () => window.masterToggleLanguage());

    window.updateDynamicContentLanguage = function(nodeToUpdate) {
        if (nodeToUpdate) {
            updateNodeLanguageTexts(currentLanguage, nodeToUpdate);
        }
    };

    // Initial language setup on page load
    updateNodeLanguageTexts(currentLanguage, document.body);
    setLanguageButtonVisuals();
    console.log(`INFO:Main/LangInit: Initial language set to ${currentLanguage.toUpperCase()}`);
    /* ================================================================
       2) THEME TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
    const themeToggleMobile  = document.getElementById("theme-toggle-mobile");
    const bodyElement = document.body;
    let currentTheme = localStorage.getItem("theme") || "light";

    function applyTheme(theme) {
        bodyElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        const buttonText = (theme === "light") ? "Dark" : "Light";
        const ariaLabel = (theme === 'light') ?
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelDark'] || themeToggleDesktop?.dataset['enLabelDark'] || "Switch to Dark Theme") :
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelLight'] || themeToggleDesktop?.dataset['enLabelLight'] || "Switch to Light Theme");
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
        const newTheme = themeToSet ? themeToSet : (bodyElement.getAttribute("data-theme") === "light" ? "dark" : "light");
        if (newTheme !== currentTheme) {
            currentTheme = newTheme;
            applyTheme(currentTheme);
        }
    };

    if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", () => window.masterToggleTheme());
    if (themeToggleMobile) themeToggleMobile.addEventListener("click", () => window.masterToggleTheme());
    applyTheme(currentTheme); // Initial theme application
   /* ==================================================================
       3) Right-Side Main Menu (for index.html)
       ================================================================== */
    const menuOpenBtn = document.getElementById('menu-open');
    const menuCloseBtn = document.getElementById('menu-close');
    const rightSideMenu = document.getElementById('rightSideMenu');
    if (menuOpenBtn && rightSideMenu) { // menuCloseBtn is inside rightSideMenu
        menuOpenBtn.addEventListener('click', () => {
            rightSideMenu.classList.add('open');
            menuOpenBtn.setAttribute('aria-expanded', 'true');
            if(menuCloseBtn) menuCloseBtn.focus(); // Focus on close button when menu opens
            console.log('EVENT:Main/menuOpenBtn#click - Right side menu opened.');
        });
    }
    if (menuCloseBtn && rightSideMenu) {
        menuCloseBtn.addEventListener('click', () => {
            rightSideMenu.classList.remove('open');
            if(menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'false');
            if(menuOpenBtn) menuOpenBtn.focus(); // Return focus to menu trigger
            console.log('EVENT:Main/menuCloseBtn#click - Right side menu closed.');
            const servicesSubMenuInstance = document.getElementById('servicesSubMenu');
            if (servicesSubMenuInstance) servicesSubMenuInstance.classList.remove('open');
            const servicesTriggerBtnInstance = document.querySelector('.services-trigger > button');
            if(servicesTriggerBtnInstance) servicesTriggerBtnInstance.setAttribute('aria-expanded', 'false');
        });
    }
    // Add ESC key to close side menu
    if(rightSideMenu){
        rightSideMenu.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && rightSideMenu.classList.contains('open')) {
                rightSideMenu.classList.remove('open');
                if(menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'false');
                if(menuOpenBtn) menuOpenBtn.focus();
            }
        });
    }

    /* ==================================================================
       4) Services Sub-Menu in Right-Side Menu (for index.html)
       ================================================================== */
    const servicesTriggerBtn = document.querySelector('#rightSideMenu .services-trigger > button');
    const servicesSubMenu = document.getElementById('servicesSubMenu');

    if (servicesTriggerBtn && servicesSubMenu) {
        servicesTriggerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = servicesSubMenu.classList.toggle('open');
            servicesTriggerBtn.setAttribute('aria-expanded', isOpen.toString());
        });
        // Click outside to close services sub-menu (within the rightSideMenu)
        // This is handled by the main menu close button logic for now.
    }

    /* ==================================================================
       5) Modals (General Logic for index.html: Contact Us)
          Join Us is now a separate page. Chatbot uses iframe system.
       ================================================================== */
    const modalTriggers = document.querySelectorAll('.floating-icon[data-modal], button[data-modal]');
    // Note: closeModalButtons and allModalOverlays will be queried dynamically after modal content is loaded.
    let lastFocusedElement = null; // To store element that triggered modal
    let loadedModalHTML = {}; // Cache for loaded modal HTML to prevent multiple fetches

    async function loadModalContent(modalId, modalFile, placeholderId, callback) {
        const placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            console.error(`ERROR:Main/loadModalContent: Placeholder not found: #${placeholderId}`);
            return null;
        }

        if (!loadedModalHTML[modalId]) {
            try {
                const response = await fetch(modalFile);
                if (!response.ok) throw new Error(`Failed to fetch ${modalFile}: ${response.statusText}`);
                const html = await response.text();
                loadedModalHTML[modalId] = html;
                placeholder.innerHTML = html;
                console.log(`INFO:Main/loadModalContent: ${modalId} HTML loaded into #${placeholderId}`);
            } catch (error) {
                console.error(`ERROR:Main/loadModalContent: Could not load modal content for ${modalId}:`, error);
                placeholder.innerHTML = `<p>Error loading modal content. Please try again later.</p>`;
                return null;
            }
        } else {
             // Ensure the HTML is in the placeholder if it was loaded but placeholder was cleared (e.g. SPA navigation)
            if (placeholder.innerHTML.trim() === "") {
                placeholder.innerHTML = loadedModalHTML[modalId];
            }
        }

        const targetModalElement = document.getElementById(modalId); // Get the actual modal element from the loaded HTML
        if (!targetModalElement) {
            console.error(`ERROR:Main/loadModalContent: Modal element #${modalId} not found after loading HTML.`);
            return null;
        }

        // Initialize modal-specific JS if a callback is provided
        if (callback && typeof callback === 'function') {
            // Check if already initialized to prevent multiple initializations if modal is re-shown
            if (!targetModalElement.dataset.initialized) {
                callback(targetModalElement);
                targetModalElement.dataset.initialized = "true";
            }
        }

        // Attach close listeners for this specific modal (if not already attached by a global listener)
        // This is important if modals are loaded dynamically.
        const closeButtons = targetModalElement.querySelectorAll('.close-modal[data-close]');
        closeButtons.forEach(btn => {
            // Prevent multiple listeners if modal is re-shown
            if (!btn.dataset.closeListenerAttached) {
                btn.addEventListener('click', () => closeModal(targetModalElement));
                btn.dataset.closeListenerAttached = "true";
            }
        });

        // Backdrop click for this specific modal
        if (!targetModalElement.dataset.backdropListenerAttached) {
            targetModalElement.addEventListener('click', (e) => {
                if (e.target === targetModalElement) closeModal(targetModalElement);
            });
            targetModalElement.dataset.backdropListenerAttached = "true";
        }


        return targetModalElement;
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', async (event) => {
            lastFocusedElement = event.currentTarget;
            const modalId = event.currentTarget.dataset.modal;
            if (!modalId) return;

            let targetModal;

            if (modalId === 'contact-modal') { // Existing static modal
                targetModal = document.getElementById(modalId);
            } else if (modalId === 'join-us-modal') {
                targetModal = await loadModalContent(
                    modalId,
                    '../html/modals/join_us_modal.html',
                    'join-us-modal-placeholder',
                    typeof initializeJoinUsModal === 'function' ? initializeJoinUsModal : null
                );
            } else if (modalId === 'chatbot-modal') {
                targetModal = await loadModalContent(
                    modalId,
                    '../html/modals/chatbot_modal.html',
                    'chatbot-modal-placeholder',
                    typeof initializeChatbotModal === 'function' ? initializeChatbotModal : null
                );
            }
            // Add other dynamic modals here with else if (modalId === 'another-modal') { ... }

            if (targetModal) {
                targetModal.classList.add('active');
                // Update language for the newly loaded/shown modal
                if (window.updateDynamicContentLanguage) {
                    window.updateDynamicContentLanguage(targetModal);
                }
                setupFocusTrap(targetModal); // Setup focus trap
                const focusableElement = targetModal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select');
                if (focusableElement) focusableElement.focus();
                else targetModal.focus(); // Fallback to focusing the modal itself
            }
        });
    });

    let currentTrapHandler = null; // To store the current active trap handler

    function setupFocusTrap(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        // Remove previous trap handler if any
        if (currentTrapHandler) {
            document.removeEventListener('keydown', currentTrapHandler);
        }

        currentTrapHandler = function(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        };
        document.addEventListener('keydown', currentTrapHandler);
    }

    function removeFocusTrap() {
        if (currentTrapHandler) {
            document.removeEventListener('keydown', currentTrapHandler);
            currentTrapHandler = null;
        }
    }

    // Global ESC key listener for any active modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                // Directly use the generalized closeModal function
                closeModal(activeModal);
            }
        }
    });

    // Enhanced close function for modals to also remove focus trap
    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('active');
            removeFocusTrap();
            if (lastFocusedElement) lastFocusedElement.focus();
        }
    }

    // Close buttons for statically loaded modals (like contact-modal)
    document.querySelectorAll('#contact-modal .close-modal[data-close]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const parentModal = event.currentTarget.closest('.modal-overlay');
            closeModal(parentModal);
        });
    });

    // Backdrop click for statically loaded modals
    document.querySelectorAll('#contact-modal.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // Update dynamic modal close logic in loadModalContent to use closeModal
    // Modify the close button event listener inside loadModalContent:
    // btn.addEventListener('click', () => closeModal(targetModalElement));
    // Modify the backdrop click listener inside loadModalContent:
    // targetModalElement.addEventListener('click', (e) => { if (e.target === targetModalElement) closeModal(targetModalElement); });
    // This requires passing closeModal to loadModalContent or making it globally accessible if not already.
    // For simplicity, the change will be directly in loadModalContent for now.
    // The following is a conceptual note for the diff that will be generated next for loadModalContent:
    // Search for: targetModalElement.classList.remove('active');
    // Replace with: closeModal(targetModalElement);
    // This will be done in the subsequent diff for js/main.js.

    /* ================================================================
       6) Form Submission Logic (DEFERRED to specific component scripts)
       ================================================================ */
    console.log('INFO:Main/FormSubmissions: Form submission logic deferred to specific scripts like contact_us.js and join_us.js.');
    /* ================================================================
       7) Mobile Services Menu Toggle (for index.html's bottom nav menu)
       ================================================================= */
    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');
    if (mobileServicesToggle && mobileServicesMenu) {
        mobileServicesToggle.addEventListener('click', () => {
            const isOpen = mobileServicesMenu.classList.toggle('active');
            mobileServicesToggle.setAttribute('aria-expanded', isOpen.toString());
        });
        document.addEventListener('click', (event) => {
            if (mobileServicesMenu.classList.contains('active')) {
                if (!mobileServicesMenu.contains(event.target) && !mobileServicesToggle.contains(event.target)) {
                    mobileServicesMenu.classList.remove('active');
                    mobileServicesToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    /* ================================================================
       8) Service Worker Registration
       ================================================================= */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
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
    // Basic script tag removal
    sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, "");
    // Basic on-event attribute removal
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*(".*?"|'.*?'|[^>\s]+)/gi, "");
    // Basic javascript: href removal
    sanitized = sanitized.replace(/href\s*=\s*["']?\s*javascript:[^"'\s]+/gi, "href=\"#\"");

    // PII Patterns (examples, can be expanded or made more precise)
    const PII_PATTERNS = [
        /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
        // More specific credit card regex from before
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
// Expose global toggle functions if needed by other scripts (like join_us.js for its own toggles)
// This is a simple way; modules or custom events would be more robust for larger apps.
// window.masterToggleLanguage = toggleLanguage; // `toggleLanguage` is not in this scope anymore, it was part of the old main.js structure
// window.masterToggleTheme = toggleThemeOnClick; // `toggleThemeOnClick` is not in this scope anymore
// The language and theme toggles are now self-contained within the main DOMContentLoaded listener.
// `window.updateDynamicContentLanguage` is already exposed for dynamic content.

