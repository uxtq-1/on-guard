// js/contact_us.js
// Handles loading the contact modal, its display, and form submission.
import { sanitizeInput } from '../utils/sanitize.js';
const workerUrl = ""; // Cloudflare Worker endpoint (leave blank to disable submissions)

document.addEventListener('DOMContentLoaded', () => {
    const modalPlaceholder = document.getElementById('contact-modal-placeholder');
    // Trigger elements can be identified by a common class or specific IDs
    // For now, we'll use a data attribute for the floating icon
    const modalTriggers = document.querySelectorAll('[data-modal="contact-modal"], #footer-contact-us-button');

    let contactModal = null; // To store the loaded modal element
    let contactForm = null; // To store the loaded form element

    async function loadModal() {
        if (!modalPlaceholder) {
            // If there's no placeholder, this script might be running on modals/contact_us_modal.html itself
            // In that case, the modal is already in the DOM.
            contactModal = document.getElementById('contact-modal');
            if (contactModal) {
                contactForm = contactModal.querySelector('#contact-form');
                if (!contactForm) {
                    console.error('Contact form #contact-form not found within #contact-modal on this page.');
                    return; // No form to attach submit listener to
                }
                // If on modals/contact_us_modal.html, the modal might be visible by default or styled differently.
                // We won't hide it here, assuming its direct page view is intentional.
                // We WILL attach close listeners if they exist for consistency.
                attachModalEventListeners();
                attachFormSubmissionListener();
            } else {
                console.log('Contact modal placeholder or modal itself not found. Modal functionality may be limited.');
            }
            return; // Exit, as no loading into placeholder is needed
        }

        try {
            const response = await fetch('../html/modals/contact_us_modal.html');
            if (!response.ok) {
                throw new Error(`Failed to fetch ../html/modals/contact_us_modal.html: ${response.status} ${response.statusText}`);
            }
            const htmlText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            const modalHtmlElement = doc.querySelector('#contact-modal.modal-overlay');

            if (modalHtmlElement) {
                modalPlaceholder.appendChild(modalHtmlElement);
                contactModal = modalHtmlElement; // Store the appended modal element
                contactForm = contactModal.querySelector('#contact-form'); // Get the form from the loaded modal

                if (!contactForm) {
                    console.error('Contact form #contact-form not found within loaded modal.');
                }

                attachModalEventListeners();
                if (contactForm) {
                    attachFormSubmissionListener();
                }
                if (typeof window.updateDynamicContentLanguage === 'function') {
                    window.updateDynamicContentLanguage(contactModal);
                }
                console.log('Contact modal loaded and initialized.');
            } else {
                console.error('Could not find #contact-modal.modal-overlay in fetched ../html/modals/contact_us_modal.html');
            }
        } catch (error) {
            console.error('Error loading contact modal:', error);
            if (modalPlaceholder) {
                modalPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Could not load contact form.</p>';
            }
        }
    }

    function attachModalEventListeners() {
        if (!contactModal) return;

        const closeModalButton = contactModal.querySelector('.close-modal');

        // Event listeners for triggers (like floating icon or footer button)
        modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                if (contactModal) {
                    contactModal.classList.add('active');
                } else {
                    console.warn('Contact modal not loaded yet or unavailable.');
                }
            });
        });

        // Event listener for the close button
        if (closeModalButton) {
            closeModalButton.addEventListener('click', () => {
                contactModal.classList.remove('active');
            });
        } else {
            console.warn('Close button .close-modal not found in the modal.');
        }

        // Event listener for clicking on the overlay to close
        contactModal.addEventListener('click', (event) => {
            if (event.target === contactModal) { // Only if the click is on the overlay itself
                contactModal.classList.remove('active');
            }
        });
    }

    function attachFormSubmissionListener() {
        if (!contactForm) {
            console.warn('WARN:ContactForm/Init: Contact form element not found for submission listener.');
            return;
        }

        const honeypotField = contactForm.querySelector('input[placeholder="Enter your name"]'); // Example, adjust if honeypot has a specific ID/name

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
            console.log('Contact form submitted.');

            const formData = new FormData(contactForm);
            const data = {};
            let allRequiredFilled = true;

            for (const [key, value] of formData.entries()) {
                data[key] = sanitizeInput(value);
            }

            // Simple client-side validation (check required fields based on the new form structure)
            const requiredFields = ['contact-name', 'contact-email', 'contact-number', 'contact-date', 'contact-time', 'contact-interest', 'contact-comments'];
            requiredFields.forEach(fieldId => {
                const inputElement = contactForm.querySelector(`#${fieldId}`);
                if (inputElement && inputElement.required && !data[fieldId]) {
                    allRequiredFilled = false;
                    // Optionally, add visual feedback for missing fields
                    // inputElement.style.border = '1px solid red';
                }
            });

            if (!allRequiredFilled) {
                alert("Please fill out all required fields.");
                // console.warn("Validation failed: Not all required fields are filled.");
                return;
            }

            // Basic Honeypot check (assuming one of the fields could be a honeypot or a specific one is added)
            // For this example, let's assume 'contact-number' could be misused if a more specific honeypot field isn't there.
            // This is a placeholder for a real honeypot. The original HTML didn't have a clear one.
            // if (data['hp-field'] && data['hp-field'].trim() !== '') { // If you add a field like <input name="hp-field" class="hidden">
            //    console.warn("WARN:ContactForm/submit: Honeypot field filled — likely bot.");
            //    alert("Your submission could not be processed.");
            //    return;
            // }
            try {
                console.log("INFO:ContactForm/submit: Submitting sanitized data to Cloudflare Worker:", data);

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

                contactForm.reset();
                if (contactModal) {
                    contactModal.classList.remove('active');
                }
            } catch (error) {
                console.error("ERROR:ContactForm/submit:", error);
                alert(`There was a problem sending your message: ${error.message}. Please try again later.`);
            }
        });
        console.log('INFO:ContactForm/SubmitListener: Attached to form, configured for Cloudflare Worker.');
    }

    // --- Initialization ---
    // Check if we are on index.html (or any page that needs dynamic modal loading)
    if (modalPlaceholder) {
        loadModal(); // This will load, then attach listeners
    } else {
        // We might be on modals/contact_us_modal.html directly.
        // The modal is already in the DOM. Just find it and attach listeners.
        contactModal = document.getElementById('contact-modal');
        if (contactModal) {
            contactForm = contactModal.querySelector('#contact-form');
            attachModalEventListeners(); // Attach close/open listeners
            if (contactForm) {
                attachFormSubmissionListener(); // Attach submit listener
            } else {
                 console.error('Contact form #contact-form not found within #contact-modal on this page (direct view).');
            }
            // If on modals/contact_us_modal.html, the modal is likely intended to be always visible or managed by its own page logic
            // So, we don't add 'active' class here by default.
            // However, if it's meant to be a modal even on its own page, it should start hidden by CSS
            // and then a trigger specific to that page would open it.
            // For now, assume it's visible if directly on modals/contact_us_modal.html.
        } else {
            console.log("No modal placeholder and no #contact-modal found directly on this page. contact_us.js will not initialize modal display/loading features.");
        }
    }

    // Fallback for any triggers that might exist even if the modal isn't loaded into a placeholder
    // This ensures that if contact_us.js is included on a page with triggers but no placeholder,
    // the triggers won't cause errors, though they might not open a modal if it's not found.
    modalTriggers.forEach(trigger => {
        if (!trigger.getAttribute('listener-attached')) { // Prevent double-binding if attachModalEventListeners ran
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                if (contactModal && contactModal.classList.contains('modal-overlay')) {
                    contactModal.classList.add('active');
                } else {
                    console.warn('Contact modal is not available or not loaded when trigger was clicked.');
                }
            });
            trigger.setAttribute('listener-attached', 'true');
        }
    });

    console.log('INFO:ContactUsScript/DOMContentLoaded: contact_us.js fully processed.');
});

