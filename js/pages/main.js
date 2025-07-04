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
    // Function to add padding for fixed mobile nav - OLD, NOT CALLED
    function updateMobileNavStatus() {
        const mobileNavElement = document.querySelector('.mobile-nav');
        if (mobileNavElement && getComputedStyle(mobileNavElement).display !== 'none') {
            document.body.classList.add('mobile-nav-active');
        } else {
            document.body.classList.remove('mobile-nav-active');
        }
    }
    */ // END OLD - updateMobileNavStatus
    // Placeholder for mobile navigation HTML injection - OLD, NOT USED
    const mobileNavPlaceholder = document.getElementById('mobile-nav-placeholder');

    // OLD - loadMobileNavigation - DEFINITION REMAINS BUT NOT CALLED
    async function loadMobileNavigation() {
        try {
            const response = await fetch(`${ROOT_PATH}html/partials/mobile_nav.html`);
            if (!response.ok) {
                throw new Error(`Failed to fetch mobile_nav.html: ${response.statusText}`);
            }
            let html = await response.text();

            if (!html || html.trim() === "") {
                console.error('ERROR:Main/loadMobileNavigation: Fetched mobile_nav.html is empty or invalid.');
                throw new Error('Fetched mobile_nav.html is empty or invalid.'); // This will be caught by the catch block
            }

            // Correct href paths using ROOT_PATH
            html = html.replace(/href="html\//g, `href="${ROOT_PATH}html/`);
            html = html.replace(/href="index\.html"/g, `href="${ROOT_PATH}index.html"`);

            if (mobileNavPlaceholder) {
                mobileNavPlaceholder.innerHTML = html;
            } else {
                // Fallback if placeholder is missing, append to body
                console.warn('WARN:Main/loadMobileNavigation: mobile-nav-placeholder not found, appending to body.');
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                while (tempDiv.firstChild) {
                    document.body.appendChild(tempDiv.firstChild);
                }
            }
            return true;
        } catch (error) {
            // Log the specific error from the try block, or the generic fetch error
            console.error(`ERROR:Main/loadMobileNavigation: ${error.message}`);
            return false;
        }
    }
    
    */ // END OLD - loadMobileNavigation
    // OLD - initializeMobileNavInteractions - DEFINITION REMAINS BUT NOT CALLED
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
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile services toggle/menu not found.');
        }

        // Mobile Language Toggle (re-query after injection)
        const langToggleMobile = document.getElementById("mobile-language-toggle");
        if (langToggleMobile) {
            langToggleMobile.addEventListener("click", () => window.masterToggleLanguage());
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile language toggle not found.');
        }

        // Mobile Theme Toggle (re-query after injection)
        const themeToggleMobile = document.getElementById("mobile-theme-toggle");
        if (themeToggleMobile) {
            themeToggleMobile.addEventListener("click", () => window.masterToggleTheme());
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
        } else {
            console.warn('WARN:Main/initializeMobileNavInteractions: Mobile Join Us launcher not found.');
        }
    }
    */ // END OLD - initializeMobileNavInteractions

    // START: MODIFIED FOR STEP 3 - Ensure mobile-services-toggle functionality
    // Mobile Services Menu Toggle (for the old mobile_nav.html's bottom nav menu)
    const mobileServicesToggle = document.getElementById('mobile-services-toggle');
    const mobileServicesMenu = document.getElementById('mobile-services-menu');

    if (mobileServicesToggle && mobileServicesMenu) {
        mobileServicesToggle.addEventListener('click', () => {
            const isOpen = mobileServicesMenu.classList.toggle('active');
            mobileServicesToggle.setAttribute('aria-expanded', isOpen.toString());
            mobileServicesMenu.setAttribute('aria-hidden', (!isOpen).toString());
        });

        // Optional: Close menu when clicking outside
        document.addEventListener('click', (event) => {
            if (mobileServicesMenu.classList.contains('active')) {
                if (!mobileServicesMenu.contains(event.target) && !mobileServicesToggle.contains(event.target)) {
                    mobileServicesMenu.classList.remove('active');
                    mobileServicesToggle.setAttribute('aria-expanded', 'false');
                    mobileServicesMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });
    } else {
        // console.warn('WARN:Main/MobileServicesToggle: Mobile services toggle or menu not found (mobile_nav.html).');
        // This warning might appear on pages not using mobile_nav.html, which is fine.
    }
    // END: MODIFIED FOR STEP 3

    // Dynamically set the Home link in the rightSideMenu
    const homeLinkRightSideMenu = document.querySelector("#rightSideMenu .right-side-menu-nav a[href='../index.html']");
    if (homeLinkRightSideMenu) {
        homeLinkRightSideMenu.href = ROOT_PATH + "index.html";
    }


    /* ================================================================
       1) LANGUAGE TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    let currentLanguage = localStorage.getItem("language") || "en";

    const langToggleDesktop = document.getElementById("language-toggle-desktop");

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
            } else if (el.value !== undefined && (el.tagName === 'INPUT' || el.tagName === 'BUTTON') && !el.classList.contains('lang-toggle-btn')) {
                if (textToSet !== undefined) el.value = textToSet;
            } else if (el.tagName !== 'BUTTON' || !el.classList.contains('lang-toggle-btn')) {
                let hasNonTextChildNodes = false;
                for(let i=0; i < el.childNodes.length; i++) {
                    if(el.childNodes[i].nodeType !== Node.TEXT_NODE && el.childNodes[i].nodeName !== 'I' /* Allow FontAwesome icons */) {
                        hasNonTextChildNodes = true; break;
                    }
                }
                if (!hasNonTextChildNodes || el.childNodes.length === 0 || (el.childNodes.length === 1 && el.childNodes[0].nodeName === 'I')) {
                    if (textToSet !== undefined) {
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
        const newAriaLabel = (currentLanguage === "en") ?
                             (langToggleDesktop?.dataset?.esLabel || "Switch to Spanish") :
                             (langToggleDesktop?.dataset?.enLabel || "Switch to English");

        if (langToggleDesktop) {
            langToggleDesktop.textContent = newButtonText;
            if(newAriaLabel) langToggleDesktop.setAttribute('aria-label', newAriaLabel);
        }

        const langToggleMobileInstance = document.getElementById("mobile-language-toggle"); // OLD
        if (langToggleMobileInstance) {
            langToggleMobileInstance.textContent = newButtonText;
            if(newAriaLabel) langToggleMobileInstance.setAttribute('aria-label', newAriaLabel);
        }
      
        const fabLangToggleInstance = document.getElementById("fabLanguageToggle");
        if (fabLangToggleInstance) {
            const spanElement = fabLangToggleInstance.querySelector('span');
            if (spanElement) {
                spanElement.textContent = newButtonText;
            } else {
                console.warn('DEBUG:Main/setLanguageButtonVisuals: Span not found in #fabLanguageToggle.');
            }
            const fabAriaLabel = (currentLanguage === "en") ?
                                 (fabLangToggleInstance.dataset.esLabel || "Cambiar a Español") :
                                 (fabLangToggleInstance.dataset.enLabel || "Switch to English");
            if(fabAriaLabel) {
                fabLangToggleInstance.setAttribute('aria-label', fabAriaLabel);
                fabLangToggleInstance.setAttribute('title', fabAriaLabel);
            }
        }
    }

    window.masterToggleLanguage = function(langToSet) {
        const newLang = langToSet ? langToSet : (currentLanguage === "en" ? "es" : "en");
        if (newLang !== currentLanguage) {
            currentLanguage = newLang;
            localStorage.setItem("language", currentLanguage);
            updateNodeLanguageTexts(currentLanguage, document.body);
            updateHeadLanguageTexts(currentLanguage);
            setLanguageButtonVisuals();
        }
    };
    if (langToggleDesktop) langToggleDesktop.addEventListener("click", () => window.masterToggleLanguage());

    window.updateDynamicContentLanguage = function(nodeToUpdate) {
        if (nodeToUpdate) {
            updateNodeLanguageTexts(currentLanguage, nodeToUpdate);
        }
    };

    updateNodeLanguageTexts(currentLanguage, document.body);
    updateHeadLanguageTexts(currentLanguage);
    setLanguageButtonVisuals();

    /* ================================================================
       2) THEME TOGGLE (Desktop & Mobile for index.html header)
       ================================================================= */
    const themeToggleDesktop = document.getElementById("theme-toggle-desktop");
    const bodyElement = document.body;
    let currentTheme = localStorage.getItem("theme") || "light";

    function applyTheme(theme) {
        bodyElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
        const buttonText = (theme === "light") ?
            (themeToggleDesktop?.dataset[currentLanguage + 'Dark'] || (currentLanguage === 'es' ? 'Oscuro' : 'Dark')) :
            (themeToggleDesktop?.dataset[currentLanguage + 'Light'] || (currentLanguage === 'es' ? 'Claro' : 'Light'));

        const desktopAriaLabel = (theme === 'light') ?
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelDark'] || themeToggleDesktop?.dataset['enLabelDark'] || "Switch to Dark Theme") :
            (themeToggleDesktop?.dataset[currentLanguage + 'LabelLight'] || themeToggleDesktop?.dataset['enLabelLight'] || "Switch to Light Theme");
        if (themeToggleDesktop) {
            themeToggleDesktop.textContent = buttonText;
            if(desktopAriaLabel) themeToggleDesktop.setAttribute('aria-label', desktopAriaLabel);
        }

        const mobileThemeToggle = document.getElementById("mobile-theme-toggle"); // OLD
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

      const fabThemeToggleInstance = document.getElementById("fabThemeToggle");
        if (fabThemeToggleInstance) {
            const fabSpanElement = fabThemeToggleInstance.querySelector('span');
            const fabIconElement = fabThemeToggleInstance.querySelector('i');
            const fabText = (theme === 'light') ?
                (fabThemeToggleInstance.dataset[currentLanguage + 'Dark'] || (currentLanguage === 'es' ? 'Oscuro' : 'Dark')) :
                (fabThemeToggleInstance.dataset[currentLanguage + 'Light'] || (currentLanguage === 'es' ? 'Claro' : 'Light'));
            const fabAriaLabelText = (theme === 'light') ?
                (fabThemeToggleInstance.dataset[currentLanguage + 'LabelDark'] || fabThemeToggleInstance.dataset['enLabelDark'] || "Switch to Dark Theme") :
                (fabThemeToggleInstance.dataset[currentLanguage + 'LabelLight'] || fabThemeToggleInstance.dataset['enLabelLight'] || "Switch to Light Theme");
            if (fabSpanElement) {
                fabSpanElement.textContent = fabText;
            } else {
                console.warn('DEBUG:Main/applyTheme: Span not found in #fabThemeToggle.');
            }
            if (fabAriaLabelText) {
                fabThemeToggleInstance.setAttribute('aria-label', fabAriaLabelText);
                fabThemeToggleInstance.setAttribute('title', fabAriaLabelText);
            }
            if (fabIconElement) {
                if (theme === 'light') {
                    fabIconElement.classList.remove('fa-moon');
                    fabIconElement.classList.add('fa-lightbulb');
                } else {
                    fabIconElement.classList.remove('fa-lightbulb');
                    fabIconElement.classList.add('fa-moon');
                }
            } else {
                console.warn('DEBUG:Main/applyTheme: Icon element not found in #fabThemeToggle.');
            }
        }
    }

    window.masterToggleTheme = function(themeToSet) {
        const newTheme = themeToSet ? themeToSet : (bodyElement.getAttribute("data-theme") === "light" ? "dark" : "light");
        if (newTheme !== currentTheme) {
            currentTheme = newTheme;
            applyTheme(currentTheme);
        }
    };

    if (themeToggleDesktop) themeToggleDesktop.addEventListener("click", () => window.masterToggleTheme());
    applyTheme(currentTheme);
   /* ==================================================================
       3) Right-Side Main Menu (for index.html)
       ================================================================== */
    const menuOpenBtn = document.getElementById('menu-open');
    const menuCloseBtn = document.getElementById('menu-close');
    const rightSideMenu = document.getElementById('rightSideMenu');
    if (menuOpenBtn && rightSideMenu) {
        menuOpenBtn.addEventListener('click', () => {
            rightSideMenu.classList.add('open');
            menuOpenBtn.setAttribute('aria-expanded', 'true');
            if(menuCloseBtn) menuCloseBtn.focus();
        });
    }
    if (menuCloseBtn && rightSideMenu) {
        menuCloseBtn.addEventListener('click', () => {
            rightSideMenu.classList.remove('open');
            if(menuOpenBtn) menuOpenBtn.setAttribute('aria-expanded', 'false');
            if(menuOpenBtn) menuOpenBtn.focus();
            const servicesSubMenuInstance = document.getElementById('servicesSubMenu');
            if (servicesSubMenuInstance) servicesSubMenuInstance.classList.remove('open');
            const servicesTriggerBtnInstance = document.querySelector('.services-trigger > button');
            if(servicesTriggerBtnInstance) servicesTriggerBtnInstance.setAttribute('aria-expanded', 'false');
        });
    }
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
    }

    /* ==================================================================
       5) Modals (General Logic for index.html: Contact Us)
       ================================================================== */
    let lastFocusedElement = null;
    let loadedModalHTML = {};

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
            modalElement.querySelector('.modal-body').innerHTML = '<p>Error: Modal structure is missing critical elements.</p>';
            return;
        }

        try {
            const response = await fetch(serviceContentPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch service content: ${response.statusText} from ${serviceContentPath}`);
            }
            const contentHtml = await response.text();
            contentContainer.innerHTML = contentHtml;

            const titleToSet = (currentLanguage === 'es' && serviceTitleEs) ? serviceTitleEs : serviceTitleEn;
            titleElement.textContent = titleToSet;
            titleElement.dataset.en = serviceTitleEn;
            titleElement.dataset.es = serviceTitleEs;

            if (window.updateDynamicContentLanguage) {
                window.updateDynamicContentLanguage(contentContainer);
                window.updateDynamicContentLanguage(titleElement.parentElement);
            }
        } catch (error) {
            console.error('ERROR:Main/initializeServiceModalContent:', error);
            contentContainer.innerHTML = `<p>Error loading service content. Please try again later.</p>`;
            titleElement.textContent = 'Error';
        }
    }


    async function loadModalContent(modalId, modalFile, placeholderId, callback, callbackArgs = []) {
        let placeholder = document.getElementById(placeholderId);
        if (!placeholder) {
            placeholder = document.createElement('div');
            placeholder.id = placeholderId;
            document.body.appendChild(placeholder);
        }

        const isGenericServiceModal = modalId === 'generic-service-modal';
        let loadShell = true;
        if (isGenericServiceModal) {
            const existingShell = document.getElementById('generic-service-modal');
            if (placeholder.contains(existingShell)) {
            } else {
                 placeholder.innerHTML = '';
            }
            if (loadedModalHTML[modalId] && placeholder.innerHTML.includes(`id="${modalId}"`)) {
                 loadShell = false;
            } else {
                placeholder.innerHTML = '';
            }

        } else if (loadedModalHTML[modalId] && placeholder.innerHTML.includes(`id="${modalId}"`)) {
            loadShell = false;
        } else {
            placeholder.innerHTML = '';
        }


        if (loadShell) {
            try {
                const response = await fetch(modalFile);
                if (!response.ok) {
                    console.error(`ERROR:Main/loadModalContent: Fetch failed with status ${response.status} for ${response.url}`);
                    throw new Error(`Failed to fetch ${modalFile}: ${response.statusText}`);
                }
                const html = await response.text();
                if (!isGenericServiceModal) {
                    loadedModalHTML[modalId] = html;
                }
                placeholder.innerHTML = html;
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

        if (callback && typeof callback === 'function') {
            if (!targetModalElement.dataset.initialized || isGenericServiceModal) {
                await callback(targetModalElement, ...callbackArgs);
                if (!isGenericServiceModal) {
                    targetModalElement.dataset.initialized = "true";
                }
            } else {
            }
        }

        const closeButtons = targetModalElement.querySelectorAll('.close-modal[data-close]');
        closeButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => closeModal(targetModalElement));
        });

        if (targetModalElement.dataset.backdropListenerAttached && isGenericServiceModal) {
        }

        if (!targetModalElement.dataset.backdropListenerAttached || isGenericServiceModal) {
            const backdropHandler = (e) => {
                if (e.target === targetModalElement) {
                    closeModal(targetModalElement);
                }
            };
            targetModalElement.addEventListener('click', backdropHandler);
            targetModalElement.dataset.backdropListenerAttached = "true";
        }

        return targetModalElement;
    }

    async function openModalById(modalId) {
        if (!modalId) {
            console.warn('DEBUG:Main/openModalById: Called with null or empty modalId.');
            return null;
        }
        let targetModal;

        if (modalId === 'contact-modal') {
            targetModal = await loadModalContent(
                modalId,
                `${ROOT_PATH}html/modals/contact_us_modal.html`,
                'contact-modal-placeholder',
                initializeContactModal
            );
        } else if (modalId === 'join-us-modal') {
            targetModal = await loadModalContent(
                modalId,
                `${ROOT_PATH}html/modals/join_us_modal.html`,
                'join-us-modal-placeholder',
                initializeJoinUsModal
            );
        } else if (modalId === 'chatbot-modal') {
            targetModal = await loadModalContent(
                modalId,
                `${ROOT_PATH}html/modals/chatbot_modal.html`,
                'chatbot-modal-placeholder',
                initializeChatbotModal
            );
        } else if (serviceModalDetails[modalId]) {
            const details = serviceModalDetails[modalId];
            targetModal = await loadModalContent(
                'generic-service-modal',
                `${ROOT_PATH}html/modals/generic_service_modal.html`,
                'generic-service-modal-placeholder',
                initializeServiceModalContent,
                [details.contentPath, details.titleKeyEn, details.titleKeyEs]
            );
        }

        if (targetModal) {
            targetModal.classList.add('active');
            targetModal.setAttribute('aria-hidden', 'false');
            if (window.updateDynamicContentLanguage && !serviceModalDetails[modalId] && modalId !== 'generic-service-modal') {
                window.updateDynamicContentLanguage(targetModal);
            }
            setupFocusTrap(targetModal);
            const focusableElement = targetModal.querySelector('input:not([type="hidden"]), button:not([disabled]), [tabindex]:not([tabindex="-1"]), a[href], textarea, select, .close-modal');
            if (focusableElement) {
                focusableElement.focus();
            } else {
                targetModal.focus();
            }
        } else {
            console.warn(`WARN:Main/openModalById: Target modal could not be loaded or found for ID: ${modalId}. targetModal is null.`);
        }
        return targetModal;
    }

    document.addEventListener('click', async (event) => {
        const trigger = event.target.closest('[data-modal]');
        if (trigger) {
            event.preventDefault();
            const modalId = trigger.dataset.modal;
            if (trigger.classList.contains('floating-icon') || trigger.classList.contains('horiz-nav-item')) {
            }
            let modalElement;
            if (serviceModalDetails[modalId]) {
                modalElement = document.getElementById('generic-service-modal');
            } else {
                modalElement = document.getElementById(modalId);
            }

            if (modalElement && modalElement.classList.contains('active')) {
                if (modalId === 'generic-service-modal' || serviceModalDetails[modalId]) {
                    if (document.getElementById('generic-service-modal')?.classList.contains('active')) {
                        closeModal(document.getElementById('generic-service-modal'));
                    } else {
                        lastFocusedElement = trigger;
                        await openModalById(modalId);
                    }
                } else if (modalElement.id === modalId && modalElement.classList.contains('active')) {
                    closeModal(modalElement);
                } else {
                    lastFocusedElement = trigger;
                    await openModalById(modalId);
                }
            } else {
                lastFocusedElement = trigger;
                await openModalById(modalId);
            }
            return;
        } else {
        }
    });

    window.openModalById = openModalById;

    if (document.getElementById('join-us-modal-placeholder')) {
        loadModalContent(
            'join-us-modal',
            `${ROOT_PATH}html/modals/join_us_modal.html`,
            'join-us-modal-placeholder',
            initializeJoinUsModal
        ).catch(err => console.error('ERROR:Main/JoinUsPreload:', err));
    } else {
    }


    let currentTrapHandler = null;

    function setupFocusTrap(modalElement) {
        const focusableElements = modalElement.querySelectorAll(
            'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (currentTrapHandler) {
            document.removeEventListener('keydown', currentTrapHandler);
        }

        currentTrapHandler = function(e) {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else {
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

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal);
            }
        }
    });

    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('active');
            modalElement.setAttribute('aria-hidden', 'true');
            removeFocusTrap();
            if (lastFocusedElement) lastFocusedElement.focus();
        }
    }

    document.querySelectorAll('#contact-modal .close-modal[data-close]').forEach(btn => {
        btn.addEventListener('click', (event) => {
            const parentModal = event.currentTarget.closest('.modal-overlay');
            closeModal(parentModal);
        });
    });

    document.querySelectorAll('#contact-modal.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    /* ================================================================
       6) Form Submission Logic (DEFERRED to specific component scripts)
       ================================================================ */

    /* ================================================================
       7) Mobile Nav Loading and Initialization (OLD - To be removed)
       ================================================================= */
    // /* OLD - loadMobileNavigation call and related logic
    // loadMobileNavigation().then(success => {
    //     if (success) {
    //         initializeMobileNavInteractions();
    //         // updateMobileNavStatus(); // OLD - Apply body padding if mobile nav is visible
    //
    //         // Ensure newly injected mobile nav is translated and themed
    //         const mobileNavEl = document.querySelector('.mobile-nav');
    //         const mobileServicesMenuEl = document.getElementById('mobile-services-menu');
    //         if (mobileNavEl) updateNodeLanguageTexts(currentLanguage, mobileNavEl);
    //         if (mobileServicesMenuEl) updateNodeLanguageTexts(currentLanguage, mobileServicesMenuEl);
    //
    //         setLanguageButtonVisuals(); // Update mobile language button text/ARIA
    //         applyTheme(currentTheme);   // Update mobile theme button text/ARIA
    //
    //     } else {
    //         console.error('ERROR:Main/MobileNavInit: Mobile navigation failed to load. Features relying on it may not work.');
    //     }
    //
    //     // Continue with other initializations that might depend on the page structure
    //     // (e.g., service worker, or other non-mobile-nav specific items)
    //
    //     /* ================================================================
    //        FAB Horizontal Navigation Loading & Initialization
    //        ================================================================= */
    //     loadFabHorizontalNavigation().then(fabSuccess => {
    //         if (fabSuccess) {
    //             initializeFabHorizontalNavInteractions(); // Placeholder for now
    //             // Language/theme update for FAB nav will be handled within initializeFabHorizontalNavInteractions
    //         } else {
    //             console.error('ERROR:Main/FabNavInit: FAB Horizontal navigation failed to load.');
    //         }
    //
    //         /* ================================================================
    //            8) Service Worker Registration (Moved here to ensure it's one of the last things)
    //            ================================================================= */
    //         if ('serviceWorker' in navigator) {
    //             window.addEventListener('load', () => {
    //                 navigator.serviceWorker.register(`${ROOT_PATH}js/service-worker.js`)
    //                     .catch(err => console.error('ERROR:Main/ServiceWorker: Registration failed:', err));
    //             });
    //         } else {
    //             console.warn('WARN:Main/ServiceWorker: Not supported in this browser.');
    //         }
    //
    //     }).catch(error => {
    //         console.error("ERROR:Main/FabNavInit: General error during FAB horizontal navigation loading sequence:", error);
    //     });
    //
    //
    // }).catch(error => {
    //     console.error("ERROR:Main/MobileNavInit: General error during mobile navigation loading sequence:", error);
    //     // Fallback or error handling for when mobile nav loading fails critically
    // });
    // */ // END OLD - loadMobileNavigation call and related logic
    /* ================================================================
       FAB Horizontal Navigation - Load and Initialize (NEW Primary Mobile Nav)
       ================================================================= */
    loadFabHorizontalNavigation().then(fabSuccess => {
        if (fabSuccess) {
            initializeFabHorizontalNavInteractions();
        } else {
            console.error('ERROR:Main/FabNavInit: FAB Horizontal navigation failed to load.');
        }

        /* ================================================================
           8) Service Worker Registration (Ensuring it's one of the last things)
           ================================================================= */
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register(`${ROOT_PATH}js/service-worker.js`)
                    .catch(err => console.error('ERROR:Main/ServiceWorker: Registration failed:', err));
            });
        } else {
            console.warn('WARN:Main/ServiceWorker: Not supported in this browser.');
        }

    }).catch(error => {
        console.error("ERROR:Main/FabNavInit: General error during FAB horizontal navigation loading sequence:", error);
    });


    /* ================================================================
       FAB Horizontal Navigation Functions
       ================================================================= */
    async function loadFabHorizontalNavigation() {
        const floatingIconsContainer = document.querySelector('.floating-icons');
        if (!floatingIconsContainer) {
            console.warn('WARN:Main/loadFabHorizontalNavigation: .floating-icons container not found. FAB button cannot be added.');
            return false;
        }
       try {
            const response = await fetch(`${ROOT_PATH}html/partials/fab_horizontal_nav.html`);
            if (!response.ok) {
                throw new Error(`Failed to fetch fab_horizontal_nav.html: ${response.statusText}`);
            }
            const htmlFragmentText = await response.text();

            if (!htmlFragmentText || htmlFragmentText.trim() === "") {
                console.error('ERROR:Main/loadFabHorizontalNavigation: Fetched fab_horizontal_nav.html is empty.');
                throw new Error('Fetched fab_horizontal_nav.html is empty.');
            }

            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = htmlFragmentText;

            const fabButton = tempContainer.querySelector('#horizontalNavFab');
            const horizontalNavMenu = tempContainer.querySelector('#horizontalMobileNav');
            const servicesSubMenu = tempContainer.querySelector('#horizontalServicesMenu');

            if (fabButton) {
                floatingIconsContainer.appendChild(fabButton);
            } else {
                console.warn('WARN:Main/loadFabHorizontalNavigation: #horizontalNavFab not found in fetched HTML.');
            }

            if (horizontalNavMenu) {
                document.body.appendChild(horizontalNavMenu);
            } else {
                console.warn('WARN:Main/loadFabHorizontalNavigation: #horizontalMobileNav not found in fetched HTML.');
            }

            if (servicesSubMenu) {
                document.body.appendChild(servicesSubMenu);
            } else {
                console.warn('WARN:Main/loadFabHorizontalNavigation: #horizontalServicesMenu not found in fetched HTML.');
            }

           return true;
        } catch (error) {
            console.error(`ERROR:Main/loadFabHorizontalNavigation: ${error.message}`);
            return false;
        }
    }

    function initializeFabHorizontalNavInteractions() {
        const fabToggle = document.getElementById('horizontalNavFab');
        const fabIcon = fabToggle ? fabToggle.querySelector('i') : null;
        const horizontalNav = document.getElementById('horizontalMobileNav');
        const servicesToggle = document.getElementById('horizontalServicesToggle');
        const servicesMenu = document.getElementById('horizontalServicesMenu');
        if (!fabToggle || !fabIcon || !horizontalNav) {
            console.error('ERROR:Main/initializeFabHorizontalNavInteractions: Core FAB navigation elements not found. Interactions cannot be initialized.');
            return;
        }

        fabToggle.addEventListener('click', () => {
            const isNavActive = horizontalNav.classList.toggle('active');
            fabToggle.setAttribute('aria-expanded', isNavActive.toString());
            horizontalNav.setAttribute('aria-hidden', (!isNavActive).toString());

            if (isNavActive) {
                fabIcon.classList.remove('fa-bars');
                fabIcon.classList.add('fa-times');
            } else {
                fabIcon.classList.remove('fa-times');
                fabIcon.classList.add('fa-bars');
                if (servicesMenu && servicesMenu.classList.contains('active')) {
                    servicesMenu.classList.remove('active');
                    if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                }
            }
        });
          
        if (servicesToggle && servicesMenu) {
            servicesToggle.addEventListener('click', (event) => {
                event.stopPropagation();
                const isServicesActive = servicesMenu.classList.toggle('active');
                servicesToggle.setAttribute('aria-expanded', isServicesActive.toString());
                servicesMenu.setAttribute('aria-hidden', (!isServicesActive).toString());
            });
        } else {
            console.warn('WARN:Main/initializeFabHorizontalNavInteractions: Services toggle or menu for FAB nav not found.');
        }

        document.addEventListener('click', (event) => {
            if (horizontalNav.classList.contains('active') &&
                !horizontalNav.contains(event.target) &&
                !fabToggle.contains(event.target) &&
                !servicesToggle.contains(event.target) ) {
                horizontalNav.classList.remove('active');
                fabIcon.classList.remove('fa-times');
                fabIcon.classList.add('fa-bars');
                fabToggle.setAttribute('aria-expanded', 'false');
                horizontalNav.setAttribute('aria-hidden', 'true');

                if (servicesMenu && servicesMenu.classList.contains('active')) {
                    servicesMenu.classList.remove('active');
                    if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                    servicesMenu.setAttribute('aria-hidden', 'true');
                }
            }

            else if (servicesMenu && servicesMenu.classList.contains('active') &&
                !servicesMenu.contains(event.target) &&
                !servicesToggle.contains(event.target) &&
                !horizontalNav.contains(event.target)  ) {
                servicesMenu.classList.remove('active');
                if(servicesToggle) servicesToggle.setAttribute('aria-expanded', 'false');
                servicesMenu.setAttribute('aria-hidden', 'true');
            }
        });

        const fabNavModalLaunchers = horizontalNav.querySelectorAll('[data-modal]');
        fabNavModalLaunchers.forEach(launcher => {
        });

        const fabNavHtmlElementsContainer = document.querySelector('#horizontalMobileNav');
        if (fabNavHtmlElementsContainer) {
            updateNodeLanguageTexts(currentLanguage, fabNavHtmlElementsContainer);
            if(servicesMenu) updateNodeLanguageTexts(currentLanguage, servicesMenu);
        }


        const fabLangToggle = document.getElementById('fabLanguageToggle');
        if (fabLangToggle) {
            fabLangToggle.addEventListener('click', () => {
                window.masterToggleLanguage();
            });
        } else {
            console.warn('WARN:Main/initializeFabHorizontalNavInteractions: FAB Language toggle not found.');
        }

        const fabThemeToggle = document.getElementById('fabThemeToggle');
        if (fabThemeToggle) {
            fabThemeToggle.addEventListener('click', () => {
                window.masterToggleTheme();
            });
        } else {
            console.warn('WARN:Main/initializeFabHorizontalNavInteractions: FAB Theme toggle not found.');
        }
    }

});

// Expose global toggle functions if needed by other scripts (like join_us.js for its own toggles)
// This is a simple way; modules or custom events would be more robust for larger apps.
// window.masterToggleLanguage = toggleLanguage; // `toggleLanguage` is not in this scope anymore, it was part of the old main.js structure
// window.masterToggleTheme = toggleThemeOnClick; // `toggleThemeOnClick` is not in this scope anymore
// The language and theme toggles are now self-contained within the main DOMContentLoaded listener.
// `window.updateDynamicContentLanguage` is already exposed for dynamic content.
// `window.masterToggleLanguage` and `window.masterToggleTheme` are already exposed.


[end of js/pages/main.js]
