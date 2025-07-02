/*****************************************************
 * main.js
 * Handles language switching, theme toggles, modals,
 * new side menu, mobile services menu (for index.html),
 * and Service Worker registration.
 *****************************************************/

import { sanitizeInput } from '../utils/sanitize.js';
import { ROOT_PATH } from '../utils/rootPath.js';
import { initializeJoinUsModal } from './join_us.js';
import { initializeContactModal } from './contact_us.js';
import { initializeChatbotModal } from './chatbot.js'; // Import initializeChatbotModal

document.addEventListener("DOMContentLoaded", () => {
    console.log('INFO:Main/DOMContentLoaded: Initializing core functionalities.');

    // Function to add padding for fixed mobile nav
    function updateMobileNavStatus() {
        const mobileNavElement = document.querySelector('.mobile-nav');
        if (mobileNavElement && getComputedStyle(mobileNavElement).display !== 'none') {
            document.body.classList.add('mobile-nav-active');
            console.log('INFO:Main/updateMobileNavStatus: Mobile nav active, body padding applied.');
        } else {
            document.body.classList.remove('mobile-nav-active');
            console.log('INFO:Main/updateMobileNavStatus: Mobile nav not active or not present, body padding removed.');
        }
    }

    // Placeholder for mobile navigation HTML injection
    const mobileNavPlaceholder = document.getElementById('mobile-nav-placeholder');

    async function loadMobileNavigation() {
        try {
            const response = await fetch(`${ROOT_PATH}html/partials/mobile_nav.html`);
            if (!response.ok) {
                throw new Error(`Failed to fetch mobile_nav.html: ${response.statusText}`);
            }
            let html = await response.text();

            // Correct href paths using ROOT_PATH
            html = html.replace(/href="html\//g, `href="${ROOT_PATH}html/`);
            html = html.replace(/href="index\.html"/g, `href="${ROOT_PATH}index.html"`);

            if (mobileNavPlaceholder) {
                mobileNavPlaceholder.innerHTML = html;
            } else {
                // Fallback if placeholder is missing, append to body
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                while (tempDiv.firstChild) {
                    document.body.appendChild(tempDiv.firstChild);
                }
            }
            console.log('INFO:Main/loadMobileNavigation: Mobile navigation HTML loaded and injected.');
            return true;
        } catch (error) {
            console.error('ERROR:Main/loadMobileNavigation:', error);
            return false;
        }
    }

    function initializeMobileNavInteractions() {
        // Mobile Services Menu Toggle (for index.html's bottom nav menu)
        const mobileServicesToggle = document.getElementById('mobile-services-toggle');
        const mobileServicesMenu = document.getElementById('mobile-services-menu');
        if (mobileServicesToggle && mobileServicesMenu) {
            mobileServicesToggle.addEventListener('click', () => {
                const isOpen = mobileServicesMenu.classList.toggle('active');
                mobileServicesToggle.setAttribute('aria-expanded', isOpen.toString());
                mobileServicesMenu.setAttribute('aria-hidden', (!isOpen).toString());
            });
            document.addEventListener('click', (event) => {
                if (mobileServicesMenu.classList.contains('active')) {
                    if (!mobileServicesMenu.contains(event.target) && !mobileServicesToggle.contains(event.target)) {
                        mobileServicesMenu.classList.remove('active');
                        mobileServicesToggle.setAttribute('aria-expanded', 'false');
                        mobileServicesMenu.setAttribute('aria-hidden', 'true');
                    }
                }
            });
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile services menu initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile services toggle/menu not found.');
        }

        // Mobile Language Toggle (re-query after injection)
        const langToggleMobile = document.getElementById("mobile-language-toggle");
        if (langToggleMobile) {
            langToggleMobile.addEventListener("click", () => window.masterToggleLanguage());
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile language toggle initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile language toggle not found.');
        }

        // Mobile Theme Toggle (re-query after injection)
        const themeToggleMobile = document.getElementById("mobile-theme-toggle");
        if (themeToggleMobile) {
            themeToggleMobile.addEventListener("click", () => window.masterToggleTheme());
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile theme toggle initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile theme toggle not found.');
        }

        // Ensure mobile chat launcher is interactive if present
        const mobileChatLauncher = document.getElementById('mobileChatLauncher');
        if (mobileChatLauncher) {
            mobileChatLauncher.addEventListener('click', async (event) => {
                event.stopPropagation(); // Prevent event from bubbling to global document listener
                const trigger = event.currentTarget;
                if (trigger && trigger.dataset.modal) {
                    event.preventDefault();
                    const modalId = trigger.dataset.modal;
                    const modalElement = document.getElementById(modalId);
                    if (modalElement && modalElement.classList.contains('active')) {
                        closeModal(modalElement);
                    } else {
                        lastFocusedElement = trigger;
                        await openModalById(modalId);
                    }
                }
            });
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile chat launcher initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile chat launcher not found.');
        }

        // Mobile Contact Us Launcher
        const mobileContactUsLauncher = document.getElementById('mobileContactUsLauncher');
        if (mobileContactUsLauncher) {
            mobileContactUsLauncher.addEventListener('click', async (event) => {
                event.stopPropagation(); // Prevent event from bubbling to global document listener
                const trigger = event.currentTarget;
                if (trigger && trigger.dataset.modal) {
                    event.preventDefault();
                    const modalId = trigger.dataset.modal;
                    const modalElement = document.getElementById(modalId);
                    if (modalElement && modalElement.classList.contains('active')) {
                        closeModal(modalElement);
                    } else {
                        lastFocusedElement = trigger;
                        await openModalById(modalId);
                    }
                }
            });
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile Contact Us launcher initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile Contact Us launcher not found.');
        }

        // Mobile Join Us Launcher
        const mobileJoinUsLauncher = document.getElementById('mobileJoinUsLauncher');
        if (mobileJoinUsLauncher) {
            mobileJoinUsLauncher.addEventListener('click', async (event) => {
                event.stopPropagation(); // Prevent event from bubbling to global document listener
                const trigger = event.currentTarget;
                if (trigger && trigger.dataset.modal) {
                    event.preventDefault();
                    const modalId = trigger.dataset.modal;
                    const modalElement = document.getElementById(modalId);
                    if (modalElement && modalElement.classList.contains('active')) {
                        closeModal(modalElement);
                    } else {
                        lastFocusedElement = trigger;
                        await openModalById(modalId);
                    }
                }
            });
            console.log('INFO:Main/initializeMobileNavInteractions: Mobile Join Us launcher initialized.');
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile Join Us launcher not found.');
        }
    }

    // Dynamically set the Home link in the rightSideMenu
    const homeLinkRightSideMenu = document.querySelector("#rightSideMenu .right-side-menu-nav a[href='../index.html']");
    if (homeLinkRightSideMenu) {
        homeLinkRightSideMenu.href = ROOT_PATH + "index.html";
        console.log('INFO:Main/HomeLinkUpdate: Updated rightSideMenu Home link to:', homeLinkRightSideMenu.href);
    }


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

    function updateHeadLanguageTexts(lang) {
        const headElements = document.head.querySelectorAll('[data-en], [data-es], [data-en-content], [data-es-content]');
        headElements.forEach(el => {
            const targetLang = lang;
            const fallbackLang = 'en';
            if (el.tagName === 'TITLE') {
                const text = el.dataset[targetLang] || el.dataset[fallbackLang];
                if (text !== undefined) el.textContent = text;
            } else if (el.tagName === 'META' && el.getAttribute('name') === 'description') {
                const contentText = el.dataset[targetLang + 'Content'] || el.dataset[fallbackLang + 'Content'];
                if (contentText !== undefined) el.setAttribute('content', contentText);
            }
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
            updateHeadLanguageTexts(currentLanguage);
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

    // Initial language setup on page load (will be reapplied/scoped after mobile nav load)
    updateNodeLanguageTexts(currentLanguage, document.body); // Initial full-page scan
    updateHeadLanguageTexts(currentLanguage);
    setLanguageButtonVisuals(); // For desktop buttons primarily at this stage
    console.log(`INFO:Main/LangInit: Initial language set to ${currentLanguage.toUpperCase()}`);

    /* ================================================================
       2) THEME TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
    // const themeToggleMobile  = document.getElementById("theme-toggle-mobile"); // Will be handled in initializeMobileNavInteractions
    const bodyElement = document.body;
    let currentTheme = localStorage.getItem("theme") || "light";

    function applyTheme(theme) {
        bodyElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        const buttonText = (theme === "light") ?
            (themeToggleDesktop?.dataset[currentLanguage + 'Dark'] || (currentLanguage === 'es' ? 'Oscuro' : 'Dark')) :
            (themeToggleDesktop?.dataset[currentLanguage + 'Light'] || (currentLanguage === 'es' ? 'Claro' : 'Light'));

        // Update desktop toggle
        const desktopAriaLabel = (theme === 'light') ?
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelDark'] || themeToggleDesktop?.dataset['enLabelDark'] || "Switch to Dark Theme") :
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelLight'] || themeToggleDesktop?.dataset['enLabelLight'] || "Switch to Light Theme");
        if (themeToggleDesktop) {
            themeToggleDesktop.textContent = buttonText;
            if(desktopAriaLabel) themeToggleDesktop.setAttribute('aria-label', desktopAriaLabel);
        }

        // Update mobile toggle (if it exists)
        const mobileThemeToggle = document.getElementById("mobile-theme-toggle");
        const mobileAriaLabel = (theme === 'light') ?
            (mobileThemeToggle?.dataset[currentLanguage + 'LabelDark'] || mobileThemeToggle?.dataset['enLabelDark'] || "Switch to Dark Theme") :
            (mobileThemeToggle?.dataset[currentLanguage + 'LabelLight'] || mobileThemeToggle?.dataset['enLabelLight'] || "Switch to Light Theme");
        const mobileText = (theme === 'light') ?
            (mobileThemeToggle?.dataset[currentLanguage + 'Dark'] || buttonText) :
            (mobileThemeToggle?.dataset[currentLanguage + 'Light'] || buttonText);
        if (mobileThemeToggle) {
            mobileThemeToggle.textContent = mobileText;
             if(mobileAriaLabel) mobileThemeToggle.setAttribute('aria-label', mobileAriaLabel);
        }
        console.log(`INFO:Main/applyTheme: Theme set to ${theme}`);
    }

    window.masterToggleTheme = function(themeToSet) {
        const newTheme = themeToSet ? themeToSet : (bodyElement.getAttribute("data-theme") === "light" ? "dark" : "light");
        if (newTheme !== currentTheme) {
            currentTheme = newTheme;
            applyTheme(currentTheme); // This will update both desktop and mobile if they exist
        }
    };

    if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", () => window.masterToggleTheme());
    // if (themeToggleMobile) themeToggleMobile.addEventListener("click", () => window.masterToggleTheme()); // Handled in initializeMobileNavInteractions
    applyTheme(currentTheme); // Initial theme application for desktop and potentially pre-existing mobile
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

    // Configuration for specific service modals
    const serviceModalDetails = {
        'business-operations-service-modal': {
            contentPath: `${ROOT_PATH}html/partials/services/business_operations_content.html`,
            titleKeyEn: 'Business Operations',
            titleKeyEs: 'Operaciones Empresariales'
        },
        'contact-center-service-modal': {
            contentPath: `${ROOT_PATH}html/partials/services/contact_center_content.html`,
            titleKeyEn: 'Contact Center',
            titleKeyEs: 'Centro de Contacto'
        },
        'it-support-service-modal': {
            contentPath: `${ROOT_PATH}html/partials/services/it_support_content.html`,
            titleKeyEn: 'IT Support',
            titleKeyEs: 'Soporte IT'
        },
        'professionals-service-modal': {
            contentPath: `${ROOT_PATH}html/partials/services/professionals_content.html`,
            titleKeyEn: 'Professionals',
            titleKeyEs: 'Profesionales'
        }
    };

    async function initializeServiceModalContent(modalElement, serviceContentPath, serviceTitleEn, serviceTitleEs) {
        const contentContainer = modalElement.querySelector('.service-modal-body-content');
        const titleElement = modalElement.querySelector('#service-modal-title');

        if (!contentContainer || !titleElement) {
            console.error('ERROR:Main/initializeServiceModalContent: Modal content or title container not found in generic service modal structure.');
            modalElement.querySelector('.modal-body').innerHTML = '<p>Error: Modal structure is missing critical elements.</p>'; // Fallback
            return;
        }

        try {
            console.log(`INFO:Main/initializeServiceModalContent: Fetching content from ${serviceContentPath}`);
            const response = await fetch(serviceContentPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch service content: ${response.statusText} from ${serviceContentPath}`);
            }
            const contentHtml = await response.text();
            contentContainer.innerHTML = contentHtml;

            const titleToSet = (currentLanguage === 'es' && serviceTitleEs) ? serviceTitleEs : serviceTitleEn;
            titleElement.textContent = titleToSet;
            titleElement.dataset.en = serviceTitleEn; // For language switching of the title
            titleElement.dataset.es = serviceTitleEs;

            if (window.updateDynamicContentLanguage) {
                window.updateDynamicContentLanguage(contentContainer); // Translate the newly injected content
                window.updateDynamicContentLanguage(titleElement.parentElement); // Translate the title element itself if it's wrapped
            }
            console.log(`INFO:Main/initializeServiceModalContent: Content loaded for ${serviceContentPath} into modal.`);
        } catch (error) {
            console.error('ERROR:Main/initializeServiceModalContent:', error);
            contentContainer.innerHTML = `<p>Error loading service content. Please try again later.</p>`;
            titleElement.textContent = 'Error';
        }
    }


    async function loadModalContent(modalId, modalFile, placeholderId, callback, callbackArgs = []) {
        let placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            // Create the placeholder dynamically if it doesn't exist
            placeholder = document.createElement('div');
            placeholder.id = placeholderId;
            document.body.appendChild(placeholder);
        }

        // For generic modals, we don't cache the combined shell + content,
        // so we always fetch the shell if it's a generic type unless the shell itself is already loaded.
        // Specific modals like contact-us are cached by their unique modalId.
        const isGenericServiceModal = modalId === 'generic-service-modal';
        let loadShell = true;
        if (isGenericServiceModal) {
            // If the generic modal shell is already in the placeholder, don't reload it,
            // just ensure it's the one we're working with.
            const existingShell = document.getElementById('generic-service-modal');
            if (placeholder.contains(existingShell)) { // Check if placeholder already has this specific modal
                 // We might still want to run the callback to repopulate content
            } else {
                 // placeholder is empty or has wrong content, clear it
                 placeholder.innerHTML = '';
            }
             // If loadedModalHTML[modalId] (e.g. loadedModalHTML['generic-service-modal']) exists, it means the shell was fetched.
            if (loadedModalHTML[modalId] && placeholder.innerHTML.includes(`id="${modalId}"`)) {
                 loadShell = false; // Shell already fetched and presumably in placeholder
            } else {
                placeholder.innerHTML = ''; // Clear placeholder for fresh load of shell
            }

        } else if (loadedModalHTML[modalId] && placeholder.innerHTML.includes(`id="${modalId}"`)) {
             // For non-generic modals, if HTML is cached and present in placeholder, skip fetch.
            loadShell = false;
        } else {
            placeholder.innerHTML = ''; // Clear placeholder for fresh load
        }


        if (loadShell) {
            try {
                console.log(`INFO:Main/loadModalContent: Fetching ${modalFile} for ${modalId}`);
                const response = await fetch(modalFile);
                if (!response.ok) {
                    console.error(`ERROR:Main/loadModalContent: Fetch failed with status ${response.status} for ${response.url}`);
                    throw new Error(`Failed to fetch ${modalFile}: ${response.statusText}`);
                }
                const html = await response.text();
                if (!isGenericServiceModal) { // Only cache specific modals, not the generic shell if it's meant to be reused by ID
                    loadedModalHTML[modalId] = html;
                }
                placeholder.innerHTML = html; // Inject the fetched HTML (shell for generic, full for specific)
                console.log(`INFO:Main/loadModalContent: ${modalId} HTML (shell or full) loaded into #${placeholderId}`);
            } catch (error) {
                console.error(`ERROR:Main/loadModalContent: Could not load modal content for ${modalId}:`, error);
                placeholder.innerHTML = `<p>Error loading modal structure. Please try again later.</p>`;
                return null;
            }
        }

        const targetModalElement = document.getElementById(modalId);
        if (!targetModalElement) {
            console.error(`ERROR:Main/loadModalContent: Modal element #${modalId} not found after loading/finding HTML.`);
            return null;
        }

        // Initialize modal-specific JS or content population if a callback is provided
        if (callback && typeof callback === 'function') {
            // For generic service modals, we might re-initialize content even if shell was 'initialized'
            // For specific modals, dataset.initialized prevents re-running their specific JS.
            if (!targetModalElement.dataset.initialized || isGenericServiceModal) {
                await callback(targetModalElement, ...callbackArgs); // Pass additional arguments if any
                if (!isGenericServiceModal) {
                    targetModalElement.dataset.initialized = "true";
                }
            } else {
                 console.log(`INFO:Main/loadModalContent: Modal ${modalId} already initialized, callback skipped unless generic.`);
            }
        }

        // Attach close listeners for this specific modal
        // This is important if modals are loaded dynamically.
        // Ensure close listeners are attached, or re-attached if necessary, especially for generic modals.
        const closeButtons = targetModalElement.querySelectorAll('.close-modal[data-close]');
        closeButtons.forEach(btn => {
            // A bit aggressive to remove/re-add, but ensures no duplicates if modal structure is re-used.
            // A more nuanced approach might check for an existing specific handler.
            const newBtn = btn.cloneNode(true); // Clone to remove existing listeners
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => closeModal(targetModalElement));
        });

        // Backdrop click for this specific modal
        // Similar aggressive re-attachment for backdrop on generic modal.
        if (targetModalElement.dataset.backdropListenerAttached && isGenericServiceModal) {
            // If it's a generic modal and listener was attached, we might need to remove old one
            // This is tricky as anonymous functions are hard to remove.
            // For now, we'll assume that if it's a generic modal, the shell might be reused,
            // and a new targetModalElement reference might be fine.
            // Or, ensure loadModalContent always provides a fresh shell for generic if issues arise.
        }

        if (!targetModalElement.dataset.backdropListenerAttached || isGenericServiceModal) {
            // For generic modals, or if not attached, add it.
            // This could lead to multiple backdrop listeners on the same element if not careful with generic.
            // A cleaner way for generic modals is to have this logic inside the generic_service_modal.html template with unique IDs
            // or ensure the shell is truly new each time.
            // Let's assume for now that `targetModalElement` is the fresh shell.
            const backdropHandler = (e) => {
                if (e.target === targetModalElement) {
                    closeModal(targetModalElement);
                    // Potentially remove this specific listener if the modal is truly gone
                    // targetModalElement.removeEventListener('click', backdropHandler); // This is complex with re-use
                }
            };
            // Storing the handler for potential removal is complex with shared generic modals.
            // For now, attach. If multiple listeners become an issue, generic modal handling needs refinement.
            targetModalElement.addEventListener('click', backdropHandler);
            targetModalElement.dataset.backdropListenerAttached = "true"; // Mark that we've tried to attach.
        }

        return targetModalElement;
    }

    async function openModalById(modalId) {
        if (!modalId) return null;
        let targetModal;

        if (modalId === 'contact-modal') {
            targetModal = await loadModalContent(
                modalId, // Specific ID for this modal
                `${ROOT_PATH}html/modals/contact_us_modal.html`,
                'contact-modal-placeholder',
                initializeContactModal
            );
        } else if (modalId === 'join-us-modal') {
            targetModal = await loadModalContent(
                modalId, // Specific ID
                `${ROOT_PATH}html/modals/join_us_modal.html`,
                'join-us-modal-placeholder',
                initializeJoinUsModal
            );
        } else if (modalId === 'chatbot-modal') {
            targetModal = await loadModalContent(
                modalId, // Specific ID
                `${ROOT_PATH}html/modals/chatbot_modal.html`,
                'chatbot-modal-placeholder',
                initializeChatbotModal // Use imported function directly
            );
        } else if (serviceModalDetails[modalId]) { // Check if it's a defined service modal
            const details = serviceModalDetails[modalId];
            targetModal = await loadModalContent(
                'generic-service-modal', // Use the ID of the generic modal structure itself
                `${ROOT_PATH}html/modals/generic_service_modal.html`, // Path to the generic modal HTML shell
                'generic-service-modal-placeholder', // Placeholder where the generic shell is loaded
                initializeServiceModalContent, // Callback to populate the generic shell
                [details.contentPath, details.titleKeyEn, details.titleKeyEs] // Args for the callback
            );
        }
        // Add other dynamic modals here with else if

        if (targetModal) {
            targetModal.classList.add('active');
            targetModal.setAttribute('aria-hidden', 'false');
            // Language update for the modal content is handled by initializeServiceModalContent or the specific modal's callback.
            // If it's a non-service modal and needs language update, its callback should handle it or call updateDynamicContentLanguage.
            if (window.updateDynamicContentLanguage && !serviceModalDetails[modalId] && modalId !== 'generic-service-modal') {
                 // For specific modals like contact-us, if their callback doesn't handle language, do it here.
                 // initializeContactModal and initializeJoinUsModal should ideally handle their own content translation.
                window.updateDynamicContentLanguage(targetModal);
            }
            setupFocusTrap(targetModal);
            const focusableElement = targetModal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select, .close-modal');
            if (focusableElement) {
                focusableElement.focus();
            } else {
                targetModal.focus(); // Fallback focus
            }
            console.log(`INFO:Main/openModalById: Modal ${modalId} opened and activated.`);
        } else {
            console.warn(`WARN:Main/openModalById: Target modal could not be loaded or found for ID: ${modalId}`);
        }
        return targetModal;
    }

    document.addEventListener('click', async (event) => {
        const trigger = event.target.closest('[data-modal]');
        if (trigger) {
            event.preventDefault();
            const modalId = trigger.dataset.modal;
            // For generic service modals, the modalId in the trigger ('business-operations-service-modal')
            // is different from the actual modal element's ID ('generic-service-modal').
            // We need to find the active modal that corresponds to this trigger.
            let modalElement;
            if (serviceModalDetails[modalId]) { // It's a trigger for a generic service modal
                modalElement = document.getElementById('generic-service-modal');
            } else { // It's a trigger for a specific modal (contact, join, chatbot)
                modalElement = document.getElementById(modalId);
            }

            if (modalElement && modalElement.classList.contains('active')) {
                // If the currently active modal is the one triggered, close it.
                // This is especially important for generic service modals where multiple triggers
                // can open the same 'generic-service-modal' element. We only close if THIS trigger's
                // modal content is currently displayed.
                // For generic modals, we might need a more robust way to check if the *content* matches,
                // but for now, if 'generic-service-modal' is active, and a service trigger is clicked, we assume it's a toggle.
                // A safer check for generic modals would be to see if `lastFocusedElement` was this `trigger`.
                // However, `lastFocusedElement` is set *before* opening.
                // A simple check: if the generic modal is open, and this trigger is a service modal trigger, then toggle.
                if (modalId === 'generic-service-modal' || serviceModalDetails[modalId]) {
                     // If the generic modal is active and this trigger corresponds to a service, close it.
                    if (document.getElementById('generic-service-modal')?.classList.contains('active')) {
                        closeModal(document.getElementById('generic-service-modal'));
                    } else { // If generic modal is not active, or this is a different modal
                        lastFocusedElement = trigger;
                        await openModalById(modalId); // This will load/open the correct service content
                    }
                } else if (modalElement.id === modalId && modalElement.classList.contains('active')) {
                    // For specific modals (contact, join, chatbot), if it's active, close it.
                    closeModal(modalElement);
                } else {
                     // Modal is not active or it's a different one, open it.
                    lastFocusedElement = trigger;
                    await openModalById(modalId);
                }
            } else {
                // Modal not loaded or not active, open it.
                lastFocusedElement = trigger;
                console.log(`INFO:Main/GlobalClickListener: Click detected for data-modal="${modalId}", opening.`);
                await openModalById(modalId);
            }
            return; // Stop further processing if modal click was handled.
        }

        // The following event listener for service page links is now OBSOLETE
        // as service pages are now modals handled by data-modal attributes.
        // I will comment it out.
        /*
        const anchor = event.target.closest('a[href]');
        if (!anchor) return;
        const url = new URL(anchor.getAttribute('href'), document.baseURI);
        // OLD serviceModalConfig is removed, this logic is no longer valid for service pages.
        // const configKey = Object.keys(serviceModalConfig).find(k => url.pathname.endsWith(k));
        // if (!configKey) return;
        // event.preventDefault();
        // lastFocusedElement = anchor;
        // const cfg = serviceModalConfig[configKey];
        // const modal = await loadModalContent(cfg.id, cfg.file, cfg.placeholder, null);
        // if (modal) {
        //     modal.classList.add('active');
        //     if (window.updateDynamicContentLanguage) {
        //         window.updateDynamicContentLanguage(modal);
        //     }
        //     setupFocusTrap(modal);
        //     const focusable = modal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select');
        //     if (focusable) focusable.focus();
        //     else modal.focus();
        // }
        */
    });

    window.openModalById = openModalById;


    // Preload Join Us modal to ensure it is ready when FAB is clicked
    // Only preload if the placeholder exists, to prevent errors on pages without it.
    if (document.getElementById('join-us-modal-placeholder')) {
        loadModalContent(
            'join-us-modal',
            `${ROOT_PATH}html/modals/join_us_modal.html`,
            'join-us-modal-placeholder',
            initializeJoinUsModal
        ).catch(err => console.error('ERROR:Main/JoinUsPreload:', err));
    } else {
        console.log('INFO:Main/JoinUsPreload: Placeholder not found, skipping preload.');
    }


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
            modalElement.setAttribute('aria-hidden', 'true');
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
       7) Mobile Nav Loading and Initialization
       ================================================================= */
    loadMobileNavigation().then(success => {
        if (success) {
            initializeMobileNavInteractions();
            updateMobileNavStatus(); // Apply body padding if mobile nav is visible

            // Ensure newly injected mobile nav is translated and themed
            const mobileNavEl = document.querySelector('.mobile-nav');
            const mobileServicesMenuEl = document.getElementById('mobile-services-menu');
            if (mobileNavEl) updateNodeLanguageTexts(currentLanguage, mobileNavEl);
            if (mobileServicesMenuEl) updateNodeLanguageTexts(currentLanguage, mobileServicesMenuEl);

            setLanguageButtonVisuals(); // Update mobile language button text/ARIA
            applyTheme(currentTheme);   // Update mobile theme button text/ARIA

            console.log('INFO:Main/MobileNavInit: Mobile navigation loaded and initialized.');
        } else {
            console.error('ERROR:Main/MobileNavInit: Mobile navigation failed to load. Features relying on it may not work.');
        }

        // Continue with other initializations that might depend on the page structure
        // (e.g., service worker, or other non-mobile-nav specific items)
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
        console.log('INFO:Main/DOMContentLoaded: All core initializations complete (post mobile nav).');
    }).catch(error => {
        console.error("ERROR:Main/MobileNavInit: General error during mobile navigation loading sequence:", error);
        // Fallback or error handling for when mobile nav loading fails critically
    });
});

// Expose global toggle functions if needed by other scripts (like join_us.js for its own toggles)
// This is a simple way; modules or custom events would be more robust for larger apps.
// window.masterToggleLanguage = toggleLanguage; // `toggleLanguage` is not in this scope anymore, it was part of the old main.js structure
// window.masterToggleTheme = toggleThemeOnClick; // `toggleThemeOnClick` is not in this scope anymore
// The language and theme toggles are now self-contained within the main DOMContentLoaded listener.
// `window.updateDynamicContentLanguage` is already exposed for dynamic content.
// `window.masterToggleLanguage` and `window.masterToggleTheme` are already exposed.

