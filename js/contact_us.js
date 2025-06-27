// js/contact_us.js
// Handles submission logic, honeypot check, client-side sanitization, and basic feedback for Contact Us form

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    // Updated to use the ID of the honeypot field for robustness
    const honeypotField = contactForm ? document.getElementById('contact-honeypot') : null;

    if (!contactForm) {
        console.error('ERROR:ContactForm/Init: Contact form not found on page.');
        return;
    }

    if (!honeypotField) {
        console.warn('WARN:ContactForm/Init: Honeypot field (id: contact-honeypot) is missing.');
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = window.sanitizeInput(value);
        }

        // Bot prevention: honeypot
        if (honeypotField && honeypotField.value.trim() !== '') {
            console.warn("WARN:ContactForm/submit: Honeypot field filled — likely bot. Submission blocked.");
            // alert("Your submission could not be processed. Please try again."); // Replaced alert
            console.log("User feedback: Submission could not be processed (Honeypot).");
            return;
        }

        // Validation (expandable)
        if (!data.name || !data.email || !data.message) {
            // alert("Please fill out all required fields."); // Replaced alert
            console.log("User feedback: Please fill out all required fields (Contact Form).");
            // Ideally, highlight fields or show message near form
            return;
        }

        try {
            // Simulated sending process (replace with real endpoint)
            console.log("INFO:ContactForm/submit: Submitting sanitized data:", data);

            // Placeholder for real API call:
            /*
            const response = await fetch('/api/send-contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Network response was not ok");

            const result = await response.json();
            if (!result.success) throw new Error(result.message || "Unknown error");
            */

            // alert("Thank you for contacting us! We’ll get back to you shortly."); // Replaced alert
            console.log("User feedback: Thank you for contacting us! We’ll get back to you shortly. (Contact Form)");
            contactForm.reset();
        } catch (error) {
            console.error("ERROR:ContactForm/submit:", error);
            // alert("There was a problem sending your message. Please try again later."); // Replaced alert
            console.log("User feedback: There was a problem sending your message. Please try again later. (Contact Form)");
        }
    });

    console.log('INFO:ContactForm/DOMContentLoaded: Contact form script initialized.');
});
