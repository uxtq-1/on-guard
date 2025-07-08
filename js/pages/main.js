// js/pages/main.js

import { initializeContactModal } from './contact_us.js';
import { initializeJoinUsModal } from './join_us.js';
import { updateDynamicContentLanguage } from '../language_toggle/language-toggle.js';
import { attachModalHandlers, closeModal as closeModalUtility } from '../utils/modal.js'; // Import closeModalUtility
window.updateDynamicContentLanguage = updateDynamicContentLanguage;
document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('js/service-worker.js')
      .then(reg => {
        console.log('[SW] Registration successful:', reg.scope);
      })
      .catch(err => {
        console.error('[SW] Registration failed:', err);
      });
  } else {
    console.log('[SW] Service workers are not supported in this browser.');
  }
  const body = document.body;
  const html = document.documentElement;

  const modalMap = {
    'contact-modal': { file: 'contact_us_modal.html', id: 'contact-modal' },
    'join-us-modal': { file: 'join_us_modal.html', id: 'join-us-modal' },
    'business-operations-service-modal': { file: 'generic_service_modal.html', id: 'generic-service-modal', contentFile: 'business_operations_content.html', titleKey: 'Business Operations', titleEsKey: 'Operaciones Empresariales' },
    'contact-center-service-modal': { file: 'generic_service_modal.html', id: 'generic-service-modal', contentFile: 'contact_center_content.html', titleKey: 'Contact Center', titleEsKey: 'Centro de Contacto' },
    'it-support-service-modal': { file: 'generic_service_modal.html', id: 'generic-service-modal', contentFile: 'it_support_content.html', titleKey: 'IT Support', titleEsKey: 'Soporte IT' },
    'professionals-service-modal': { file: 'generic_service_modal.html', id: 'generic-service-modal', contentFile: 'professionals_content.html', titleKey: 'Professionals', titleEsKey: 'Profesionales' },
  };

  async function loadModal(modalKey, triggerButtonId) {
    // DEBUG log removed as per plan
    const mapEntry = modalMap[modalKey];
    if (!mapEntry) {
      console.error(`Modal key "${modalKey}" not found in modalMap.`);
      return null;
    }

    // Unique placeholder ID for each modal trigger ensures that if a generic modal is used by multiple triggers,
    // they don't interfere with each other's content if they are all added to the DOM.
    const placeholderId = `placeholder-for-${mapEntry.id}-${modalKey}`;
    let placeholder = document.getElementById(placeholderId);
    let modalElement;

    // If placeholder exists, try to find the modal element within it.
    if (placeholder) {
      modalElement = placeholder.querySelector(`#${mapEntry.id}`); // Search within the placeholder
      if (modalElement) {
        console.log(`Modal "${mapEntry.id}" (for ${modalKey}) already exists in its placeholder ${placeholderId}.`);
        if (triggerButtonId) modalElement.dataset.triggerId = triggerButtonId;
        attachModalHandlers(modalElement); // Ensure handlers are (re)attached

        // If it's a generic service modal, its content might need to be refreshed or language updated.
        if (mapEntry.contentFile) {
            // Assuming title and content are already there, just ensure language is current.
            // If content could change dynamically beyond language, it would need re-fetching here.
            if (typeof updateDynamicContentLanguage === 'function') {
                updateDynamicContentLanguage(modalElement);
            }
        }
        return modalElement;
      } else {
        console.warn(`Placeholder ${placeholderId} found but no modal element # ${mapEntry.id} within it. Will attempt to reload into this placeholder.`);
        // Placeholder exists but no modal, clear it to ensure clean load.
        placeholder.innerHTML = '';
      }
    } else {
      // Create placeholder if it doesn't exist
      placeholder = document.createElement('div');
      placeholder.id = placeholderId;
      document.body.appendChild(placeholder);
    }

    const modalStructureFilePath = `html/modals/${mapEntry.file}`;

    try {
      console.log(`Fetching modal structure from: ${modalStructureFilePath} for modalKey ${modalKey} into placeholder ${placeholderId}`);
      const respStructure = await fetch(modalStructureFilePath);
      if (!respStructure.ok) {
        console.error(`Failed to fetch modal structure for "${modalKey}" from ${modalStructureFilePath}. Status: ${respStructure.status}`);
        placeholder.innerHTML = `<p style="color:red; padding:1em;">Error: Could not load structure for ${modalKey}.</p>`;
        return null;
      }
      const modalHTML = await respStructure.text();
      placeholder.innerHTML = modalHTML;

      modalElement = placeholder.querySelector(`#${mapEntry.id}`); // Search again within the placeholder after injecting HTML

      if (!modalElement) {
        console.error(`Modal element with ID "${mapEntry.id}" not found in fetched HTML for "${modalKey}" (loaded into ${placeholderId}). Check structure of ${mapEntry.file}.`);
        return null;
      }

      if (mapEntry.contentFile) {
        const contentFilePath = `html/partials/services/${mapEntry.contentFile}`;
        console.log(`Fetching service content from: ${contentFilePath} for modalKey ${modalKey}`);
        const respContent = await fetch(contentFilePath);
        const bodyContentEl = modalElement.querySelector('.service-modal-body-content'); // Get this once

        if (!bodyContentEl) {
            console.error(`Could not find '.service-modal-body-content' in the modal structure from ${mapEntry.file}. Cannot load content.`);
        } else if (!respContent.ok) {
          console.error(`Failed to fetch service content for "${modalKey}" from ${contentFilePath}. Status: ${respContent.status}`);
          bodyContentEl.innerHTML = `<p style="color:red;">Error loading content.</p>`;
        } else {
          const serviceContentHTML = await respContent.text();
          bodyContentEl.innerHTML = serviceContentHTML;
        }

        const titleElement = modalElement.querySelector('#service-modal-title');
        if (titleElement) {
          titleElement.textContent = mapEntry.titleKey;
          titleElement.dataset.en = mapEntry.titleKey;
          if(mapEntry.titleEsKey) titleElement.dataset.es = mapEntry.titleEsKey;
          else titleElement.dataset.es = mapEntry.titleKey; // Fallback for Spanish title
        } else {
          console.error(`Could not find '#service-modal-title' in the modal structure from ${mapEntry.file}.`);
        }
      }

      console.log(`Modal "${mapEntry.id}" for ${modalKey} loaded and configured successfully into ${placeholderId}.`);
      if (triggerButtonId) modalElement.dataset.triggerId = triggerButtonId;

      if (modalKey === 'contact-modal') initializeContactModal(modalElement);
      if (modalKey === 'join-us-modal') initializeJoinUsModal(modalElement);

      if (typeof updateDynamicContentLanguage === 'function') {
        updateDynamicContentLanguage(modalElement);
      }

      attachModalHandlers(modalElement);
      return modalElement;
    } catch (err) {
      console.error(`Error loading modal "${modalKey}" into ${placeholderId}:`, err);
      if(placeholder) placeholder.innerHTML = `<p style="color:red; padding:1em;">Error: Exception while loading ${modalKey}.</p>`;
      return null;
    }
  }

  function dispatchSafeEvent(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (e) {
      console.error(`Failed to dispatch event: ${name}`, e);
    }
  }

  const themeButtons = document.querySelectorAll('#fabThemeToggle, #theme-toggle-desktop, #theme-toggle-mobile, #mobile-theme-toggle');
  const languageButtons = document.querySelectorAll('#fabLanguageToggle, #language-toggle-desktop, #mobile-language-toggle');

  function updateThemeButton(btn, theme, lang) {
    if (!btn) return;
    const span = btn.querySelector('span');
    const enLabelKey = theme === 'dark' ? 'enLabelLight' : 'enLabelDark';
    const currentLangLabelKey = theme === 'dark' ? `${lang}LabelLight` : `${lang}LabelDark`;
    const enTextKey = theme === 'dark' ? 'enLight' : 'enDark';
    const currentLangTextKey = theme === 'dark' ? `${lang}Light` : `${lang}Dark`;

    const label = btn.dataset[currentLangLabelKey] || btn.dataset[enLabelKey] || (theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    const text = btn.dataset[currentLangTextKey] || btn.dataset[enTextKey] || (theme === 'dark' ? 'Light' : 'Dark');

    if (label) {
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
    if (span) {
      span.textContent = text;
    } else {
      btn.textContent = text;
    }
  }

  function updateLanguageButton(btn, targetLang) {
    if (!btn) return;
    const span = btn.querySelector('span');
    const currentLang = document.documentElement.lang || 'en';
    const buttonText = targetLang === 'es' ? (btn.dataset.es || 'ES') : (btn.dataset.en || 'EN');
    let label;
    if (currentLang === 'en') {
      label = btn.dataset.enLabel || 'Switch to Spanish';
    } else {
      label = btn.dataset.esLabel || 'Cambiar a Inglés';
    }

    if (label) {
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
    if (span) {
      span.textContent = buttonText;
    } else {
      btn.textContent = buttonText;
    }
  }

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const lang = html.getAttribute('lang') || 'en';
    themeButtons.forEach(btn => updateThemeButton(btn, theme, lang));
    dispatchSafeEvent('theme-change', { theme });
    if (typeof window.updateDynamicContentLanguage === 'function') {
      window.updateDynamicContentLanguage(document);
    }
  }

  function applyLanguage(lang) {
    html.setAttribute('lang', lang);
    localStorage.setItem('language', lang);
    languageButtons.forEach(btn => updateLanguageButton(btn, lang === 'en' ? 'es' : 'en'));
    const theme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    themeButtons.forEach(btn => updateThemeButton(btn, theme, lang));
    dispatchSafeEvent('language-change', { lang });
    if (typeof window.updateDynamicContentLanguage === 'function') {
      window.updateDynamicContentLanguage(document);
    }
  }

  languageButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentLang = html.lang === 'es' ? 'es' : 'en';
      const newLang = currentLang === 'en' ? 'es' : 'en';
      applyLanguage(newLang);
    });
  });

  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  });

  function setFocusableChildren(container, isVisible) {
    if (!container) return;
    const focusableElements = container.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
    );
    focusableElements.forEach(el => {
      if (isVisible) {
        const originalTabIndex = el.dataset.originalTabindex;
        if (originalTabIndex) {
          el.setAttribute('tabindex', originalTabIndex);
          el.removeAttribute('data-original-tabindex');
        } else {
          el.removeAttribute('tabindex');
        }
      } else {
        const currentTabIndex = el.getAttribute('tabindex');
        if (currentTabIndex !== '-1') {
          if (currentTabIndex) {
            el.dataset.originalTabindex = currentTabIndex;
          }
          el.setAttribute('tabindex', '-1');
        }
      }
    });
  }

  const horizFab = document.getElementById('horizontalNavFab');
  const horizNav = document.getElementById('horizontalMobileNav');
  if (horizFab && horizNav) {
    setFocusableChildren(horizNav, horizNav.classList.contains('active')); // Sync with class
    horizFab.addEventListener('click', () => {
      const isOpen = horizNav.classList.toggle('active');
      horizFab.setAttribute('aria-expanded', String(isOpen));
      horizNav.setAttribute('aria-hidden', String(!isOpen)); // Keep aria-hidden
      setFocusableChildren(horizNav, isOpen);
       if (isOpen) { // Auto-close services menu if horizNav opens
        if (servicesMenu && servicesMenu.classList.contains('active')) {
            servicesToggle.click(); // Simulate click to close it
        }
      }
    });
  }

  const servicesToggle = document.getElementById('horizontalServicesToggle');
  const servicesMenu = document.getElementById('horizontalServicesMenu');
  if (servicesToggle && servicesMenu) {
    setFocusableChildren(servicesMenu, servicesMenu.classList.contains('active')); // Sync with class
    servicesToggle.addEventListener('click', () => {
      const isOpen = servicesMenu.classList.toggle('active');
      servicesToggle.setAttribute('aria-expanded', String(isOpen));
      servicesMenu.setAttribute('aria-hidden', String(!isOpen)); // Keep aria-hidden
      setFocusableChildren(servicesMenu, isOpen);
    });
  }

  // Close FAB menus if clicking outside
  document.addEventListener('click', (event) => {
    if (horizNav && horizNav.classList.contains('active') && !horizFab.contains(event.target) && !horizNav.contains(event.target)) {
        horizFab.click(); // Simulate click to close
    }
    if (servicesMenu && servicesMenu.classList.contains('active') && !servicesToggle.contains(event.target) && !servicesMenu.contains(event.target)) {
        servicesToggle.click(); // Simulate click to close
    }
  });


  const mobileServicesToggle = document.getElementById('mobile-services-toggle');
  const mobileServicesMenu = document.getElementById('mobile-services-menu');
  if (mobileServicesToggle && mobileServicesMenu) {
    setFocusableChildren(mobileServicesMenu, mobileServicesMenu.classList.contains('active'));
    mobileServicesToggle.addEventListener('click', () => {
      const isExpanded = mobileServicesMenu.classList.toggle('active');
      mobileServicesToggle.setAttribute('aria-expanded', String(isExpanded));
      mobileServicesMenu.setAttribute('aria-hidden', String(!isExpanded));
      setFocusableChildren(mobileServicesMenu, isExpanded);
    });
  }

  const menuOpenBtn = document.getElementById('menu-open');
  const menuCloseBtn = document.getElementById('menu-close');
  const rightSideMenu = document.getElementById('rightSideMenu');
  if (menuOpenBtn && menuCloseBtn && rightSideMenu) {
    const openMenu = () => {
      rightSideMenu.classList.add('active');
      rightSideMenu.setAttribute('aria-hidden', 'false');
      menuOpenBtn.setAttribute('aria-expanded', 'true');
      setFocusableChildren(rightSideMenu, true);
    };
    const closeMenu = () => {
      rightSideMenu.classList.remove('active');
      rightSideMenu.setAttribute('aria-hidden', 'true');
      menuOpenBtn.setAttribute('aria-expanded', 'false');
      setFocusableChildren(rightSideMenu, false);
    };
    menuOpenBtn.addEventListener('click', openMenu);
    menuCloseBtn.addEventListener('click', closeMenu);
    // Initialize focus state for rightSideMenu
    setFocusableChildren(rightSideMenu, rightSideMenu.classList.contains('active'));
  }

  const deskServicesBtn = document.querySelector('#rightSideMenu .services-trigger > button');
  const deskServicesMenu = document.querySelector('#rightSideMenu #servicesSubMenu');
  if (deskServicesBtn && deskServicesMenu) {
    // Initialize focus state for deskServicesMenu
    setFocusableChildren(deskServicesMenu, deskServicesMenu.classList.contains('active'));
    deskServicesBtn.addEventListener('click', () => {
      const isExpanded = deskServicesMenu.classList.toggle('active');
      deskServicesBtn.setAttribute('aria-expanded', String(isExpanded));
      // No aria-hidden needed if visibility is controlled by parent's state or CSS display
      setFocusableChildren(deskServicesMenu, isExpanded);
    });
  }

  // Modals: Open/Toggle Handler
  try {
    document.querySelectorAll('[data-modal]').forEach(button => {
      const modalKey = button.getAttribute('data-modal');
      if (!modalKey) {
          console.warn('Button has data-modal attribute but no value.', button);
          return;
      }
      if (!button.id) {
        button.id = `modal-trigger-${modalKey}-${Math.random().toString(36).substr(2, 9)}`;
      }

      button.addEventListener('click', async () => {
        console.log(`Modal trigger clicked for: ${modalKey}, button ID: ${button.id}`);
        const mapEntry = modalMap[modalKey];
        if (!mapEntry) {
            console.error(`No modalMap entry for modalKey: ${modalKey}`);
            return;
        }

        // Use the placeholderId to find if a specific instance for this modalKey already exists
        const placeholderId = `placeholder-for-${mapEntry.id}-${modalKey}`;
        const placeholderElement = document.getElementById(placeholderId);
        let modalInSpecificPlaceholder = null;

        if (placeholderElement) {
          modalInSpecificPlaceholder = placeholderElement.querySelector(`#${mapEntry.id}`);
        }

        // If a specific instance for this modalKey is found and is active, close it.
        if (modalInSpecificPlaceholder && modalInSpecificPlaceholder.classList.contains('active')) {
          console.log(`Modal ${mapEntry.id} (for ${modalKey}) is active in its placeholder, calling closeModalUtility.`);
          closeModalUtility(modalInSpecificPlaceholder, button);
        } else {
          // If not active or not loaded for this specific modalKey, then load/show it.
          // loadModal is responsible for either creating a new modal instance in its placeholder
          // or re-using/updating an existing one if found in its correct placeholder.
          console.log(`Modal ${mapEntry.id} (for ${modalKey}) is not active or its specific instance not found/loaded. Attempting to load/show.`);

          // Always call loadModal to ensure the correct content is loaded for the specific modalKey.
          // loadModal will handle the logic of creating a new instance or updating an existing one within the correct placeholder.
          const modalToShow = await loadModal(modalKey, button.id);

          if (modalToShow) {
            console.log(`Showing modal ${modalToShow.id} (for ${modalKey}).`); // Log the actual ID shown
            modalToShow.classList.add('active');
            modalToShow.setAttribute('aria-hidden', 'false');
            // attachModalHandlers should have been called by loadModal or above
            // It's important that attachModalHandlers also sets up focus trap or initial focus.
            // For now, direct focus setting:
            setTimeout(() => {
              const focusable = modalToShow.querySelector('input, textarea, button, [href], select, details, [tabindex]:not([tabindex="-1"])');
              if (focusable) {
                focusable.focus();
              } else {
                 // Fallback focus to the modal itself if no focusable children found
                 modalToShow.setAttribute('tabindex', '-1'); // Make modal focusable
                 modalToShow.focus();
              }
            }, 100);
          } else {
            console.error(`Modal with key ${modalKey} (ID: ${mapEntry.id}) could not be found or loaded.`);
          }
        }
      });
    });
  } catch (error) {
    console.error("Error setting up modal trigger listeners:", error);
  }

  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme || (body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'));

  const savedLang = localStorage.getItem('language');
  applyLanguage(savedLang || (html.getAttribute('lang') === 'es' ? 'es' : 'en'));
});
