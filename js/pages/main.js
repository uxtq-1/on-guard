// js/pages/main.js

import { initializeContactModal } from './contact_us.js';
import { initializeJoinUsModal } from './join_us.js';
import { initializeChatbotModal } from './chatbot.js';

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;

  // Map modal IDs to their corresponding HTML fragment
  const modalMap = {
    'contact-modal': 'contact_us_modal.html',
    'join-us-modal': 'join_us_modal.html',
    'chatbot-modal': 'chatbot_modal.html',
    'business-operations-service-modal': 'business_operations_modal.html',
    'contact-center-service-modal': 'contact_center_modal.html',
    'it-support-service-modal': 'it_support_modal.html',
    'professionals-service-modal': 'professionals_modal.html',
    'generic-service-modal': 'generic_service_modal.html'
  };

  async function loadModal(modalId) {
    const existing = document.getElementById(modalId);
    if (existing) return existing;

    const placeholder = document.getElementById(`${modalId}-placeholder`);
    const file = modalMap[modalId];
    if (!placeholder || !file) return null;

    try {
      const resp = await fetch(`html/modals/${file}`);
      if (!resp.ok) throw new Error(`Failed to fetch ${file}`);
      placeholder.innerHTML = await resp.text();
      const modal = document.getElementById(modalId);
      // Initialize modal specific scripts
      if (modalId === 'contact-modal') initializeContactModal(modal);
      if (modalId === 'join-us-modal') initializeJoinUsModal(modal);
      if (modalId === 'chatbot-modal') initializeChatbotModal(modal);
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
      if (target.classList.contains('modal') || target.hasAttribute('data-close')) {
        modal.classList.remove('active');
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

  // Language Toggle
  const langBtn = document.getElementById('fabLanguageToggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentLang = html.lang === 'es' ? 'es' : 'en';
      const newLang = currentLang === 'en' ? 'es' : 'en';
      html.setAttribute('lang', newLang);
      localStorage.setItem('language', newLang);
      dispatchSafeEvent('language-change', { lang: newLang });
    });
  }

  // Theme Toggle
  const themeBtn = document.getElementById('fabThemeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      dispatchSafeEvent('theme-change', { theme: newTheme });
    });
  }

  // FAB: Horizontal Nav Toggle
  const horizFab = document.getElementById('horizontalNavFab');
  const horizNav = document.getElementById('horizontalMobileNav');
  if (horizFab && horizNav) {
    horizFab.addEventListener('click', () => {
      const isOpen = horizNav.classList.toggle('active');
      horizFab.setAttribute('aria-expanded', String(isOpen));
      horizNav.setAttribute('aria-hidden', String(!isOpen));
    });
  }

  // FAB: Services Submenu Toggle
  const servicesToggle = document.getElementById('horizontalServicesToggle');
  const servicesMenu = document.getElementById('horizontalServicesMenu');
  if (servicesToggle && servicesMenu) {
    servicesToggle.addEventListener('click', () => {
      const expanded = servicesToggle.getAttribute('aria-expanded') === 'true';
      servicesToggle.setAttribute('aria-expanded', String(!expanded));
      servicesMenu.setAttribute('aria-hidden', String(expanded));
      servicesMenu.classList.toggle('active');
    });
  }

  // Modals: Open Handler
  document.querySelectorAll('[data-modal]').forEach(button => {
    const modalId = button.getAttribute('data-modal');
    button.addEventListener('click', async () => {
      let modal = document.getElementById(modalId);
      if (!modal) modal = await loadModal(modalId);
      if (modal) {
        modal.classList.add('active');
        setTimeout(() => {
          const focusable = modal.querySelector('input, textarea, button');
          if (focusable) focusable.focus();
        }, 100);
      }
    });
  });

  // Modals: Close Handler
  document.querySelectorAll('.modal').forEach(attachModalClose);

  // Sync saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    body.setAttribute('data-theme', savedTheme);
  }

  // Sync saved language
  const savedLang = localStorage.getItem('language');
  if (savedLang === 'es' || savedLang === 'en') {
    html.setAttribute('lang', savedLang);
  }

  // Update dynamic content (if available)
  if (typeof window.updateDynamicContentLanguage === 'function') {
    window.updateDynamicContentLanguage(document);
  }
});
