// join.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('join-form');
  const thankYouContainer = document.getElementById('thank-you');
  const progressFill = thankYouContainer.querySelector('.progress-fill');

  // ----- LANGUAGE HANDLER -----
  function updateTextByLang() {
    const currentLang = document.documentElement.lang;
    // Update placeholders for all inputs & textareas
    document.querySelectorAll('input[data-en][data-es], textarea[data-en][data-es]').forEach((el) => {
      const text = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
      el.placeholder = text;
    });
    // Update labels, buttons, title, and thank-you message
    document.querySelectorAll('[data-en][data-es]').forEach((el) => {
      if (
        el.tagName.toLowerCase() === 'label' ||
        el.tagName.toLowerCase() === 'button' ||
        el.tagName.toLowerCase() === 'h1' ||
        el.tagName.toLowerCase() === 'title'
      ) {
        const text = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        el.textContent = text;
      }
      if (el.id === 'thank-you') {
        const msg = currentLang === 'en' ? el.getAttribute('data-en') : el.getAttribute('data-es');
        el.childNodes[0].nodeValue = msg;
      }
    });
  }

  // Initial language setup
  updateTextByLang();
  document.getElementById('lang-toggle').addEventListener('click', updateTextByLang);


  // ----- ADD / REMOVE FIELD LOGIC -----
  function handleAddClick(fieldKey) {
    // Find the multi-field container by data-field
    const multiField = document.querySelector(`.multi-field[data-field="${fieldKey}"]`);
    if (!multiField) return;

    // Clone the first .field-row inside this container
    const firstRow = multiField.querySelector('.field-row');
    if (!firstRow) return;

    const newRow = firstRow.cloneNode(true);
    // Clear values in cloned inputs/textareas
    newRow.querySelectorAll('input, textarea').forEach((el) => {
      el.value = '';
    });

    // Attach add/remove listeners on the cloned row
    const newAddBtn = newRow.querySelector('.add-btn');
    const newRemoveBtn = newRow.querySelector('.remove-btn');

    newAddBtn.addEventListener('click', () => handleAddClick(fieldKey));
    newRemoveBtn.addEventListener('click', () => handleRemoveClick(fieldKey, newRow));

    // Insert the cloned row right after the last .field-row in this multi-field
    const lastRow = multiField.querySelectorAll('.field-row');
    lastRow[lastRow.length - 1].after(newRow);

    // Update placeholders/labels in the newly added row for current language
    updateTextByLang();
  }

  function handleRemoveClick(fieldKey, rowElement) {
    const multiField = document.querySelector(`.multi-field[data-field="${fieldKey}"]`);
    if (!multiField) return;

    const allRows = multiField.querySelectorAll('.field-row');
    // Only remove if more than one row remains
    if (allRows.length > 1) {
      rowElement.remove();
    }
    // (Optional) else: you could flash a tooltip or shake effect indicating at least one is required
  }

  // Attach add/remove to all existing buttons
  document.querySelectorAll('.add-btn').forEach((btn) => {
    const fieldKey = btn.getAttribute('data-field');
    btn.addEventListener('click', () => handleAddClick(fieldKey));
  });

  document.querySelectorAll('.remove-btn').forEach((btn) => {
    const fieldKey = btn.getAttribute('data-field');
    // Find the parent .field-row for this remove button
    const rowElem = btn.closest('.field-row');
    btn.addEventListener('click', () => handleRemoveClick(fieldKey, rowElem));
  });


  // ----- FORM SUBMISSION -----
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Disable all inputs/buttons
    form.querySelectorAll('input, textarea, select, button').forEach((el) => {
      el.disabled = true;
    });

    // Show thank-you + progress bar
    thankYouContainer.hidden = false;
    setTimeout(() => {
      progressFill.style.width = '100%';
    }, 100);

    // Gather all form data into a JSON object
    const formData = new FormData(form);
    const payload = {};
    formData.forEach((value, key) => {
      // Handle array fields (fields ending in [])
      if (key.endsWith('[]')) {
        const baseKey = key.replace('[]', '');
        if (!payload[baseKey]) payload[baseKey] = [];
        payload[baseKey].push(value.trim());
      } else {
        payload[key] = value.trim();
      }
    });

    console.log('Collected payload →', payload);
    // TODO: insert encryption/HMAC here, then POST to your endpoint
    /*
    fetch('https://your-endpoint-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(payload),
    })
    .then(res => res.json())
    .then(resp => console.log('Server response:', resp))
    .catch(err => console.error('Error:', err));
    */
  });
});
