export function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
}

export function attachModalHandlers(modal) {
  if (!modal) return;
  modal.addEventListener('click', (e) => {
    const target = e.target;
    if (target === modal || target.classList.contains('modal-overlay') || target.hasAttribute('data-close')) {
      closeModal(modal);
    }
  });
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(modal);
    }
  });
}
