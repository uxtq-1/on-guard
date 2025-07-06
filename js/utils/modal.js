export function closeModal(modal, triggerButton = null) { // Added triggerButton parameter
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  // Attempt to focus on the trigger button if provided
  if (triggerButton) {
    triggerButton.focus();
  } else if (modal.dataset.triggerId) {
    // Fallback to stored triggerId if available (for Escape key or internal close buttons)
    const storedTriggerButton = document.getElementById(modal.dataset.triggerId);
    if (storedTriggerButton) {
      storedTriggerButton.focus();
    }
  }
  // Clear the triggerId after use if necessary, or leave it if modals might be re-opened
  // and we want to preserve the original trigger. For now, let's leave it.
}

let escapeHandlerAttached = false;
export function attachModalHandlers(modal) {
  if (!modal) return;
  // Ensure each modal instance gets its own event listener for clicks
  // to prevent multiple closeModal calls if attachModalHandlers is called multiple times on the same modal.
  // A simple way is to check if a marker class is present.
  if (modal.dataset.handlersAttached === 'true') return;
  modal.dataset.handlersAttached = 'true';

  modal.addEventListener('click', (e) => {
    const target = e.target;
    // Check if the click is on the modal overlay itself, or an element with data-close (like a close button)
    if (target === modal || target.classList.contains('modal-overlay') || target.hasAttribute('data-close')) {
      // Pass the trigger button if its ID was stored on the modal
      const triggerButton = modal.dataset.triggerId ? document.getElementById(modal.dataset.triggerId) : null;
      closeModal(modal, triggerButton);
    }
  });

  // Global Escape key handler, should only be attached once.
  if (!escapeHandlerAttached) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Find the topmost active modal to close
        const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeModals.length > 0) {
          // Optional: If z-index matters, sort by z-index to find the topmost.
          // For now, assume the last one found or the first one is okay.
          const modalToClose = activeModals[activeModals.length - 1]; // Often the last one added is topmost
          const triggerButton = modalToClose.dataset.triggerId ? document.getElementById(modalToClose.dataset.triggerId) : null;
          closeModal(modalToClose, triggerButton);
        }
      }
    });
    escapeHandlerAttached = true;
  }
}
