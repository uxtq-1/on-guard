export function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

let escapeHandlerAttached = false;

export function attachModalHandlers(modal) {
  if (!modal) return;
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target === modal || target.classList.contains('modal-overlay') || target.hasAttribute('data-close')) {
      closeModal(modal);
    }
  });

  if (!escapeHandlerAttached) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(closeModal);
      }
    });
    escapeHandlerAttached = true;
  }
}
