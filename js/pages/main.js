// js/pages/main.js

document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const html = document.documentElement;

  // Language Toggle
  const langBtn = document.getElementById('fabLanguageToggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      const currentLang = html.lang || 'en';
      const newLang = currentLang === 'en' ? 'es' : 'en';
      html.lang = newLang;
      localStorage.setItem('language', newLang);
      window.dispatchEvent(new CustomEvent('language-change', { detail: { lang: newLang } }));
    });
  }

  // Theme Toggle
  const themeBtn = document.getElementById('fabThemeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      window.dispatchEvent(new CustomEvent('theme-change', { detail: { theme: newTheme } }));
    });
  }

  // FAB toggle for horizontal nav
  const horizFab = document.getElementById('horizontalNavFab');
  const horizNav = document.getElementById('horizontalMobileNav');
  if (horizFab && horizNav) {
    horizFab.addEventListener('click', () => {
      const isOpen = horizNav.classList.toggle('active');
      horizFab.setAttribute('aria-expanded', isOpen);
      horizNav.setAttribute('aria-hidden', !isOpen);
    });
  }

  // Horizontal Services Toggle
  const horizServicesToggle = document.getElementById('horizontalServicesToggle');
  const horizServicesMenu = document.getElementById('horizontalServicesMenu');
  if (horizServicesToggle && horizServicesMenu) {
    horizServicesToggle.addEventListener('click', () => {
      const expanded = horizServicesToggle.getAttribute('aria-expanded') === 'true';
      horizServicesToggle.setAttribute('aria-expanded', String(!expanded));
      horizServicesMenu.setAttribute('aria-hidden', String(expanded));
      horizServicesMenu.classList.toggle('active');
    });
  }

  // Modal Launchers
  document.querySelectorAll('[data-modal]').forEach(button => {
    const modalId = button.dataset.modal;
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

  // Modal Close
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') || e.target.dataset.close !== undefined) {
        modal.classList.remove('active');
      }
    });
  });

  // Sync Theme and Language on Load
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) body.setAttribute('data-theme', savedTheme);

  const savedLang = localStorage.getItem('language');
  if (savedLang) html.lang = savedLang;

  // Global language change dispatch
  window.updateDynamicContentLanguage?.(document);
});
