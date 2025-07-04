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

  function updateLanguageButton(btn, lang) {
    if (!btn) return;
    const span = btn.querySelector('span');
    const text = lang === 'en' ? (btn.dataset.en || 'EN') : (btn.dataset.es || 'ES');
    const label = lang === 'en' ? (btn.dataset.enLabel || 'Switch to Spanish') : (btn.dataset.esLabel || 'Cambiar a Inglés');
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
