document.addEventListener('DOMContentLoaded', () => {
    const joinPageForm = document.getElementById('join-form'); // Using the ID found in join.html

    if (joinPageForm) {
        const RECAPTCHA_V3_SITE_KEY = 'YOUR_RECAPTCHA_V3_SITE_KEY_PLACEHOLDER'; // User should replace
        // ======= APi ======= // USER_SHOULD_REPLACE_THIS_PLACEHOLDER_WITH_ACTUAL_BACKEND_URL // ======= APi ======= //
        const BACKEND_SUBMISSION_URL = 'YOUR_BACKEND_SUBMISSION_URL_PLACEHOLDER'; // User should replace
        // ======= APi ======= // USER_SHOULD_REPLACE_THIS_PLACEHOLDER_WITH_ACTUAL_BACKEND_URL // ======= APi ======= //

        joinPageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formElement = e.target;
            // 'join_page' formType will trigger file handling in FormEncryptor.processForm
            const formType = 'join_page';

            const submitButton = formElement.querySelector('button[type="submit"]') || formElement.querySelector('input[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            // Ensure FormEncryptor is loaded
            if (typeof FormEncryptor === 'undefined' || typeof FormEncryptor.processForm !== 'function') {
                alert('Critical error: FormEncryptor module not loaded. Please try again later or contact support.');
                if (submitButton) submitButton.disabled = false;
                return;
            }

            FormEncryptor.processForm(formElement, formType, RECAPTCHA_V3_SITE_KEY, BACKEND_SUBMISSION_URL)
                .then(response => {
                    console.log('Join page form submission response:', response);
                    // Display success message (e.g., in a dedicated div or alert)
                    // Assuming join.html might have a general feedback area or use alerts
                    const feedbackElement = document.getElementById('feedback-message'); // Generic ID, adjust if needed
                    if (feedbackElement) {
                        feedbackElement.textContent = response.message || 'Application submitted successfully! (Simulated)';
                        feedbackElement.style.color = response.success ? 'green' : 'red';
                        // Make it visible if it's hidden by default
                        // feedbackElement.style.display = 'block';
                    } else {
                        alert(response.message || 'Application submitted successfully! (Simulated)');
                    }
                    if (response.success) {
                       formElement.reset();
                    }
                })
                .catch(error => {
                    console.error('Join page form submission error:', error);
                    const feedbackElement = document.getElementById('feedback-message');
                    if (feedbackElement) {
                        feedbackElement.textContent = 'An error occurred: ' + error.message;
                        feedbackElement.style.color = 'red';
                        // feedbackElement.style.display = 'block';
                    } else {
                        alert('An error occurred during submission: ' + error.message);
                    }
                })
                .finally(() => {
                    if (submitButton) submitButton.disabled = false;
                });
        });
    } else {
        console.warn('Join page form (id="join-form") not found in join.html.');
    }
});
