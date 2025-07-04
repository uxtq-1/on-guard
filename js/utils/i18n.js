export function updateDynamicContentLanguage(root = document) {
  const lang = document.documentElement.getAttribute('lang') || 'en';

  root.querySelectorAll('[data-en], [data-es]').forEach(el => {
    const text = el.dataset[lang];
    if (typeof text !== 'undefined') {
      el.textContent = text;
    }
  });

  root.querySelectorAll('[data-en-placeholder], [data-es-placeholder]').forEach(el => {
    const placeholder = el.dataset[`${lang}Placeholder`];
    if (typeof placeholder !== 'undefined') {
      el.setAttribute('placeholder', placeholder);
    }
  });

  root.querySelectorAll('[data-en-label], [data-es-label]').forEach(el => {
    const label = el.dataset[`${lang}Label`];
    if (typeof label !== 'undefined') {
      el.setAttribute('aria-label', label);
      if (el.hasAttribute('title') || el.dataset[`${lang}Title`]) {
        el.setAttribute('title', label);
      }
    }
  });

  root.querySelectorAll('[data-en-title], [data-es-title]').forEach(el => {
    const title = el.dataset[`${lang}Title`];
    if (typeof title !== 'undefined') {
      el.setAttribute('title', title);
    }
  });
}

if (typeof window !== 'undefined') {
  window.updateDynamicContentLanguage = updateDynamicContentLanguage;
}
