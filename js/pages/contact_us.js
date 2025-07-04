// js/contact_us.js
// Handles multilingual, secure contact form submission with modal management

import { sanitizeInput } from '../utils/sanitize.js';

const I18N = {
    en: {
        submissionUnavailable: 'Form submission is currently unavailable.',
        fillRequired: 'Please fill out all required fields.',
        honeypot: 'Your submission could not be processed at this time. Please try again later.',
        success: 'Thank you for contacting us! We’ll get back to you shortly.',
        error: 'There was a problem sending your message: {{err}}. Please try again later.'
    },
    es: {
        submissionUnavailable: 'El envío del formulario no está disponible.',
        fillRequired: 'Por favor complete todos los campos requeridos.',
        honeypot: 'No pudimos procesar su envío en este momento. Por favor intente nuevamente más tarde.',
        success: '¡Gracias por contactarnos! Nos pondremos en contacto pronto.',
        error: 'Hubo un problema enviando su mensaje: {{err}}. Por favor intente nuevamente más tarde.'
    }
};

let currentLang = localStorage.getItem('language') || 'en';

function t(key, replacements = {}) {
    const template = I18N[currentLang]?.[key] || I18N.en[key] || key;
    return template.replace('{{err}}', replacements.err || '');
}

// Reactively update language on <html lang> mutation
new MutationObserver(mutations => {
    for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'lang') {
            currentLang = document.documentElement.getAttribute('lang') || 'en';
        }
    }
}).observe(document.documentElement, { attributes: true });

const workerUrl = window.CONTACT_WORKER_URL || "";

function initializeContactModal(modalElement) {
    if (!modalElement) return console.error('Modal not provided.');
    const contactForm = modalElement.querySelector('#contact-form');
    if (!contactForm) return console.error('#contact-form not found.');

    // Close modal on backdrop click or close button
    modalElement.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => modalElement.classList.remove('active'));
    });
    modalElement.addEventListener('click', e => {
        if (e.target === modalElement) modalElement.classList.remove('active');
    });

    const submitBtn = contactForm.querySelector('button[type="submit"]');

    // Handle worker not set
    if (!workerUrl) {
        console.warn('Contact form disabled: workerUrl not configured.');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.title = t('submissionUnavailable');
        }
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert(t('submissionUnavailable'));
        });
        return;
    }

    // Submit handler
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = {};
        let allValid = true;

        // Sanitize & collect
        for (const [key, value] of formData.entries()) {
            const { sanitized, flagged } = sanitizeInput(value);
            data[key] = sanitized;
            if (flagged) {
                console.warn(`sanitizeInput flagged input for field ${key}`);
            }
        }

        // Required field validation
        const requiredFields = [
            'contact-name', 'contact-email', 'contact-number',
            'contact-date', 'contact-time', 'contact-interest', 'contact-comments'
        ];
        for (const fieldId of requiredFields) {
            const field = contactForm.querySelector(`#${fieldId}`);
            if (field?.required && !data[fieldId]) allValid = false;
        }

        if (!allValid) return alert(t('fillRequired'));

        // Honeypot protection
        if (data['hp-field']?.trim()) {
            console.warn('Honeypot triggered. Possible bot.');
            alert(t('honeypot'));
            return;
        }
        delete data['hp-field'];

        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(`Worker error ${response.status}: ${response.statusText}. ${errorMsg}`);
            }

            alert(t('success'));
            contactForm.reset();
            modalElement.classList.remove('active');
        } catch (err) {
            console.error('Submit error:', err);
            alert(t('error', { err: err.message }));
        }
    });

    if (typeof window.updateDynamicContentLanguage === 'function') {
        window.updateDynamicContentLanguage(modalElement);
    }
}

export { initializeContactModal };

// Auto-init if modal is present inline (non-placeholder injection)
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('contact-modal');
    const placeholder = document.getElementById('contact-modal-placeholder');
    if (modal && !placeholder) initializeContactModal(modal);
});
