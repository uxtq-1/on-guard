export function updateDynamicContentLanguage(root = document) {
  const lang = document.documentElement.getAttribute('lang') === 'es' ? 'es' : 'en';

  root.querySelectorAll('[data-en],[data-es]').forEach(el => {
    if (el.dataset[lang]) el.textContent = el.dataset[lang];
  });

  root.querySelectorAll('[data-en-placeholder],[data-es-placeholder]').forEach(el => {
    const val = el.dataset[`${lang}Placeholder`];
    if (val !== undefined) el.setAttribute('placeholder', val);
  });

  root.querySelectorAll('[data-en-label],[data-es-label]').forEach(el => {
    const val = el.dataset[`${lang}Label`];
    if (val !== undefined) el.setAttribute('aria-label', val);
  });

  root.querySelectorAll('[data-en-title],[data-es-title]').forEach(el => {
    const val = el.dataset[`${lang}Title`];
    if (val !== undefined) el.setAttribute('title', val);
  });

  root.querySelectorAll('[data-en-text],[data-es-text]').forEach(el => {
    const val = el.dataset[`${lang}Text`];
    if (val !== undefined) {
      const span = el.querySelector('span');
      if (span) span.textContent = val; else el.textContent = val;
    }
  });

  root.querySelectorAll('[data-en-value],[data-es-value]').forEach(el => {
    const val = el.dataset[`${lang}Value`];
    if (val !== undefined) el.value = val;
  });

  root.querySelectorAll('[data-en-html],[data-es-html]').forEach(el => {
    const val = el.dataset[`${lang}Html`];
    if (val !== undefined) el.innerHTML = val;
  });
}

if (typeof window !== 'undefined') {
  window.updateDynamicContentLanguage = updateDynamicContentLanguage;
}
