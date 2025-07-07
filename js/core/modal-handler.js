export function closeModal(modal, triggerButton = null) {
  if (!modal || !modal.classList.contains('active')) return; // Do nothing if modal is not active

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  // Ensure dynamic content (like language updates) is reverted or handled if necessary upon close
  // This might be specific to modal content, for now, we assume static or correctly handled by global updates.

  if (triggerButton) {
    triggerButton.focus();
  } else if (modal.dataset.triggerId) {
    const storedTriggerButton = document.getElementById(modal.dataset.triggerId);
    if (storedTriggerButton) {
      storedTriggerButton.focus();
    }
  }
  // Consider removing modal.dataset.triggerId here if it's not needed after close,
  // or if modals should always re-associate with their latest trigger.
}

// Store a reference to the bound escape key handler to allow for its removal if needed.
// However, for a global handler like this, removal is typically not necessary unless
// the entire modal system is being torn down.
let boundEscapeKeyHandler;
let escapeHandlerAttached = false;

export function attachModalHandlers(modal) {
  if (!modal || modal.dataset.handlersAttached === 'true') return;

  // Click handler for closing the modal (overlay click or close button)
  const clickHandler = (e) => {
    const target = e.target;
    // Close if the click is on the overlay itself or an element with `data-close`
    if (target === modal || target.closest('[data-close]')) {
      const triggerButton = modal.dataset.triggerId ? document.getElementById(modal.dataset.triggerId) : null;
      closeModal(modal, triggerButton);
    }
  };
  modal.addEventListener('click', clickHandler);
  // Store the handler reference on the modal if you later need to remove it specifically.
  // Example: modal._clickHandler = clickHandler;

  modal.dataset.handlersAttached = 'true';

  // Attach global Escape key handler only once
  if (!escapeHandlerAttached) {
    boundEscapeKeyHandler = (e) => {
      if (e.key === 'Escape') {
        const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeModals.length > 0) {
          // Close the topmost active modal (last in DOM order, or use z-index if complex)
          const modalToClose = activeModals[activeModals.length - 1];
          const triggerButton = modalToClose.dataset.triggerId ? document.getElementById(modalToClose.dataset.triggerId) : null;
          closeModal(modalToClose, triggerButton);
        }
      }
    };
    document.addEventListener('keydown', boundEscapeKeyHandler);
    escapeHandlerAttached = true;
  }
}

// Optional: Function to detach all handlers if a modal is removed from DOM or reinitialized
export function detachModalHandlers(modal) {
  if (!modal || modal.dataset.handlersAttached !== 'true') return;

  // Example: removing a specific click handler if stored
  // if (modal._clickHandler) {
  //   modal.removeEventListener('click', modal._clickHandler);
  //   delete modal._clickHandler; // Clean up stored reference
  // }
  // For simplicity, if not storing specific handlers, this function might be less critical
  // or would need to re-query for buttons/elements to remove listeners from.

  modal.dataset.handlersAttached = 'false'; // Reset marker

  // Note: Global escape key handler is not removed per-modal to avoid issues
  // if other modals are still active. It's generally kept for the lifetime of the page.
}
