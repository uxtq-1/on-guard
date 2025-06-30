// js/contact_us.js
// Initializes the Contact Us modal and handles form submission.

import { sanitizeInput } from '../utils/sanitize.js';

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
            submitButton.title = 'Submission disabled: service unavailable';
        }
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
            alert('Form submission is currently unavailable.');
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
            alert('Please fill out all required fields.');
            return;
        }

        // Honeypot check
        if (data['hp-field'] && data['hp-field'].trim() !== '') {
            console.warn('WARN:ContactForm/submit: Honeypot field filled — likely bot.');
            alert('Your submission could not be processed at this time. Please try again later.');
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

            alert('Thank you for contacting us! We\u2019ll get back to you shortly.');
            contactForm.reset();
            modalElement.classList.remove('active');
        } catch (error) {
            console.error('ERROR:ContactForm/submit:', error);
            alert(`There was a problem sending your message: ${error.message}. Please try again later.`);
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

