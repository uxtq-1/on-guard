'use strict';

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.add-field-btn').forEach(button => {
    button.addEventListener('click', function() {
      const container = this.previousElementSibling; // .dynamic-field-container
      if (!container || !container.classList.contains('dynamic-field-container')) return;

      const maxEntries = parseInt(container.dataset.maxEntries) || 5;
      if (container.children.length >= maxEntries) {
        alert('Maximum entries reached for this section.'); // Or a more subtle notification
        return;
      }

      const firstEntry = container.querySelector('.dynamic-field-entry');
      if (!firstEntry) return; // Should not happen

      const newEntry = firstEntry.cloneNode(true);
      const newIndex = container.children.length;
      const sectionName = container.dataset.sectionName;

      newEntry.querySelectorAll('input, select, textarea').forEach(input => {
        input.value = ''; // Clear values
        // Update name attribute for array submission, e.g., skills[0][description] to skills[1][description]
        if (input.name) {
            input.name = input.name.replace(new RegExp(sectionName + '\\[\\d+\\]'), sectionName + '[' + newIndex + ']');
        }
        // Update IDs and for attributes if necessary to maintain label associations, though not strictly needed if labels are not targeting by ID for cloned items.
      });

      // Ensure remove button in new entry works
      newEntry.querySelector('.remove-field-btn').addEventListener('click', handleRemoveField);
      container.appendChild(newEntry);
    });
  });

  function handleRemoveField(event) {
    const entryToRemove = event.target.closest('.dynamic-field-entry');
    const container = entryToRemove.parentElement;
    if (container.children.length > 1) {
      entryToRemove.remove();
    } else {
      // Optionally clear the fields of the last entry instead of removing it
      // Or alert that at least one entry is required
      entryToRemove.querySelectorAll('input, select, textarea').forEach(input => input.value = '');
      // alert('At least one entry is required.');
    }
    // After removing, re-index names if strict sequential indexing is needed (more complex, often not required if backend handles gaps)
  }

  document.querySelectorAll('.remove-field-btn').forEach(button => {
    button.addEventListener('click', handleRemoveField);
  });

  // Collapsible Functionality
  const joinModal = document.getElementById('join-modal');

  if (joinModal) {
      const collapsibleHeaders = joinModal.querySelectorAll('.collapsible-header');

      collapsibleHeaders.forEach(header => {
          const content = header.nextElementSibling;
          if (content && content.classList.contains('collapsible-content')) {
              // Initialize as collapsed: CSS handles this with display:none by default.
              // JS will toggle an 'open' class for content and 'expanded' for header.
              content.classList.remove('open');
              header.classList.remove('expanded'); // Ensure header icon is in collapsed state

              header.addEventListener('click', function() {
                  content.classList.toggle('open');
                  this.classList.toggle('expanded');
              });
          }
      });

      // "DONE" Button Functionality
      const doneButtons = joinModal.querySelectorAll('.btn-done');

      doneButtons.forEach(button => {
          button.addEventListener('click', function() {
              const contentWrapper = this.closest('.collapsible-content');
              if (contentWrapper) {
                  contentWrapper.classList.remove('open');
                  // Also update the header associated with this content
                  const header = contentWrapper.previousElementSibling;
                  if (header && header.classList.contains('collapsible-header')) {
                      header.classList.remove('expanded');
                  }
              }
              this.classList.add('is-done');
              // Optionally change text:
              // const currentLang = document.documentElement.lang || 'en';
              // this.textContent = (currentLang === 'es') ? 'Completado' : 'Completed';
          });
      });
  }
});
