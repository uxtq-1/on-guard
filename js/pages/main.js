// js/pages/main.js

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;

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
    const modal = document.getElementById(modalId);
    if (modal) {
      button.addEventListener('click', () => {
        modal.classList.add('active');
        setTimeout(() => {
          const focusable = modal.querySelector('input, textarea, button');
          if (focusable) focusable.focus();
        }, 100);
      });
    }
  });

  // Modals: Close Handler
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      const target = e.target;
      if (target.classList.contains('modal') || target.hasAttribute('data-close')) {
        modal.classList.remove('active');
      }
    });
  });

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
