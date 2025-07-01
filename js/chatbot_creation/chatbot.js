// js/chatbot_creation/chatbot.js
// Triple-guarded: honeypot, Cloudflare Worker, reCAPTCHA v3

function applyTheme(theme) {
  if (theme) document.body.setAttribute('data-theme', theme);
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data || {};
  if (data.type === 'theme-change') {
    applyTheme(data.theme);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    const parentTheme = window.parent.document.body.getAttribute('data-theme');
    applyTheme(parentTheme || 'light');
  } catch (err) {
    console.warn('Unable to sync theme with parent on load.', err);
  }
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

  // Cloudflare Worker: Notify and block if honeypot triggered
  async function alertWorkerOfBotActivity(detail = "widget honeypot") {
    try {
      await fetch('https://YOUR_CLOUDFLARE_WORKER_URL/widget-bot-alert', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          type: 'honeypot',
          detail,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent
        })
      });
      console.info("Bot alert sent to Cloudflare Worker.");
    } catch (err) {
      console.warn("Failed to alert worker of bot activity.", err);
    }
  }

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

  function setHumanInteractionState(enabled) {
    if (lockedForBot) return;
    input.disabled = !enabled;
    sendBtn && (sendBtn.disabled = !enabled);
  }

  setHumanInteractionState(false);

  // Human check
  if (humanCheckbox) {
    humanCheckbox.addEventListener('change', () => {
      if (lockedForBot) return;
      setHumanInteractionState(humanCheckbox.checked);
      if (humanCheckbox.checked) input.focus();
    });
  }

  // Honeypot triggers immediate lockdown and worker alert
  if (honeypotInput) {
    honeypotInput.addEventListener('input', () => {
      if (honeypotInput.value !== '' && !lockedForBot) {
        lockDownChat("Suspicious activity detected. Please reload the page.");
        alertWorkerOfBotActivity("honeypot filled (input)");
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lockedForBot) return;

    // Honeypot check
    if (honeypotInput && honeypotInput.value !== '') {
      lockDownChat("Suspicious activity detected. Please reload the page.");
      alertWorkerOfBotActivity("honeypot filled (submit)");
      return;
    }

    // Human check
    if (!humanCheckbox || !humanCheckbox.checked) {
      addMessage("Please confirm you are human by checking the box.", 'bot');
      setHumanInteractionState(false);
      return;
    }

    // Google reCAPTCHA v3 (active, required before POST)
    let recaptchaToken = '';
    try {
      recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', { action: 'chatbot_message' });
    } catch (err) {
      addMessage("reCAPTCHA verification failed. Please try again.", 'bot');
      return;
    }

    // Message
    const userInput = input.value.trim();
    if (!userInput) return;
    addMessage(userInput, 'user');
    input.value = '';

    // POST to Cloudflare Worker (chatbot message check)
    try {
      const response = await fetch('https://YOUR_CLOUDFLARE_WORKER_URL/chatbot_message_check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          recaptchaToken
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

    // Simulated bot reply (replace with your logic)
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

  setTimeout(() => {
    // The user requested literal strings including the [data=...] parts.
    if (document.documentElement.lang === 'es') {
      addMessage("Hola, soy Chattia", 'bot');
    } else {
      addMessage("Hello I'm Chattia", 'bot');
    }
    addMessage("At the bottom; please verify you are human", 'bot');
  }, 500);
});
