/*****************************************************
 * main.js
 * Handles language switching, theme toggles, modals,
 * new side menu, mobile services menu (for index.html),
 * and Service Worker registration.
 *****************************************************/

import { sanitizeInput } from '../utils/sanitize.js';
import { ROOT_PATH } from '../utils/rootPath.js';

document.addEventListener("DOMContentLoaded", () => {
    console.log('INFO:Main/DOMContentLoaded: Initializing core functionalities.');

    // Enable body padding adjustment for pages with a mobile nav
    function updateMobileNavStatus() {
        const mobileNavElement = document.querySelector('.mobile-nav');
        if (mobileNavElement) {
            document.body.classList.add('mobile-nav-active');
        } else {
            document.body.classList.remove('mobile-nav-active');
        }
    }
    updateMobileNavStatus();

    /* ================================================================
       1) LANGUAGE TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    let currentLanguage = localStorage.getItem("language") || "en";

    const langToggleDesktop = document.getElementById("language-toggle-desktop");
    // Correct ID for the mobile language toggle
    const langToggleMobile  = document.getElementById("mobile-language-toggle");

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
    let lastFocusedElement = null; // To store element that triggered modal
    // Note: closeModalButtons and allModalOverlays will be queried dynamically after modal content is loaded.
    let loadedModalHTML = {}; // Cache for loaded modal HTML to prevent multiple fetches

    const serviceModalConfig = {
        'business-operations.html': {
            id: 'business-operations-modal',
            file: '/html/modals/business_operations_modal.html',
            placeholder: 'business-operations-modal-placeholder'
        },
        'contact-center.html': {
            id: 'contact-center-modal',
            file: '/html/modals/contact_center_modal.html',
            placeholder: 'contact-center-modal-placeholder'
        },
        'it-support.html': {
            id: 'it-support-modal',
            file: '/html/modals/it_support_modal.html',
            placeholder: 'it-support-modal-placeholder'
        },
        'professionals.html': {
            id: 'professionals-modal',
            file: '/html/modals/professionals_modal.html',
            placeholder: 'professionals-modal-placeholder'
        }
    };

    async function loadModalContent(modalId, modalFile, placeholderId, callback) {
        let placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            // Create the placeholder dynamically if it doesn't exist
            placeholder = document.createElement('div');
            placeholder.id = placeholderId;
            document.body.appendChild(placeholder);
        }

        if (!loadedModalHTML[modalId]) {
            try {
                console.log(`INFO:Main/loadModalContent: Fetching ${modalFile}`);
                const response = await fetch(modalFile);
                if (!response.ok) {
                    console.error(`ERROR:Main/loadModalContent: Fetch failed with status ${response.status} for ${response.url}`);
                    throw new Error(`Failed to fetch ${modalFile}: ${response.statusText}`);
                }
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

    async function openModalById(modalId) {
        if (!modalId) return null;
        let targetModal;
        if (modalId === 'contact-modal') {
            targetModal = document.getElementById(modalId);
        } else if (modalId === 'join-us-modal') {
            targetModal = await loadModalContent(
                modalId,
                `${ROOT_PATH}html/modals/join_us_modal.html`,
                'join-us-modal-placeholder',
                typeof initializeJoinUsModal === 'function' ? initializeJoinUsModal : null
            );
        } else if (modalId === 'chatbot-modal') {
            targetModal = await loadModalContent(
                modalId,
                `${ROOT_PATH}html/modals/chatbot_modal.html`,
                'chatbot-modal-placeholder',
                typeof initializeChatbotModal === 'function' ? initializeChatbotModal : null
            );
        }
        // Add other dynamic modals here with else if

        if (targetModal) {
            targetModal.classList.add('active');
            if (window.updateDynamicContentLanguage) {
                window.updateDynamicContentLanguage(targetModal);
            }
            setupFocusTrap(targetModal);
            const focusableElement = targetModal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select');
            if (focusableElement) focusableElement.focus();
            else targetModal.focus();
        }
        return targetModal;
    }

    document.addEventListener('click', async (event) => {
        const trigger = event.target.closest('[data-modal]');
        if (trigger) {
            event.preventDefault();
            lastFocusedElement = trigger;
            const modalId = trigger.dataset.modal;
            await openModalById(modalId);
            return;
        }
    });

    window.openModalById = openModalById;

    document.addEventListener('click', async (e) => {
        const anchor = e.target.closest('a[href]');
        if (!anchor) return;
        const url = new URL(anchor.getAttribute('href'), document.baseURI);
        const configKey = Object.keys(serviceModalConfig).find(k => url.pathname.endsWith(k));
        if (!configKey) return;
        e.preventDefault();
        lastFocusedElement = anchor;
        const cfg = serviceModalConfig[configKey];
        const modal = await loadModalContent(cfg.id, cfg.file, cfg.placeholder, null);
        if (modal) {
            modal.classList.add('active');
            if (window.updateDynamicContentLanguage) {
                window.updateDynamicContentLanguage(modal);
            }
            setupFocusTrap(modal);
            const focusable = modal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select');
            if (focusable) focusable.focus();
            else modal.focus();
        }
    });

    // Preload Join Us modal to ensure it is ready when FAB is clicked
    loadModalContent(
        'join-us-modal',
        `${ROOT_PATH}html/modals/join_us_modal.html`,
        'join-us-modal-placeholder',
        typeof initializeJoinUsModal === 'function' ? initializeJoinUsModal : null
    ).catch(err => console.error('ERROR:Main/JoinUsPreload:', err));
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
            navigator.serviceWorker.register(`${ROOT_PATH}js/service-worker.js`)
                .then(reg => console.log('INFO:Main/ServiceWorker: Registered. Scope:', reg.scope))
                .catch(err => console.error('ERROR:Main/ServiceWorker: Registration failed:', err));
        });
    } else {
        console.warn('WARN:Main/ServiceWorker: Not supported in this browser.');
    }

    console.log('INFO:Main/DOMContentLoaded: All core initializations complete.');
});

// Expose global toggle functions if needed by other scripts (like join_us.js for its own toggles)
// This is a simple way; modules or custom events would be more robust for larger apps.
// window.masterToggleLanguage = toggleLanguage; // `toggleLanguage` is not in this scope anymore, it was part of the old main.js structure
// window.masterToggleTheme = toggleThemeOnClick; // `toggleThemeOnClick` is not in this scope anymore
// The language and theme toggles are now self-contained within the main DOMContentLoaded listener.
// `window.updateDynamicContentLanguage` is already exposed for dynamic content.

