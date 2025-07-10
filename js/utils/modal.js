export function closeModal(modal, triggerButton = null) {
  if (!modal || !modal.classList.contains('active')) return; // Do nothing if modal is not active

  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');

  if (triggerButton) {
    triggerButton.focus();
  } else if (modal.dataset.triggerId) {
    const storedTriggerButton = document.getElementById(modal.dataset.triggerId);
    if (storedTriggerButton) {
      storedTriggerButton.focus();
    }
  }
}

let boundEscapeKeyHandler;
let escapeHandlerAttached = false;

export function attachModalHandlers(modal) {
  if (!modal || modal.dataset.handlersAttached === 'true') return;

  const clickHandler = (e) => {
    const target = e.target;
    if (target === modal || target.closest('[data-close]')) {
      const triggerButton = modal.dataset.triggerId ? document.getElementById(modal.dataset.triggerId) : null;
      closeModal(modal, triggerButton);
    }
  };
  modal.addEventListener('click', clickHandler);
  modal.dataset.handlersAttached = 'true';

  if (!escapeHandlerAttached) {
    boundEscapeKeyHandler = (e) => {
      if (e.key === 'Escape') {
        const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active'));
        if (activeModals.length > 0) {
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

/**
 * Creates a modal DOM element.
 * @param {string} modalId - The ID for the modal overlay.
 * @param {string} titleEn - The English title for the modal.
 * @param {string} titleEs - The Spanish title for the modal.
 * @param {string} bodyHtml - The HTML string for the modal body content.
 * @param {string} [footerHtml=''] - Optional HTML string for the modal footer content.
 * @returns {HTMLElement} The created modal overlay element.
 */
export function createModalElement(modalId, titleEn, titleEs, bodyHtml, footerHtml = '') {
  const modalOverlay = document.createElement('div');
  modalOverlay.id = modalId;
  modalOverlay.className = 'modal-overlay';
  modalOverlay.setAttribute('role', 'dialog');
  modalOverlay.setAttribute('aria-modal', 'true');
  modalOverlay.setAttribute('aria-labelledby', `${modalId}-title`);
  modalOverlay.setAttribute('aria-hidden', 'true');
  modalOverlay.setAttribute('tabindex', '-1');

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.setAttribute('role', 'document');

  const modalHeader = document.createElement('div');
  modalHeader.className = 'modal-header';

  const titleElement = document.createElement('h3');
  titleElement.id = `${modalId}-title`;
  titleElement.setAttribute('data-en', titleEn);
  titleElement.setAttribute('data-es', titleEs);
  titleElement.textContent = titleEn; // Default to English

  const closeButton = document.createElement('button');
  closeButton.className = 'close-modal';
  closeButton.setAttribute('data-close', '');
  closeButton.setAttribute('aria-label', 'Close');
  // It's good practice to also have data-en-label and data-es-label for full i18n
  closeButton.setAttribute('data-en-label', `Close ${titleEn} Modal`);
  closeButton.setAttribute('data-es-label', `Cerrar Modal de ${titleEs}`);
  closeButton.innerHTML = '&times;';

  modalHeader.appendChild(titleElement);
  modalHeader.appendChild(closeButton);

  const modalBody = document.createElement('div');
  modalBody.className = 'modal-body';
  modalBody.innerHTML = bodyHtml; // Use innerHTML for simplicity, ensure bodyHtml is sanitized if from user input

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);

  if (footerHtml) {
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    modalFooter.innerHTML = footerHtml; // Use innerHTML, ensure footerHtml is sanitized if from user input
    modalContent.appendChild(modalFooter);
  }

  modalOverlay.appendChild(modalContent);
  return modalOverlay;
}
