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
        // console.log('[SW] Registration successful:', reg.scope);
      })
      .catch(err => {
        console.error('[SW] Registration failed:', err);
      });
  } else {
    // console.log('[SW] Service workers are not supported in this browser.');
  }
  
  const body = document.body;
  const html = document.documentElement;
  const modalMap = {
    'contact-modal': { file: 'contact_us_modal.html', id: 'contact-modal' },
    'join-us-modal': { file: 'join_us_modal.html', id: 'join-us-modal' },
    'business-operations-service-modal': { file: 'business_operations_modal.html', id: 'business-operations-modal' },
    'contact-center-service-modal': { file: 'contact_center_modal.html', id: 'contact-center-modal' },
    'it-support-service-modal': { file: 'it_support_modal.html', id: 'it-support-modal' },
    'professionals-service-modal': { file: 'professionals_modal.html', id: 'professionals-modal' },
    'ai-chatbot-modal': { file: 'chatbot_modal.html', id: 'ai-chatbot-modal' }
  };

  async function loadModal(modalKey, triggerButtonId) {
    // DEBUG log removed as per plan
    const mapEntry = modalMap[modalKey];
    if (!mapEntry) {
      console.error(`Modal key "${modalKey}" not found in modalMap.`);
      return null;
    }

    let modalElement = document.getElementById(mapEntry.id);
    if (modalElement) {
      // console.log(`Modal "${mapEntry.id}" already exists in DOM.`);
      if (triggerButtonId) modalElement.dataset.triggerId = triggerButtonId;
      // Ensure handlers are attached, attachModalHandlers should be idempotent
      attachModalHandlers(modalElement);
      return modalElement;
    }

    const filePath = mapEntry.isFullPath
      ? mapEntry.file
      : new URL(`../../html/modals/${mapEntry.file}`, import.meta.url).pathname;
    const placeholderId = `${modalKey}-placeholder`;
    let placeholder = document.getElementById(placeholderId);
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = placeholderId;
      document.body.appendChild(placeholder);
    }
    try {
      // console.log(`Fetching modal HTML from: ${filePath}`);
      const resp = await fetch(filePath);
      if (!resp.ok) {
        console.error(`Failed to fetch modal HTML for "${modalKey}" from ${filePath}. Status: ${resp.status}`);
        placeholder.innerHTML = `<p style="color:red; padding:1em;">Error: Could not load content for ${modalKey}.</p>`;
        return null;
      }
      const modalHTML = await resp.text();
      placeholder.innerHTML = modalHTML;
      modalElement = placeholder.querySelector(`#${mapEntry.id}`); // Search again within the placeholder after injecting HTML
      if (!modalElement) {
        console.error(`Modal element with ID "${mapEntry.id}" not found in fetched HTML for "${modalKey}" (loaded into ${placeholderId}). Check structure of ${mapEntry.file}.`);
        return null;
      }
      // console.log(`Modal "${mapEntry.id}" loaded successfully.`);
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

  const themeButtons = document.querySelectorAll('#fabThemeToggle, #theme-toggle-desktop');
  const languageButtons = document.querySelectorAll('#fabLanguageToggle, #language-toggle-desktop');

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

  // const mobileServicesToggle = document.getElementById('mobile-services-toggle'); // Part of old mobile_nav.html
  // const mobileServicesMenu = document.getElementById('mobile-services-menu'); // Part of old mobile_nav.html
  // if (mobileServicesToggle && mobileServicesMenu) {
    // setFocusableChildren(mobileServicesMenu, mobileServicesMenu.classList.contains('active'));
    // mobileServicesToggle.addEventListener('click', () => {
      // const isExpanded = mobileServicesMenu.classList.toggle('active');
      // mobileServicesToggle.setAttribute('aria-expanded', String(isExpanded));
      // mobileServicesMenu.setAttribute('aria-hidden', String(!isExpanded));
      // setFocusableChildren(mobileServicesMenu, isExpanded);
    // });
  // }

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

      button.addEventListener('click', async (e) => {
        if (button.tagName.toLowerCase() === 'a') e.preventDefault();
        try {
          // console.log(`Modal trigger clicked for: ${modalKey}, button ID: ${button.id}`);
          const mapEntry = modalMap[modalKey];
          if (!mapEntry) {
              console.error(`No modalMap entry for modalKey: ${modalKey}`);
              return;
          }

          let modalElement = document.getElementById(mapEntry.id);

          if (modalElement && modalElement.classList.contains('active')) {
            // console.log(`Modal ${mapEntry.id} is active, calling closeModalUtility.`);
            closeModalUtility(modalElement, button); // Pass button as the trigger

          } else {
            // console.log(`Modal ${mapEntry.id} is not active or not loaded. Attempting to load/show.`);
            if (!modalElement) {
              modalElement = await loadModal(modalKey, button.id);
            } else {
              // Modal exists but is not active, ensure triggerId is set
              modalElement.dataset.triggerId = button.id;
              // Ensure handlers are attached if it was already in DOM but hidden
              attachModalHandlers(modalElement);
            }

            if (modalElement) {
              // console.log(`Showing modal ${mapEntry.id}.`);
              modalElement.classList.add('active');
              modalElement.setAttribute('aria-hidden', 'false');
              // attachModalHandlers should have been called by loadModal or above
              // It's important that attachModalHandlers also sets up focus trap or initial focus.
              // For now, direct focus setting:
              setTimeout(() => {
                const focusable = modalElement.querySelector('input, textarea, button, [href], select, details, [tabindex]:not([tabindex="-1"])');
                if (focusable) {
                  focusable.focus();
                } else {
                   // Fallback focus to the modal itself if no focusable children found
                   modalElement.setAttribute('tabindex', '-1'); // Make modal focusable
                   modalElement.focus();
                }
              }, 100);
            } else {
              console.error(`Modal with key ${modalKey} (ID: ${mapEntry.id}) could not be found or loaded.`);
            }
          }
        } catch (e) {
          console.error("Error in modal click handler for modalKey:", modalKey, "button ID:", button.id, e);
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
