// js/chatbot_creation/chatbot.js
// Secure chatbot widget: honeypot, human check, worker check, reCAPTCHA v3 ready

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const log = document.getElementById('chat-log');
  const sendBtn = form ? form.querySelector('[type="submit"]') : null;
  const honeypotInput = form ? form.querySelector('[name="chatbot-honeypot"]') : null;
  const humanCheckbox = document.getElementById('human-verification-checkbox');

  if (!form || !input || !log) {
    console.error('ERROR: Core chatbot UI elements not found in iframe.');
    return;
  }

  let lockedForBot = false;

  function lockDownChat(reason = "Bot activity detected. Chat disabled.") {
    input.disabled = true;
    sendBtn && (sendBtn.disabled = true);
    humanCheckbox && (humanCheckbox.disabled = true);
    addMessage(reason, 'bot');
    lockedForBot = true;
  }

  function addMessage(text, sender = 'user', isHTML = false) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    if (isHTML) msg.innerHTML = text;
    else msg.textContent = text;
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  }

  async function alertWorkerOfBotActivity(detail = "honeypot") {
    try {
      await fetch('/api/bot-alert', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: 'honeypot',
          detail,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
      console.info("Bot alert sent to worker.");
    } catch (err) {
      console.warn("Failed to alert worker of bot activity.", err);
    }
  }

  function setHumanInteractionState(enabled) {
    if (lockedForBot) return;
    input.disabled = !enabled;
    sendBtn && (sendBtn.disabled = !enabled);
  }

  // On load: block chat until human check is confirmed
  setHumanInteractionState(false);

  // Human checkbox must be ticked to enable chat
  if (humanCheckbox) {
    humanCheckbox.addEventListener('change', () => {
      if (lockedForBot) return;
      setHumanInteractionState(humanCheckbox.checked);
      if (humanCheckbox.checked) input.focus();
    });
  }

  // If honeypot is filled (at any time), lock chat and alert worker
  if (honeypotInput) {
    honeypotInput.addEventListener('input', () => {
      if (honeypotInput.value !== '' && !lockedForBot) {
        lockDownChat("Suspicious activity detected. Please reload the page.");
        alertWorkerOfBotActivity("honeypot filled");
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lockedForBot) return;

    // 1. Honeypot check
    if (honeypotInput && honeypotInput.value !== '') {
      lockDownChat("Suspicious activity detected. Please reload the page.");
      alertWorkerOfBotActivity("honeypot filled (submit)");
      return;
    }

    // 2. Human verification
    if (!humanCheckbox || !humanCheckbox.checked) {
      addMessage("Please confirm you are human by checking the box.", 'bot');
      setHumanInteractionState(false);
      return;
    }

    // 3. Prepare reCAPTCHA (v3/invisible, ACTIVE)
    let recaptchaToken = '';
    try {
      // IMPORTANT: Replace 'YOUR_SITE_KEY' with your real reCAPTCHA v3 site key
      recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', { action: 'chatbot_message' });
    } catch (err) {
      addMessage("reCAPTCHA verification failed. Please try again.", 'bot');
      return;
    }

    // 4. Prepare and validate message
    const userInput = input.value.trim();
    if (!userInput) return;

    addMessage(userInput, 'user');
    input.value = '';

    // 5. POST to worker endpoint for message integrity/security check
    try {
      const response = await fetch('/api/chatbot_message_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userInput,
          recaptchaToken // Always send the token!
        })
      });
      const result = await response.json();
      if (!result.success) {
        addMessage(result.message || "Message blocked for security reasons.", 'bot');
        return;
      }
    } catch (err) {
      addMessage("Error verifying message with server. Try again later.", 'bot');
      return;
    }

    // 6. Simulate bot reply (replace with real logic if needed)
    getSimulatedBotReply(userInput);
  });

  function getSimulatedBotReply(userInput) {
    const lowerInput = userInput.toLowerCase();
    let botResponse = "Thanks for your message! A support agent will be with you shortly.";
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      botResponse = "Hello! How can I help you today?";
    } else if (lowerInput.includes('help')) {
      botResponse = "I can help with general questions. For specific account issues, an agent will assist you. What do you need help with?";
    } else if (lowerInput.includes('price') || lowerInput.includes('pricing')) {
      botResponse = "Please see our pricing on the main website or contact sales.";
    } else if (lowerInput.includes('bye')) {
      botResponse = "Goodbye! Have a great day.";
    }
    setTimeout(() => addMessage(botResponse, 'bot'), 700);
  }

  // Initial greeting (optional)
  setTimeout(() => {
    addMessage("Hello! I'm your OPS Solutions assistant. Please confirm you are human to start chatting.", 'bot');
  }, 500);
});
