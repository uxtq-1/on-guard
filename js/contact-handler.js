document.addEventListener('DOMContentLoaded', () => {
    const contactPageForm = document.getElementById('contact-form'); // Using the ID found in contact.html

    if (contactPageForm) {
        const RECAPTCHA_V3_SITE_KEY = 'YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER'; // User should replace

        // ======= APi ======= // USER_SHOULD_REPLACE_THIS_PLACEHOLDER_WITH_ACTUAL_BACKEND_URL // ======= APi ======= //
        const BACKEND_SUBMISSION_URL = 'YOUR_BACKEND_SUBMISSION_URL_PLACEHOLDER'; // User should replace
        // ======= APi ======= // USER_SHOULD_REPLACE_THIS_PLACEHOLDER_WITH_ACTUAL_BACKEND_URL // ======= APi ======= //


        contactPageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formElement = e.target;
            const formType = 'contact_page'; // Distinguish from modal contact

            const submitButton = formElement.querySelector('button[type="submit"]') || formElement.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            // Ensure FormEncryptor is loaded
            if (typeof FormEncryptor === 'undefined' || !FormEncryptor.processForm) {
                console.error('FormEncryptor is not loaded or processForm is not available.');
                alert('A critical error occurred. Please try again later.');
                if (submitButton) submitButton.disabled = false;
                return;
            }

            FormEncryptor.processForm(formElement, formType, RECAPTCHA_V3_SITE_KEY, BACKEND_SUBMISSION_URL)
                .then(response => {
                    console.log('Contact page form submission response:', response);
                    // Display feedback using the existing feedback mechanism if available
                    const feedbackMessageEl = document.getElementById('feedback-message');
                    if (feedbackMessageEl) {
                        feedbackMessageEl.textContent = response.message || 'Message sent successfully! (Simulated)';
                        feedbackMessageEl.style.color = response.success ? 'green' : 'red'; // Adjust based on actual response structure
                        feedbackMessageEl.classList.add('show');
                        setTimeout(() => feedbackMessageEl.classList.remove('show'), 5000);
                    } else {
                        alert(response.message || 'Message sent successfully! (Simulated)');
                    }
                    if (response.success) {
                        formElement.reset();
                        // Optionally hide the form or show a more permanent success message
                        // formElement.style.display = 'none';
                    }
                })
                .catch(error => {
                    console.error('Contact page form submission error:', error);
                    const feedbackMessageEl = document.getElementById('feedback-message');
                    if (feedbackMessageEl) {
                        feedbackMessageEl.textContent = 'An error occurred: ' + error.message;
                        feedbackMessageEl.style.color = 'red';
                        feedbackMessageEl.classList.add('show');
                        setTimeout(() => feedbackMessageEl.classList.remove('show'), 5000);
                    } else {
                        alert('An error occurred during submission: ' + error.message);
                    }
                })
                .finally(() => {
                    if (submitButton) submitButton.disabled = false;
                });
        });
    } else {
        console.warn('Contact page form (id="contact-form") not found in contact.html.');
    }
});
