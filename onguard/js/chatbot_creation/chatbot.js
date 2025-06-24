// onguard/js/chatbot_creation/chatbot.js
// This script runs *inside* the chatbot-widget.html iframe

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const log = document.getElementById('chat-log');
  const honeypotInput = form ? form.querySelector('[name="chatbot-honeypot"]') : null;
  const humanCheckbox = document.getElementById('human-verification-checkbox');

  if (!form || !input || !log) {
    console.error('ERROR:ChatbotWidget/DOMContentLoaded: Core chatbot UI elements (#chat-form, #chat-input, #chat-log) not found in iframe.');
    return;
  }
  if (!honeypotInput) {
    console.warn('WARN:ChatbotWidget/DOMContentLoaded: Honeypot field not found.');
  }
  if (!humanCheckbox) {
    console.warn('WARN:ChatbotWidget/DOMContentLoaded: Human verification checkbox not found.');
  }

  const addMessage = (text, sender = 'user', isHTML = false) => {
    const msg = document.createElement('div');
    msg.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    if (isHTML) {
      msg.innerHTML = text; // Use with trusted HTML only
    } else {
      msg.textContent = text;
    }
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  };

  // Simulate bot responding (replace with actual bot logic / API call)
  const getSimulatedBotReply = async (userInput) => {
    console.log(`INFO:ChatbotWidget/getSimulatedBotReply: Simulating bot reply for: "${userInput}"`);
    const lowerInput = userInput.toLowerCase();
    let botResponse = "Thanks for your message! A support agent will be with you shortly."; // Default

    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      botResponse = "Hello there! How can I assist you today?";
    } else if (lowerInput.includes('help')) {
      botResponse = "I can help with general questions. For specific account issues, an agent will assist you. What do you need help with?";
    } else if (lowerInput.includes('price') || lowerInput.includes('pricing')) {
      botResponse = "You can find our pricing details on the main website under 'Services' or by contacting sales.";
    } else if (lowerInput.includes('bye')) {
      botResponse = "Goodbye! Have a great day.";
    }
    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
    addMessage(botResponse, 'bot');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userInput = input.value.trim();
    if (!userInput) return;

    // 1. Check Honeypot
    if (honeypotInput && honeypotInput.value !== '') {
      console.warn('WARN:ChatbotWidget/submit: Honeypot filled. Potential bot. Submission blocked.');
      // Optionally, you can silently log this and not inform the user, or give a generic error.
      // addMessage("Submission blocked.", 'bot');
      return;
    }

    // 2. Check 'Are you human?' checkbox (placeholder for real reCAPTCHA)
    if (humanCheckbox && !humanCheckbox.checked) {
      addMessage("Please confirm you are human by checking the box.", 'bot');
      return;
    }
    // For a real reCAPTCHA v2 Checkbox, you'd get a token here:
    // const recaptchaToken = grecaptcha.getResponse();
    // if (!recaptchaToken) { addMessage("Please complete the reCAPTCHA.", 'bot'); return; }
    // For reCAPTCHA v3, it's a score obtained differently.

    addMessage(userInput, 'user');
    input.value = '';

    // 3. Conceptual: Send to worker for intrusion check / pre-processing
    console.log('INFO:ChatbotWidget/submit: Conceptually sending to worker for intrusion check.');
    let intrusionCheckPassed = true; // Assume it passes for now
    const conceptualWorkerEndpoint = '/api/chatbot_message_check'; // This would be a real endpoint

    /* Conceptual fetch to worker:
    try {
      const workerResponse = await fetch(conceptualWorkerEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          // recaptchaToken: recaptchaToken, // If using real reCAPTCHA
        })
      });
      if (!workerResponse.ok) {
        const errorResult = await workerResponse.json().catch(() => ({}));
        addMessage(`Security check failed: ${errorResult.message || 'Please try again.'}`, 'bot');
        intrusionCheckPassed = false;
      } else {
        const checkResult = await workerResponse.json();
        if (!checkResult.success) {
          addMessage(checkResult.message || "Message could not be processed at this time.", 'bot');
          intrusionCheckPassed = false;
        }
      }
    } catch (error) {
      console.error('ERROR:ChatbotWidget/submit: Error during intrusion check worker call:', error);
      addMessage("Error connecting to security service. Please try again later.", 'bot');
      intrusionCheckPassed = false;
    }
    */

    if (intrusionCheckPassed) {
      // 4. If check passes, get bot reply (currently simulated)
      getSimulatedBotReply(userInput);
    }

    // Reset human checkbox for next interaction
    if(humanCheckbox) humanCheckbox.checked = false;

    console.log('EVENT:ChatbotWidget/chatForm#submit: User message processed.');
  });

  // Initial greeting from bot
  setTimeout(() => {
    addMessage("Hello! I'm your OPS Solutions assistant. How can I help you today?", 'bot');
  }, 500);

  console.log('INFO:ChatbotWidget/DOMContentLoaded: Chatbot widget JS initialized inside iframe.');
});
