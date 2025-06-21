'use strict';

document.addEventListener('DOMContentLoaded', function() {
  // Previous dynamic field logic for .add-field-btn, .dynamic-field-container, etc. might be here.
  // We are replacing it or augmenting it with the new logic from the sample for .form-section elements.
  // If the old system is still used elsewhere, this needs careful integration.
  // For now, assuming the new .form-section logic is the primary for "Join Us".

  const joinModal = document.getElementById('join-modal');

  if (joinModal) {
    // Logic for the new dynamic sections from the sample
    joinModal.querySelectorAll('.form-section').forEach(section => {
      const addBtn = section.querySelector('.add');
      const removeBtn = section.querySelector('.remove');
      const acceptBtn = section.querySelector('.accept-btn');
      const editBtn = section.querySelector('.edit-btn');
      const inputsContainer = section.querySelector('.inputs');
      const sectionName = section.dataset.section; // e.g., "Skills", "Education"

      if (!addBtn || !removeBtn || !acceptBtn || !editBtn || !inputsContainer) {
        // console.warn(`Missing elements in form section: ${sectionName}`);
        return;
      }

      addBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'text';
        // Placeholder logic needs to be aware of current language
        const currentLang = document.documentElement.lang || 'en';
        // Attempt to get more specific placeholders if available (e.g. from data-attributes on the section or button)
        // For now, using the generic placeholder structure from the sample:
        input.placeholder = currentLang === 'es'
          ? `Ingresa ${sectionName}` // This might need better translation based on sectionName
          : `Enter ${sectionName} info`;
        // Add data-attributes for dynamic placeholder updates if language changes later
        input.setAttribute('data-placeholder-en', `Enter ${sectionName} info`);
        input.setAttribute('data-placeholder-es', `Ingresa ${sectionName}`); // Simple example

        // Assign a name to the input for form submission.
        // This needs a strategy, e.g., sectionName_input_N
        const inputIndex = inputsContainer.querySelectorAll('input').length;
        input.name = `${sectionName.toLowerCase().replace(' ', '_')}[${inputIndex}]`; // e.g. skills[0], education[0]

        inputsContainer.appendChild(input);
      });

      removeBtn.addEventListener('click', () => {
        const inputs = inputsContainer.querySelectorAll('input');
        if (inputs.length > 0) {
          inputsContainer.removeChild(inputs[inputs.length - 1]);
        }
      });

      acceptBtn.addEventListener('click', () => {
        const inputs = inputsContainer.querySelectorAll('input');
        const currentLang = document.documentElement.lang || 'en';
        if (inputs.length === 0) {
          alert(currentLang === 'es'
            ? `Agrega al menos una entrada en ${section.querySelector('h2').textContent}.`
            : `Please add at least one ${section.querySelector('h2').textContent} entry.`);
          return;
        }
        inputs.forEach(input => input.disabled = true);
        section.classList.add('completed');
        acceptBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
        // Make add/remove buttons less prominent or disabled
        addBtn.style.opacity = '0.5'; addBtn.disabled = true;
        removeBtn.style.opacity = '0.5'; removeBtn.disabled = true;
      });

      editBtn.addEventListener('click', () => {
        const inputs = inputsContainer.querySelectorAll('input');
        inputs.forEach(input => input.disabled = false);
        section.classList.remove('completed');
        acceptBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
        // Restore add/remove buttons
        addBtn.style.opacity = '1'; addBtn.disabled = false;
        removeBtn.style.opacity = '1'; removeBtn.disabled = false;
      });
    });

    // --- Existing Collapsible and Done Button Logic (if still needed for other parts or to be removed/adapted) ---
    // The new sample doesn't use .collapsible-header or .btn-done in the same way.
    // The .form-section itself is the container, not a .collapsible-content.
    // If the old collapsible sections are entirely replaced by .form-section, this old logic might not be needed for #join-modal.

    const collapsibleHeaders = joinModal.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(header => {
        // This logic might conflict or be redundant if .form-section is the new standard.
        // For now, let's assume it's for other types of collapsibles if they exist.
        const content = header.nextElementSibling;
        if (content && content.classList.contains('collapsible-content')) {
            content.classList.remove('open');
            header.classList.remove('expanded');
            header.addEventListener('click', function() {
                content.classList.toggle('open');
                this.classList.toggle('expanded');
            });
        }
    });

    const doneButtons = joinModal.querySelectorAll('.btn-done');
    doneButtons.forEach(button => {
        // This logic might also be redundant if .form-section replaces the old dynamic fields.
        button.addEventListener('click', function() {
            const contentWrapper = this.closest('.collapsible-content');
            if (contentWrapper) {
                contentWrapper.classList.remove('open');
                const header = contentWrapper.previousElementSibling;
                if (header && header.classList.contains('collapsible-header')) {
                    header.classList.remove('expanded');
                }
            }
            this.classList.add('is-done');
        });
    });
  } // end if(joinModal)
});
