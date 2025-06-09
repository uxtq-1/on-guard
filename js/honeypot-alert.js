'use strict';
document.addEventListener('DOMContentLoaded', function() {
  const setupHoneypotCheck = (formId) => {
    const formElement = document.getElementById(formId);
    if (!formElement) {
      // console.warn('Honeypot check: Form not found - ' + formId); // Optional: for debugging if a form is missing
      return;
    }

    formElement.addEventListener('submit', async function(e) {
      // Find the honeypot field within this specific form
      const honeypot = formElement.querySelector('input[name="contact_preference_notes"]');

      if (honeypot && honeypot.value.trim() !== '') {
        e.preventDefault(); // Stop form submission for this form

        const workerUrl = 'YOUR_ACTUAL_HONEYPOT_WORKER_URL'; // TODO: Replace with your actual honeypot alert worker URL
        const payload = {
          message: 'Bot detected via honeypot field on form: ' + formId,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          page: window.location.href,
          formData: { // Only include non-sensitive data or indicators
            honeypotName: honeypot.name,
            honeypotValueFirstChars: honeypot.value.substring(0, 50) // Example: send only a snippet
          }
        };

        try {
          // Send alert to Cloudflare Worker
          const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (response.ok) {
            console.warn(`Bot detected on ${formId} – Cloudflare Worker notified.`);
          } else {
            console.error(`Bot detected on ${formId} – Cloudflare Worker notification failed. Status: ${response.status}`);
          }
        } catch (error) {
          console.error(`Error sending bot alert to Cloudflare Worker for ${formId}:`, error);
        }
        // Do not provide user feedback that they've been caught, just block submission.
        // The original form submission via main.js will not proceed due to e.preventDefault()
        // and no further positive action here.
        return false; // Explicitly stop for clarity, though preventDefault handles it.
      }
      // If honeypot is empty, this event listener does nothing, and
      // the form submission will be handled by its regular submit listener in main.js
    }, true); // Use capture phase to intercept submission early
  };

  setupHoneypotCheck('join-form');
  setupHoneypotCheck('contact-form');
});
