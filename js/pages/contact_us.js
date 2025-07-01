// js/contact_us.js
// Initializes the Contact Us modal and handles form submission.

import { sanitizeInput } from '../utils/sanitize.js';

const I18N = {
    en: {
        submissionUnavailable: 'Form submission is currently unavailable.',
        fillRequired: 'Please fill out all required fields.',
        honeypot: 'Your submission could not be processed at this time. Please try again later.',
        success: 'Thank you for contacting us! We\u2019ll get back to you shortly.',
        error: 'There was a problem sending your message: {{err}}. Please try again later.'
    },
    es: {
        submissionUnavailable: 'El env\u00edo del formulario no est\u00e1 disponible.',
        fillRequired: 'Por favor complete todos los campos requeridos.',
        honeypot: 'No pudimos procesar su env\u00edo en este momento. Por favor intente nuevamente m\u00e1s tarde.',
        success: '\u00a1Gracias por contactarnos! Nos pondremos en contacto pronto.',
        error: 'Hubo un problema enviando su mensaje: {{err}}. Por favor intente nuevamente m\u00e1s tarde.'
    }
};

let currentLang = localStorage.getItem('language') || 'en';

function t(key, replacements = {}) {
    const str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
    return str.replace('{{err}}', replacements.err || '');
}

const langObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'lang') {
            currentLang = document.documentElement.getAttribute('lang') || 'en';
        }
    }
});
langObserver.observe(document.documentElement, { attributes: true });

const workerUrl = window.CONTACT_WORKER_URL || "";

function initializeContactModal(modalElement) {
    if (!modalElement) {
        console.error('ERROR:initializeContactModal: Modal element not provided.');
        return;
    }

    const contactForm = modalElement.querySelector('#contact-form');
    if (!contactForm) {
        console.error('ERROR:initializeContactModal: #contact-form not found.');
        return;
    }

    // Close buttons within the modal
    modalElement.querySelectorAll('.close-modal[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            modalElement.classList.remove('active');
        });
    });

    // Backdrop click closes the modal
    modalElement.addEventListener('click', (e) => {
        if (e.target === modalElement) {
            modalElement.classList.remove('active');
        }
    });

    const submitButton = contactForm.querySelector('button[type="submit"]');

    if (!workerUrl) {
        console.warn('Contact form submission disabled: workerUrl not configured.');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.title = t('submissionUnavailable');
        }
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert(t('submissionUnavailable'));
        });
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const data = {};
        let allRequiredFilled = true;

        for (const [key, value] of formData.entries()) {
            data[key] = sanitizeInput(value);
        }

        const requiredFields = ['contact-name', 'contact-email', 'contact-number', 'contact-date', 'contact-time', 'contact-interest', 'contact-comments'];
        requiredFields.forEach(fieldId => {
            const inputElement = contactForm.querySelector(`#${fieldId}`);
            if (inputElement && inputElement.required && !data[fieldId]) {
                allRequiredFilled = false;
            }
        });

        if (!allRequiredFilled) {
            alert(t('fillRequired'));
            return;
        }

        // Honeypot check
        if (data['hp-field'] && data['hp-field'].trim() !== '') {
            console.warn('WARN:ContactForm/submit: Honeypot field filled — likely bot.');
            alert(t('honeypot'));
            return;
        }
        delete data['hp-field'];

        try {
            const response = await fetch(workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Worker message: ${errorData}`);
            }

            alert(t('success'));
            contactForm.reset();
            modalElement.classList.remove('active');
        } catch (error) {
            console.error('ERROR:ContactForm/submit:', error);
            alert(t('error', { err: error.message }));
        }
    });

    if (typeof window.updateDynamicContentLanguage === 'function') {
        window.updateDynamicContentLanguage(modalElement);
    }

    console.log('INFO:contact_us/initializeContactModal: Contact modal initialized.');
}

export { initializeContactModal };

// Auto-initialize when modal is present directly in the DOM (e.g., contact_us_modal.html)
document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('contact-modal-placeholder');
    const directModal = document.getElementById('contact-modal');
    if (directModal && !placeholder) {
        initializeContactModal(directModal);
    }
});

