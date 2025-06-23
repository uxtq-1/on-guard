document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contact-form');
    const closeModalButton = document.querySelector('.close-modal');

    // Handle form submission
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault(); // Prevent actual submission

            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                number: document.getElementById('contact-number').value,
                date: document.getElementById('contact-date').value,
                time: document.getElementById('contact-time').value,
                interest: document.getElementById('contact-interest').value,
                comments: document.getElementById('contact-comments').value,
            };

            console.log('Form submitted. Data:', formData);
            alert('Form submitted! Check the console for details.'); // Placeholder
            // Here you would typically send the data to a server
            // For example: fetch('/submit-contact-form', { method: 'POST', body: JSON.stringify(formData) })
            // Or handle it via a backend service.
        });
    } else {
        console.error('Contact form not found.');
    }

    // Handle close modal button
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function () {
            console.log('Close button clicked.');
            // In a real application, you would hide the modal here.
            // For example: document.getElementById('contact-modal').style.display = 'none';
            // However, the provided HTML has the modal always visible by default.
            // The mechanism to show/hide the modal is not defined in the request.
            alert('Close button clicked. Modal would be hidden here.');
        });
    } else {
        console.error('Close modal button not found.');
    }

    // Basic language switching based on data attributes (example)
    // This is a very basic implementation. A more robust solution might involve a language library.
    const languageToggleButton = document.createElement('button');
    languageToggleButton.textContent = 'Toggle Language (EN/ES)';
    languageToggleButton.style.position = 'fixed';
    languageToggleButton.style.top = '10px';
    languageToggleButton.style.right = '10px';
    languageToggleButton.style.padding = '10px';
    languageToggleButton.style.zIndex = '1001'; // Above modal
    document.body.appendChild(languageToggleButton);

    let currentLanguage = 'en'; // Default language

    languageToggleButton.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
        updateTextForLanguage(currentLanguage);
    });

    function updateTextForLanguage(lang) {
        document.querySelectorAll('[data-en]').forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.dataset[lang + 'Placeholder']) {
                     el.placeholder = el.dataset[lang + 'Placeholder'];
                } else {
                     el.placeholder = el.dataset[lang]; // Fallback for elements without specific placeholder translation
                }
            } else if (el.tagName === 'OPTION') {
                // For options, we might need to handle "disabled selected" differently
                // or ensure that the value attribute is consistent if it's used programmatically.
                // This basic version just updates the display text.
                if (el.value === "" && el.disabled && el.selected) {
                    // Potentially handle "Select an option" text if needed, though it's not in data-attributes
                } else {
                    el.textContent = el.dataset[lang];
                }
            }
            else {
                el.textContent = el.dataset[lang];
            }
        });
        // Update select placeholder option if necessary - this is a bit tricky
        // as the "Select an option" is not directly translatable with data attributes
        const selectElement = document.getElementById('contact-interest');
        if (selectElement) {
            const placeholderOption = selectElement.querySelector('option[value=""][disabled][selected]');
            if (placeholderOption) {
                if (lang === 'es') {
                    placeholderOption.textContent = 'Seleccione una opción';
                } else {
                    placeholderOption.textContent = 'Select an option';
                }
            }
        }
    }
    // Initialize with default language
    updateTextForLanguage(currentLanguage);
});
