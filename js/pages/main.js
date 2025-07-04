// js/pages/main.js

import { initializeContactModal } from './contact_us.js';
import { initializeJoinUsModal } from './join_us.js';
import { initializeChatbotModal } from './chatbot.js';
import { updateDynamicContentLanguage } from '../utils/i18n.js';

// Expose the i18n helper globally for pages that expect it
window.updateDynamicContentLanguage = updateDynamicContentLanguage;

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;

  // Map modal triggers to their HTML file and actual overlay ID
  const modalMap = {
    'contact-modal': {
      file: 'contact_us_modal.html',
      id: 'contact-modal'
    },
    'join-us-modal': {
      file: 'join_us_modal.html',
      id: 'join-us-modal'
    },
    'chatbot-modal': {
      file: 'chatbot_modal.html',
      id: 'chatbot-modal'
    },
    'business-operations-service-modal': {
      file: 'business_operations_modal.html',
      id: 'business-operations-modal'
    },
    'contact-center-service-modal': {
      file: 'contact_center_modal.html',
      id: 'contact-center-modal'
    },
    'it-support-service-modal': {
      file: 'it_support_modal.html',
      id: 'it-support-modal'
    },
    'professionals-service-modal': {
      file: 'professionals_modal.html',
      id: 'professionals-modal'
    },
    'generic-service-modal': {
      file: 'generic_service_modal.html',
      id: 'generic-service-modal'
    }
  };

  async function loadModal(modalId) {
    const mapEntry = modalMap[modalId];
    if (!mapEntry) return null;

    const existing = document.getElementById(mapEntry.id);
    if (existing) return existing;

    const file = mapEntry.file;

    let placeholder = document.getElementById(`${modalId}-placeholder`);
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.id = `${modalId}-placeholder`;
      document.body.appendChild(placeholder);
    }

    try {
      const resp = await fetch(`html/modals/${file}`);
      if (!resp.ok) throw new Error(`Failed to fetch ${file}`);
      placeholder.innerHTML = await resp.text();
      const modal = document.getElementById(mapEntry.id);
      // Initialize modal specific scripts
      if (modalId === 'contact-modal') initializeContactModal(modal);
      if (modalId === 'join-us-modal') initializeJoinUsModal(modal);
      if (modalId === 'chatbot-modal') initializeChatbotModal(modal);

      if (modal && !modal.classList.contains('active')) {
          modal.setAttribute('aria-hidden', 'true');
      }

      // Apply current language to the newly loaded modal content
      if (modal && typeof updateDynamicContentLanguage === 'function') {
        updateDynamicContentLanguage(modal);
      }

      attachModalClose(modal);
      return modal;
    } catch (err) {
      console.error('Modal load failed:', err);
      return null;
    }
  }

  function attachModalClose(modal) {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      const target = e.target;
      // Close when clicking backdrop or elements with data-close
      if (target === modal || target.classList.contains('modal-overlay') ||
          target.hasAttribute('data-close')) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Safe utility to dispatch custom events
  function dispatchSafeEvent(name, detail = {}) {
    try {
      window.dispatchEvent(new CustomEvent(name, { detail }));
    } catch (e) {
      console.error(`Failed to dispatch event: ${name}`, e);
    }
  }

  const themeButtons = document.querySelectorAll(
    '#fabThemeToggle, #theme-toggle-desktop, #theme-toggle-mobile, #mobile-theme-toggle'
  );
  const languageButtons = document.querySelectorAll(
    '#fabLanguageToggle, #language-toggle-desktop, #mobile-language-toggle'
  );

  function updateThemeButton(btn, theme, lang) {
    if (!btn) return;
    const span = btn.querySelector('span');
    const labelKey = theme === 'dark' ? `${lang}LabelLight` : `${lang}LabelDark`;
    const textKey = theme === 'dark' ? `${lang}Light` : `${lang}Dark`;
    const label = btn.dataset[labelKey] || btn.dataset[`enLabel${theme === 'dark' ? 'Light' : 'Dark'}`];
    const text = btn.dataset[textKey] || btn.dataset[`en${theme === 'dark' ? 'Light' : 'Dark'}`] || (theme === 'dark' ? 'Light' : 'Dark');
    if (label) {
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
    if (span) span.textContent = text; else btn.textContent = text;
  }

  function updateLanguageButton(btn, targetLang) {
    if (!btn) return;
    const span = btn.querySelector('span');
    const text = targetLang === 'en' ? (btn.dataset.en || 'EN') : (btn.dataset.es || 'ES');
    const activeLang = document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en';
    const label = activeLang === 'en'
      ? (btn.dataset.enLabel || 'Switch to Spanish')
      : (btn.dataset.esLabel || 'Cambiar a Inglés');
    if (label) {
      btn.setAttribute('title', label);
      btn.setAttribute('aria-label', label);
    }
    if (span) span.textContent = text; else btn.textContent = text;
  }

  function applyTheme(theme) {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const lang = html.getAttribute('lang') || 'en';
    themeButtons.forEach(btn => updateThemeButton(btn, theme, lang));
    dispatchSafeEvent('theme-change', { theme });
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

  // Helper function to manage focusable children within a toggled container
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
          // If there was no specific original tabindex, remove the one we might have set.
          // This allows elements like <a> or <button> to revert to their default focusable state.
          // Or if they had tabindex="-1" initially and should remain so (though query excludes this).
          if (el.getAttribute('tabindex') === '-1' && !el.hasAttribute('data-original-tabindex')) {
            // This case should ideally not be hit if the element was truly meant to be non-focusable permanently
          } else {
            el.removeAttribute('tabindex');
          }
        }
      } else { // isVisible is false, so hide
        const currentTabIndex = el.getAttribute('tabindex');
        // Only store and change if not already -1
        if (currentTabIndex !== '-1') {
          if (currentTabIndex) { // Store if it's something like "0", "1", etc.
            el.dataset.originalTabindex = currentTabIndex;
          } else {
            // If no tabindex attribute, it's focusable by default (e.g. <a>, <button>)
            // We don't need to store 'undefined' but will set to -1.
            // data-original-tabindex will remain unset for these.
          }
          el.setAttribute('tabindex', '-1');
        }
      }
    });
  }

  // FAB: Horizontal Nav Toggle
  const horizFab = document.getElementById('horizontalNavFab');
  const horizNav = document.getElementById('horizontalMobileNav');
  if (horizFab && horizNav) {
    // Initialize focus state based on initial aria-hidden
    setFocusableChildren(horizNav, horizNav.getAttribute('aria-hidden') === 'false');

    horizFab.addEventListener('click', () => {
      const isOpen = horizNav.classList.toggle('active');
      horizFab.setAttribute('aria-expanded', String(isOpen));
      horizNav.setAttribute('aria-hidden', String(!isOpen));
      setFocusableChildren(horizNav, isOpen);
    });
  }

  // FAB: Services Submenu Toggle
  const servicesToggle = document.getElementById('horizontalServicesToggle');
  const servicesMenu = document.getElementById('horizontalServicesMenu');
  if (servicesToggle && servicesMenu) {
    // Initialize focus state
    setFocusableChildren(servicesMenu, servicesMenu.getAttribute('aria-hidden') === 'false');

    servicesToggle.addEventListener('click', () => {
      const expanded = servicesToggle.getAttribute('aria-expanded') !== 'true'; // Check current state before toggle
      servicesToggle.setAttribute('aria-expanded', String(expanded));
      servicesMenu.setAttribute('aria-hidden', String(!expanded));
      servicesMenu.classList.toggle('active');
      setFocusableChildren(servicesMenu, expanded);
    });
  }

  // Mobile Services Sub-Menu Toggle (from mobile_nav.html)
  const mobileServicesToggle = document.getElementById('mobile-services-toggle');
  const mobileServicesMenu = document.getElementById('mobile-services-menu');

  if (mobileServicesToggle && mobileServicesMenu) {
    // Initialize focus state
    setFocusableChildren(mobileServicesMenu, mobileServicesMenu.getAttribute('aria-hidden') === 'false');

    mobileServicesToggle.addEventListener('click', () => {
      const isExpanded = mobileServicesToggle.getAttribute('aria-expanded') !== 'true';
      mobileServicesToggle.setAttribute('aria-expanded', String(isExpanded));
      mobileServicesMenu.setAttribute('aria-hidden', String(!isExpanded));
      mobileServicesMenu.classList.toggle('active'); // Assuming 'active' class controls visibility
      setFocusableChildren(mobileServicesMenu, isExpanded);
    });
  }

  // Desktop Right Side Menu Toggle
  const menuOpenBtn = document.getElementById('menu-open');
  const menuCloseBtn = document.getElementById('menu-close');
  const rightSideMenu = document.getElementById('rightSideMenu');
  if (menuOpenBtn && menuCloseBtn && rightSideMenu) {
    const openMenu = () => {
      rightSideMenu.classList.add('active');
      rightSideMenu.setAttribute('aria-hidden', 'false');
      menuOpenBtn.setAttribute('aria-expanded', 'true');
    };
    const closeMenu = () => {
      rightSideMenu.classList.remove('active');
      rightSideMenu.setAttribute('aria-hidden', 'true');
      menuOpenBtn.setAttribute('aria-expanded', 'false');
    };
    menuOpenBtn.addEventListener('click', openMenu);
    menuCloseBtn.addEventListener('click', closeMenu);
  }

  // Desktop Services Submenu Toggle
  const deskServicesBtn = document.querySelector('#rightSideMenu .services-trigger > button');
  const deskServicesMenu = document.querySelector('#rightSideMenu #servicesSubMenu');
  if (deskServicesBtn && deskServicesMenu) {
    deskServicesBtn.addEventListener('click', () => {
      const expanded = deskServicesBtn.getAttribute('aria-expanded') === 'true';
      deskServicesBtn.setAttribute('aria-expanded', String(!expanded));
      deskServicesMenu.classList.toggle('active');
    });
  }

  // Modals: Open Handler
  document.querySelectorAll('[data-modal]').forEach(button => {
    const modalKey = button.getAttribute('data-modal');
    button.addEventListener('click', async () => {
      const mapEntry = modalMap[modalKey] || { id: modalKey };
      let modal = document.getElementById(mapEntry.id);
      if (!modal) modal = await loadModal(modalKey);
      if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(() => {
          const focusable = modal.querySelector('input, textarea, button');
          if (focusable) focusable.focus();
        }, 100);
      }
    });
  });

  // Modals: Close Handler
  document.querySelectorAll('.modal-overlay').forEach(attachModalClose);

  // Close active modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.active').forEach(m => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
      });
    }
  });

  // Sync saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
  } else {
    applyTheme(body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  }

  // Sync saved language
  const savedLang = localStorage.getItem('language');
  if (savedLang === 'es' || savedLang === 'en') {
    applyLanguage(savedLang);
  } else {
    applyLanguage(html.getAttribute('lang') === 'es' ? 'es' : 'en');
  }
});
