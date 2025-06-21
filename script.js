// script.js - Functionality for the Secure AI Chatbot Interface (Click-to-Activate)

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element References - UPDATED WITH 'ops' PREFIX
    const chatbotLauncher = document.getElementById('opsChatbotLauncher');
    const mobileChatLauncher = document.getElementById('mobileChatLauncher'); // New launcher for mobile nav
    const chatContainerWrapper = document.getElementById('opsChatContainerWrapper');
    const aiChatbotContainer = document.getElementById('aiChatbotContainer'); // This ID is on the .chat-container div
    const closeChatbotButton = document.getElementById('opsCloseChatbot');
    const chatMessages = document.getElementById('opsChatMessages');
    const userInput = document.getElementById('opsUserInput');
    const sendButton = document.getElementById('opsSendButton');
    const chatForm = document.getElementById('opsChatForm');
    const honeypotInput = document.getElementById('ops_contact_me_by_fax_only'); // Matches new ID in HTML
    const securityCheckContainer = document.getElementById('opsSecurityCheckContainer');
    const captchaPlaceholder = document.getElementById('opsCaptchaPlaceholder');
    // State Variables
    let humanVerified = false;
    let captchaLoaded = false;
    let captchaType = 'recaptcha'; // or 'turnstile' - CHOOSE ONE and set site key below
    let chatActive = false;
    let honeypotIntervalId = null;
    // --- Configuration ---
    const CLOUDFLARE_AI_ENDPOINT = 'https://your-cloudflare-ai-endpoint.example.com/chat';
    const BACKEND_VERIFY_ENDPOINT = '/api/verify-captcha';
    const HONEYPOT_ALERT_ENDPOINT = '/api/log-honeypot-trigger';
    // IMPORTANT: SET YOUR SITE KEY HERE
    const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_V2_SITE_KEY_NEEDS_TO_BE_SET';
    const TURNSTILE_SITE_KEY = 'YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY_NEEDS_TO_BE_SET';
    // --- Utility Functions ---
    function appendMessage(text, sender, isHTML = false) {
        if (!chatMessages) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);
        const paragraph = document.createElement('p');
        if (isHTML) {
            paragraph.innerHTML = text;
        } else {
            paragraph.textContent = text;
        }
        messageDiv.appendChild(paragraph);
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sanitizeText(text) {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    }

    function disableChat(message = "Chat disabled due to a security concern.") {
        if (!userInput || !sendButton) return;
        userInput.disabled = true;
        sendButton.disabled = true;
        userInput.placeholder = message;
        appendMessage(message, 'ai-message');
        console.warn(message);
    }
    // --- Honeypot Detection ---
    function checkHoneypot() {
        if (!honeypotInput) return false;
        if (honeypotInput.checked) {
            console.error("HONEYPOT TRIGGERED! Possible bot activity.");
            fetch(HONEYPOT_ALERT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'honeypot_triggered',
                    timestamp: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                }),
            })
            .catch(err => console.error("Error sending honeypot alert to backend:", err));
            disableChat("Chat session terminated due to suspicious activity.");
            // Optionally close chat window if open
            // if (chatActive) toggleChatbotUi(false);
            return true;
        }
        return false;
    }

    function startHoneypotChecks() {
        if (honeypotIntervalId === null) {
            honeypotIntervalId = setInterval(checkHoneypot, 3000);
        }
    }

    function stopHoneypotChecks() {
        if (honeypotIntervalId !== null) {
            clearInterval(honeypotIntervalId);
            honeypotIntervalId = null;
        }
    }

    // --- CAPTCHA Handling ---
    function loadCaptchaScript() {
        if (captchaLoaded) {
            renderCaptcha(); // If script loaded but widget needs re-rendering
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;

        if (captchaType === 'recaptcha') {
            script.src = `https://www.google.com/recaptcha/api.js?onload=onRecaptchaApiLoad&render=explicit`;
        } else if (captchaType === 'turnstile') {
            script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileApiLoad&render=explicit`;
        } else {
            console.error("Invalid CAPTCHA type configured.");
            disableChatFeatures("CAPTCHA configuration error.");
            return;
        }

        script.onload = () => {
            captchaLoaded = true;
            console.log(`${captchaType} API script loaded.`);
            // The onload function specified in src (e.g., onRecaptchaApiLoad) will call renderCaptcha.
        };
        script.onerror = () => {
            console.error(`Failed to load ${captchaType} API script.`);
            disableChatFeatures("Could not load CAPTCHA. Check connection or adblocker.");
        };
        document.head.appendChild(script);
    }

    function renderCaptcha() {
        if (!captchaLoaded || !captchaPlaceholder) return;
        captchaPlaceholder.innerHTML = ''; // Clear previous attempts

        if (captchaType === 'recaptcha') {
            if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
                try {
                     grecaptcha.render(captchaPlaceholder, {
                        'sitekey': RECAPTCHA_SITE_KEY,
                        'callback': 'onRecaptchaSuccess', // Global function
                        'expired-callback': 'onRecaptchaExpired' // Global function
                    });
                    console.log("reCAPTCHA widget rendering attempted.");
                } catch (e) {
                    console.error("Error rendering reCAPTCHA:", e);
                    disableChatFeatures("Error displaying CAPTCHA.");
                }
            } else {
                console.warn("grecaptcha not ready for render, will retry or wait for onload.");
            }
        } else if (captchaType === 'turnstile') {
            if (typeof turnstile !== 'undefined' && turnstile.render) {
                 try {
                    turnstile.render(captchaPlaceholder, {
                        'sitekey': TURNSTILE_SITE_KEY,
                        'callback': 'onTurnstileSuccess', // Global function
                        // Add other Turnstile options if needed
                    });
                    console.log("Turnstile widget rendering attempted.");
                } catch(e) {
                    console.error("Error rendering Turnstile:", e);
                    disableChatFeatures("Error displaying CAPTCHA.");
                }
            } else {
                console.warn("Turnstile not ready for render, will retry or wait for onload.");
            }
        }
    }

    // Make renderCaptcha available globally for CAPTCHA script onload callbacks
    window.onRecaptchaApiLoad = () => {
        console.log("reCAPTCHA API ready.");
        captchaLoaded = true; // Ensure flag is set if onload triggers first
        renderCaptcha();
    };
    window.onTurnstileApiLoad = () => {
        console.log("Turnstile API ready.");
        captchaLoaded = true; // Ensure flag is set
        renderCaptcha();
    };

    // Global CAPTCHA success/expired callbacks
    window.onRecaptchaSuccess = (token) => {
        console.log('reCAPTCHA token received.');
        verifyCaptchaTokenWithBackend('recaptcha', token);
    };
    window.onRecaptchaExpired = () => {
        console.warn('reCAPTCHA token expired.');
        disableChatFeatures("Your verification expired. Please verify again.");
        if (captchaLoaded && captchaType === 'recaptcha' && typeof grecaptcha !== 'undefined') grecaptcha.reset();
    };
    window.onTurnstileSuccess = (token) => {
        console.log('Cloudflare Turnstile token received.');
        verifyCaptchaTokenWithBackend('turnstile', token);
    };

    async function verifyCaptchaTokenWithBackend(type, token) {
        appendMessage("<em>Verifying...</em>", 'ai-message', true);
        try {
            // ... (Backend verification logic - same as before)
            const response = await fetch(BACKEND_VERIFY_ENDPOINT, { /* ... */ });
            const verificationStatusMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage) verificationStatusMessage.closest('.message')?.remove();

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    enableChatFeatures();
                } else {
                    disableChatFeatures(`Verification failed: ${data.message || 'Please try again.'}`);
                    if (captchaLoaded && type === 'recaptcha' && typeof grecaptcha !== 'undefined') grecaptcha.reset();
                    else if (captchaLoaded && type === 'turnstile' && typeof turnstile !== 'undefined') turnstile.reset(captchaPlaceholder.firstChild);
                }
            } else { /* ... error handling ... */
                disableChatFeatures(`Server error during verification. Please try again.`);
            }
        } catch (error) { /* ... error handling ... */
            const verificationStatusMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (verificationStatusMessage) verificationStatusMessage.closest('.message')?.remove();
            disableChatFeatures("Network error during verification. Please try again.");
        }
    }
    // --- Chat UI and Feature Enable/Disable ---
    function enableChatFeatures() {
        humanVerified = true;
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.placeholder = "Type your message...";
        if (securityCheckContainer) securityCheckContainer.style.display = 'none';
        appendMessage("Verification successful! You can start chatting now.", 'ai-message');
        userInput.focus();
    }
    function disableChatFeatures(message = "Please complete the security check to continue.") {
        humanVerified = false;
        if (userInput) userInput.disabled = true;
        if (sendButton) sendButton.disabled = true;
        if (userInput) userInput.placeholder = message;
        if (securityCheckContainer) securityCheckContainer.style.display = 'block';
        // If CAPTCHA is already loaded, ensure it's visible and potentially reset it
        if (captchaLoaded) {
            renderCaptcha(); // Attempt to re-render or show CAPTCHA
        } else if (chatActive) { // Only load if chat is active but verification failed/expired
            loadCaptchaScript();
        }
    }

    // --- Chatbot Launcher and UI Toggle ---
    function toggleChatbotUi(show) {
        if (show) {
            chatActive = true;
            chatContainerWrapper.classList.add('active'); // Shows the chat window
            chatbotLauncher.classList.add('hidden');    // Hides the launcher
            aiChatbotContainer.removeAttribute('hidden');
            // Initial message and CAPTCHA logic
            chatMessages.innerHTML = ''; // Clear previous messages
            appendMessage("Welcome! Please complete the security check to begin.", 'ai-message');
            disableChatFeatures(); // This will trigger CAPTCHA loading if not already loaded
            startHoneypotChecks(); // Start honeypot checks only when chat is active
            userInput.focus(); // Focus on input if possible (after CAPTCHA)
        } else {
            chatActive = false;
            chatContainerWrapper.classList.remove('active');
            chatbotLauncher.classList.remove('hidden');
            aiChatbotContainer.setAttribute('hidden', 'true');
            stopHoneypotChecks(); // Stop honeypot checks when chat is closed
            // Optionally reset chat state further (e.g., humanVerified = false)
            humanVerified = false;
            captchaLoaded = false; // Reset captcha loaded state so it reloads next time
            if(captchaPlaceholder) captchaPlaceholder.innerHTML = ''; // Clear captcha widget
        }
    }
    chatbotLauncher.addEventListener('click', () => toggleChatbotUi(true));
    closeChatbotButton.addEventListener('click', () => toggleChatbotUi(false));

    // Click outside to close
    document.addEventListener('click', (event) => {
        // Check if chat is active, if the chatbot container exists, and if the click is outside the container
        if (chatActive && aiChatbotContainer && !aiChatbotContainer.contains(event.target) && event.target !== chatbotLauncher) {
            // Ensure the click wasn't on the launcher itself, which would immediately reopen it
            console.log("Clicked outside chat container."); // For debugging
            toggleChatbotUi(false);
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (event) => {
        if (chatActive && event.key === "Escape") {
            console.log("ESC key pressed."); // For debugging
            toggleChatbotUi(false);
        }
    });
    // --- Chat Message Submission (largely same as before) ---
    chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (checkHoneypot()) return;
        if (!humanVerified) {
            appendMessage("Please complete the human verification first.", 'ai-message');
            return;
        }
        const userText = userInput.value.trim();
        if (userText === "") return;
        appendMessage(sanitizeText(userText), 'user-message');
        userInput.value = '';
        sendButton.disabled = true;
        appendMessage("<em>AI is thinking...</em>", 'ai-message', true);

        try {
            // ** SIMULATED AI RESPONSE (replace with actual fetch to CLOUDFLARE_AI_ENDPOINT) **
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
            let aiResponseText = `Simulated: You said "${sanitizeText(userText)}"`;
            // ... (rest of simulation or actual fetch logic)

            const thinkingMessage = chatMessages.querySelector(".ai-message:last-child em");
            if (thinkingMessage) thinkingMessage.closest('.message')?.remove();
            appendMessage(sanitizeText(aiResponseText), 'ai-message');
        } catch (error) {
            console.error("Error fetching AI response:", error);
            const thinkingMsg = chatMessages.querySelector(".ai-message:last-child em");
            if (thinkingMsg) thinkingMsg.closest('.message')?.remove();
            appendMessage(`Sorry, an error occurred. Please try again.`, 'ai-message');
        } finally {
            if (humanVerified) {
                sendButton.disabled = false;
                userInput.focus();
            }
        }
    });
    // --- Initial Page Setup ---
    // Chat is initially hidden. No chat features (CAPTCHA, input) are enabled by default.
    // Event listeners for launcher/close button handle activation.

    // Clean up honeypot interval on page unload (if active)
    window.addEventListener('beforeunload', () => {
        stopHoneypotChecks();
    });
});
