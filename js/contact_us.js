// js/contact_us.js
// Handles logic for the Contact Us modal, assuming modal HTML is already loaded by main.js

// Ensure a global sanitizeInput function exists (can be moved to main.js or a utility script if not already there)
if (typeof window.sanitizeInput !== 'function') {
    window.sanitizeInput = function(text) {
        if (typeof text !== 'string') return text; // Return non-strings as-is
        const element = document.createElement('div');
        element.innerText = text;
        return element.innerHTML.replace(/<br>/g, '\n'); // Basic sanitization, allows newlines from textareas
    };
    console.log('INFO:ContactUsScript/SanitizeFallback: Basic sanitizeInput function defined in contact_us.js.');
}

function initializeContactUsModal(modalElement) {
    if (!modalElement) {
        console.error("ERROR:ContactUs/initializeContactUsModal: Modal element not provided.");
        return;
    }
    console.log('INFO:ContactUs/initializeContactUsModal: Initializing contact modal with element:', modalElement);

    const contactForm = modalElement.querySelector('#contact-form');

    // Attach close button listeners (main.js might also do this, but good to ensure)
    // main.js already attaches close listeners, so this might be redundant unless specific behavior is needed.
    // For now, we assume main.js handles generic close buttons.

    // Attach form submission listener
    if (contactForm) {
        // Check if listener already attached to prevent duplicates if initialize is called multiple times
        if (!contactForm.dataset.submitListenerAttached) {
            attachFormSubmissionListener(contactForm, modalElement);
            contactForm.dataset.submitListenerAttached = 'true';
            console.log('INFO:ContactUs/initializeContactUsModal: Form submission listener attached.');
        }
    } else {
        console.error('ERROR:ContactUs/initializeContactUsModal: Contact form #contact-form not found within provided modal element.');
    }

    // Update language on modal content if main.js hasn't already
    if (typeof window.updateDynamicContentLanguage === 'function') {
        // window.updateDynamicContentLanguage(modalElement);
        // console.log('INFO:ContactUs/initializeContactUsModal: Language updated for contact modal.');
        // This is likely called by main.js after loadModalContent, so might be redundant here.
        // Keeping it commented out for now to avoid double calls.
    }
}

function attachFormSubmissionListener(formElement, modalOwnerElement) {
    if (!formElement) {
        console.warn('WARN:ContactForm/AttachListener: Form element not provided for submission listener.');
        return;
    }

    formElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        console.log('Contact form submitted via contact_us.js handler.');

        const formData = new FormData(formElement);
        const data = {};
        let allRequiredFilled = true;

        // Sanitize and collect form data
        for (const [key, value] of formData.entries()) {
            // Assuming 'name' attribute of inputs matches keys for data object (e.g. 'contact-name')
            // If your form inputs have 'name' attributes like "contact-name", "contact-email", etc.
            // then this direct assignment is fine. Otherwise, you might need to map ids to keys.
            const inputElement = formElement.querySelector(`[name="${key}"]`) || formElement.querySelector(`#${key}`);
            const fieldId = inputElement ? (inputElement.id || key) : key;
            data[fieldId] = window.sanitizeInput(value);
        }


        // Client-side validation (check required fields)
        const requiredFields = ['contact-name', 'contact-email', 'contact-number', 'contact-date', 'contact-time', 'contact-interest', 'contact-comments'];
        requiredFields.forEach(fieldId => {
            const inputElement = formElement.querySelector(`#${fieldId}`);
            // Check data[fieldId] after sanitization, as empty string is falsy
            if (inputElement && inputElement.required && !data[fieldId]) {
                allRequiredFilled = false;
                console.warn(`WARN:ContactForm/Validation: Required field '${fieldId}' is empty.`);
                // Optionally, add visual feedback for missing fields
                // inputElement.style.border = '1px solid red';
            }
        });

        if (!allRequiredFilled) {
            alert("Please fill out all required fields.");
            return;
        }

        // Honeypot check
        if (data['hp-nickname'] && data['hp-nickname'].trim() !== '') {
            console.warn("WARN:ContactForm/submit: Honeypot field 'hp-nickname' filled — likely bot.");
            // Still proceed to simulate success to not alert the bot.
            // In a real scenario, you might log this attempt server-side and silently discard.
            alert("Thank you for contacting us! We’ll get back to you shortly."); // Generic message
            formElement.reset();
            if (modalOwnerElement && typeof window.closeModal === 'function') {
                window.closeModal(modalOwnerElement);
            } else if (modalOwnerElement) {
                modalOwnerElement.classList.remove('active');
            }
            return; // Stop further processing
        }

        try {
            console.log("INFO:ContactForm/submit: Submitting sanitized data to Cloudflare Worker (excluding honeypot):", data);

            const workerUrl = 'YOUR_CLOUDFLARE_WORKER_URL_HERE'; // IMPORTANT: Replace with your actual worker URL

            if (workerUrl === 'YOUR_CLOUDFLARE_WORKER_URL_HERE') {
                console.warn("WARN:ContactForm/submit: Cloudflare Worker URL is not set. Using simulation.");
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
                alert("Thank you for contacting us! (Simulated: Worker URL not set). We’ll get back to you shortly.");
            } else {
                const response = await fetch(workerUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(`Network response was not ok: ${response.status} ${response.statusText}. Worker message: ${errorData}`);
                }
                alert("Thank you for contacting us! We’ll get back to you shortly.");
            }

            formElement.reset();
            if (modalOwnerElement && typeof modalOwnerElement.classList.contains === 'function' && modalOwnerElement.classList.contains('active')) {
                // Assuming main.js provides a global way to close modals or that closeModal is available
                if (typeof window.closeModal === 'function') {
                     window.closeModal(modalOwnerElement); // Ideal if main.js exposes this
                } else {
                    modalOwnerElement.classList.remove('active'); // Fallback
                    console.warn("WARN:ContactForm/Submit: window.closeModal not found. Used direct class removal.");
                }
            }
        } catch (error) {
            {
                console.error("ERROR:ContactForm/submit:", error);
                alert(`There was a problem sending your message: ${error.message}. Please try again later.`);
            }
        });
    console.log(`INFO:ContactForm/SubmitListener: Attached to form '${formElement.id}', configured for Cloudflare Worker (or simulation).`);
}

// Expose the initializer function to be called by main.js
window.initializeContactUsModal = initializeContactUsModal;

// Handle direct load of contact_us.html (e.g., for testing or if it's a standalone page)
// This part is less critical if the primary use is via index.html modals.
document.addEventListener('DOMContentLoaded', () => {
    // If this script is running on contact_us.html itself, the modal is already in the DOM.
    const contactModalDirect = document.getElementById('contact-modal');
    const isStandalonePage = !!contactModalDirect && !document.getElementById('contact-modal-placeholder');

    if (isStandalonePage) {
        console.log('INFO:ContactUsScript/DOMContentLoaded: Running on standalone contact_us.html. Initializing directly.');
        initializeContactUsModal(contactModalDirect);
        // Make it visible if it's meant to be shown by default on its own page
        // contactModalDirect.classList.add('active'); // Or manage visibility via CSS for standalone
    } else {
        console.log('INFO:ContactUsScript/DOMContentLoaded: contact_us.js loaded, awaiting call to initializeContactUsModal from main.js for placeholder injection.');
    }
});
