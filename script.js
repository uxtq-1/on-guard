// script.js - Functionality for the Secure AI Chatbot Interface

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References
    const chatMessages = document.getElementById('chatMessages'); // Container for chat messages
    const userInput = document.getElementById('userInput');       // Text input for user messages
    const sendButton = document.getElementById('sendButton');     // Button to send messages
    const chatForm = document.getElementById('chatForm');         // Form wrapping input and send button
    const honeypotInput = document.getElementById('contact_me_by_fax_only'); // Hidden honeypot checkbox
    const securityCheckContainer = document.getElementById('securityCheckContainer'); // Container for reCAPTCHA/Turnstile
    const chatInputArea = document.querySelector('.chat-input-area'); // The footer area with input elements

    // State Variables
    let humanVerified = false; // Tracks if reCAPTCHA/Turnstile verification was successful

    // --- Configuration ---
    // IMPORTANT: Replace with your actual Cloudflare AI endpoint. This is a placeholder.
    const CLOUDFLARE_AI_ENDPOINT = 'https://your-cloudflare-ai-endpoint.example.com/chat';
    // IMPORTANT: Replace with your actual backend endpoint for verifying security tokens (reCAPTCHA/Turnstile)
    const BACKEND_VERIFY_ENDPOINT = '/api/verify-captcha'; // Example: your server API to verify the CAPTCHA token
    // IMPORTANT: Replace with your actual backend endpoint for logging honeypot alerts
    const HONEYPOT_ALERT_ENDPOINT = '/api/log-honeypot-trigger'; // Example: your server API to log honeypot events

    // --- Utility Functions ---

    /**
     * Appends a message to the chat window.
     * @param {string} text - The message text.
     * @param {string} sender - 'user-message' or 'ai-message'.
     * @param {boolean} [isHTML=false] - If true, `text` is treated as HTML. Use with caution and only for trusted content.
     */
    function appendMessage(text, sender, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender); // e.g., class="message user-message"

        const paragraph = document.createElement('p');
        if (isHTML) {
            // WARNING: Only use isHTML=true for trusted content (e.g., "AI is thinking..." from this script).
            // Never use with user-supplied or AI-generated content without proper sanitization if it might contain HTML.
            paragraph.innerHTML = text;
        } else {
            // Default: treat text as plain text to prevent XSS.
            // `textContent` automatically handles escaping of HTML special characters.
            paragraph.textContent = text;
        }
        messageDiv.appendChild(paragraph);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    /**
     * Basic text sanitization. Converts text to its HTML entity equivalent.
     * This helps prevent XSS if you were to display user input using `innerHTML` somewhere (though `textContent` is preferred).
     * For displaying in `textContent`, this isn't strictly necessary but is good practice if the text might be used elsewhere.
     * @param {string} text - The text to sanitize.
     * @returns {string} Sanitized text.
     */
    function sanitizeText(text) {
        const temp = document.createElement('div');
        temp.textContent = text; // Browser handles escaping when setting textContent
        return temp.innerHTML;   // Returns the escaped HTML string
    }

    /**
     * Disables the chat input and send button, displaying a message.
     * @param {string} [message="Chat disabled due to a security concern."] - The message to display.
     */
    function disableChat(message = "Chat disabled due to a security concern.") {
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = message;
        appendMessage(message, 'ai-message'); // Inform user in chat
        console.warn(message); // Log to console for developers
    }

    // --- Honeypot Detection ---
    /**
     * Checks if the honeypot field has been filled.
     * If triggered, simulates alerting backend and disables chat.
     * @returns {boolean} True if honeypot was triggered, false otherwise.
     */
    function checkHoneypot() {
        if (honeypotInput.checked) { // The honeypot is a checkbox in this example
            console.error("HONEYPOT TRIGGERED! Possible bot activity.");

            // CRITICAL: Send an alert to your backend for logging and potential IP blocking.
            // This is a client-side simulation; true blocking requires server-side action.
            fetch(HONEYPOT_ALERT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'honeypot_triggered',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent, // Example of additional info
                    // Server-side, you'd get the IP address from the request.
                }),
            })
            .then(response => response.json())
            .then(data => console.log("Honeypot alert server response:", data))
            .catch(err => console.error("Error sending honeypot alert to backend:", err));

            disableChat("Chat session terminated due to suspicious activity.");
            // Consider additional client-side actions:
            // - Clear chat history to prevent further interaction.
            // - Redirect to a generic error page or information page.
            return true; // Honeypot was triggered
        }
        return false; // Honeypot not triggered
    }

    // Periodically check the honeypot. Some bots might fill fields after initial page load via JavaScript.
    // This client-side check is a deterrent. Robust detection relies on server-side validation for any sensitive action.
    const honeypotInterval = setInterval(checkHoneypot, 3000); // Check every 3 seconds. Clear this interval if chat is legitimately closed.

    // --- reCAPTCHA / Cloudflare Turnstile Callbacks ---
    // These functions MUST be globally accessible (assigned to `window.`) because the
    // reCAPTCHA/Turnstile scripts will call them by their string names from the global scope.

    /**
     * Callback function for successful Google reCAPTCHA v2 verification.
     * @param {string} token - The reCAPTCHA response token.
     */
    window.onRecaptchaSuccess = function (token) {
        console.log('reCAPTCHA token received:', token); // For debugging
        // IMPORTANT: Send this token to your backend for server-side verification.
        // Do not trust client-side success alone.
        verifyCaptchaTokenWithBackend('recaptcha', token);
    };

    /**
     * Callback function if the Google reCAPTCHA v2 response expires.
     */
    window.onRecaptchaExpired = function () {
        console.warn('reCAPTCHA token expired.');
        disableChatFeatures("Your verification expired. Please verify again.");
        // Optionally, reset the reCAPTCHA widget if the library supports it, or prompt user to re-verify.
        // grecaptcha.reset(); // If using Google reCAPTCHA
    };

    /**
     * Callback function for successful Cloudflare Turnstile verification.
     * @param {string} token - The Turnstile response token.
     */
    window.onTurnstileSuccess = function (token) {
        console.log('Cloudflare Turnstile token received:', token); // For debugging
        // IMPORTANT: Send this token to your backend for server-side verification.
        verifyCaptchaTokenWithBackend('turnstile', token);
    };

    /**
     * (Conceptual) Sends the CAPTCHA token to the backend for verification.
     * @param {string} type - 'recaptcha' or 'turnstile'.
     * @param {string} token - The CAPTCHA token.
     */
    async function verifyCaptchaTokenWithBackend(type, token) {
        appendMessage("<em>Verifying...</em>", 'ai-message', true);
        try {
            const response = await fetch(BACKEND_VERIFY_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ captchaType: type, captchaToken: token }),
            });

            const verificationStatusMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage && verificationStatusMessage.textContent === "Verifying...") {
                verificationStatusMessage.closest('.message').remove();
            }

            if (response.ok) {
                const data = await response.json();
                if (data.success) { // Assuming backend returns { "success": true }
                    console.log(`${type} verification successful on backend.`);
                    enableChatFeatures();
                } else {
                    console.error(`${type} verification failed on backend:`, data.message || 'Unknown error');
                    disableChatFeatures(`Verification failed: ${data.message || 'Please try again.'}`);
                    // Consider resetting the CAPTCHA widget here if appropriate.
                }
            } else {
                const errorText = await response.text();
                console.error(`Server error during ${type} verification: ${response.status}`, errorText);
                disableChatFeatures(`Server error during verification (${response.status}). Please try again later.`);
            }
        } catch (error) {
            console.error(`Network or other error during ${type} verification:`, error);
            const verificationStatusMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage && verificationStatusMessage.textContent === "Verifying...") {
                verificationStatusMessage.closest('.message').remove();
            }
            disableChatFeatures("Network error during verification. Please check your connection and try again.");
        }
    }


    /**
     * Enables chat input and hides the security check. Called after successful verification.
     */
    function enableChatFeatures() {
        humanVerified = true;
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.placeholder = "Type your message...";
        if (securityCheckContainer) securityCheckContainer.style.display = 'none'; // Hide reCAPTCHA/Turnstile section
        if (chatInputArea) chatInputArea.style.display = 'flex'; // Ensure input area is visible (if previously hidden)
        appendMessage("Verification successful! You can start chatting now.", 'ai-message');
        userInput.focus();
    }

    /**
     * Disables chat input and shows the security check. Called on page load or verification failure/expiry.
     * @param {string} [message="Please complete the security check to continue."] - Message for input placeholder.
     */
    function disableChatFeatures(message = "Please complete the security check to continue.") {
        humanVerified = false;
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = message;
        if (securityCheckContainer) securityCheckContainer.style.display = 'block'; // Show reCAPTCHA/Turnstile section
        // Optionally hide chatInputArea if securityCheckContainer is prominent enough
        // if (chatInputArea) chatInputArea.style.display = 'none';
    }


    // --- Chat Functionality ---
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default page reload on form submission

        if (checkHoneypot()) return; // Final check of honeypot before sending message

        if (!humanVerified) {
            appendMessage("Please complete the human verification (e.g., reCAPTCHA) before sending messages.", 'ai-message');
            // Shake animation or highlight for security check container could be added here.
            return;
        }

        const userText = userInput.value.trim();
        if (userText === "") return; // Don't send empty messages

        // Display user's message (sanitized for safety, though textContent in appendMessage handles it)
        appendMessage(sanitizeText(userText), 'user-message');
        userInput.value = ''; // Clear the input field
        sendButton.disabled = true; // Disable send button while AI is "thinking" or request is in flight

        // Show "AI is thinking..." indicator
        appendMessage("<em>AI is thinking...</em>", 'ai-message', true); // isHTML = true for simple italics

        try {
            // ** ACTUAL AI INTEGRATION (Replace Simulated Response) **
            // This is where you would make the fetch call to your Cloudflare AI endpoint.
            /*
            const response = await fetch(CLOUDFLARE_AI_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': 'Bearer YOUR_CLOUDFLARE_AUTH_TOKEN' // Include if your AI endpoint requires auth
                },
                body: JSON.stringify({ message: userText }) // Send user's message in the expected format
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText })); // Try to get JSON error, fallback to statusText
                throw new Error(`AI service error: ${response.status}. ${errorData.detail || ''}`);
            }

            const aiData = await response.json();
            // Assuming the AI response is in a property like 'reply' or 'message'
            const aiResponseText = aiData.reply || aiData.message || "Sorry, I couldn't process that.";
            */

            // ** Simulated AI Response (REMOVE OR COMMENT OUT FOR ACTUAL IMPLEMENTATION) **
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000)); // Simulate network delay
            let aiResponseText = "This is a placeholder AI response. ";
            if (userText.toLowerCase().includes("hello") || userText.toLowerCase().includes("hi")) {
                aiResponseText += "Hello there! How can I assist you today?";
            } else if (userText.toLowerCase().includes("security")) {
                aiResponseText += "This chat interface includes several security measures like CSP, a honeypot, and human verification to ensure a safe interaction.";
            } else if (userText.toLowerCase().includes("purple")) {
                aiResponseText += "Indeed, the interface uses a purple theme for a distinct look!";
            } else {
                aiResponseText += `I received: "${sanitizeText(userText)}"`; // Echo sanitized input
            }
            // ** End of Simulated Response **


            // Remove "AI is thinking..." message before appending the actual AI response
            const thinkingMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (thinkingMessage && thinkingMessage.textContent === "AI is thinking...") {
                thinkingMessage.closest('.message').remove();
            }

            // Display AI's response (sanitize if AI responses can contain user-generated content or HTML)
            // If AI responses are guaranteed plain text, sanitizeText might be overly cautious but safe.
            appendMessage(sanitizeText(aiResponseText), 'ai-message');

        } catch (error) {
            console.error("Error fetching AI response:", error);
            // Remove "AI is thinking..." message if it's still there on error
            const thinkingMessageOnError = chatMessages.querySelector(".ai-message:last-child em");
            if (thinkingMessageOnError && thinkingMessageOnError.textContent === "AI is thinking...") {
                thinkingMessageOnError.closest('.message').remove();
            }
            appendMessage(`Sorry, an error occurred: ${error.message || 'Unable to connect to AI service.'}`, 'ai-message');
        } finally {
            // Re-enable send button only if human verification is still valid
            if (humanVerified) {
                 sendButton.disabled = false;
                 userInput.focus(); // Set focus back to input field for convenience
            }
        }
    });

    // --- Initial Page Setup ---
    // Disable chat features until human verification is complete.
    disableChatFeatures();

    // FOR TESTING/DEVELOPMENT ONLY:
    // Uncomment the line below to bypass CAPTCHA for faster testing.
    // IMPORTANT: REMOVE OR COMMENT OUT THIS LINE FOR PRODUCTION.
    // enableChatFeatures();

    // Add a general security note for the user in the chat (optional)
    // appendMessage("For your security, please ensure you are on the correct website and avoid sharing sensitive personal information.", 'ai-message');

    // Clean up interval on page unload (though modern browsers might do this)
    window.addEventListener('beforeunload', () => {
        clearInterval(honeypotInterval);
    });
});
