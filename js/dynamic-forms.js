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
});
