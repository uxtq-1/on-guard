// js/chatbot_creation/chatbot.js
// Triple-guarded: honeypot, Cloudflare Worker, reCAPTCHA v3
import { sanitizeInput } from '../core/sanitize-input.js';

function applyTheme(theme) {
  if (theme) document.body.setAttribute('data-theme', theme);
}

const I18N = {
  en: {
    suspiciousActivity: 'Suspicious activity detected. Please reload the page.',
    lockdownMessage: 'Bot activity detected. Chat disabled.',
    verifyHuman: 'Please confirm you are human by checking the box.',
    recaptchaFail: 'reCAPTCHA verification failed. Please try again.',
    serverError: 'Error verifying message with server. Try again later.',
    messageBlocked: 'Message blocked for security reasons.',
    defaultReply: 'Thanks for your message! A support agent will be with you shortly.',
    hello: 'Hello! How can I help you today?',
    help: 'I can help with general questions. For specific account issues, an agent will assist you. What do you need help with?',
    pricing: 'Please see our pricing on the main website or contact sales.',
    bye: 'Goodbye! Have a great day.',
    intro: "Hi, I'm Chattia",
    verifyBottom: 'At the bottom; please verify you are human'
  },
  es: {
    suspiciousActivity: 'Actividad sospechosa detectada. Por favor recarga la página.',
    lockdownMessage: 'Actividad de bot detectada. Chat deshabilitado.',
    verifyHuman: 'Por favor confirma que eres humano marcando la casilla.',
    recaptchaFail: 'La verificación reCAPTCHA falló. Inténtalo de nuevo.',
    serverError: 'Error al verificar el mensaje con el servidor. Intenta de nuevo más tarde.',
    messageBlocked: 'Mensaje bloqueado por razones de seguridad.',
    defaultReply: '¡Gracias por tu mensaje! Un agente de soporte te ayudará en breve.',
    hello: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    help: 'Puedo ayudar con preguntas generales. Para asuntos de cuenta, un agente te asistirá. ¿Con qué necesitas ayuda?',
    pricing: 'Consulta nuestros precios en el sitio principal o contacta ventas.',
    bye: '¡Adiós! Que tengas un gran día.',
    intro: 'Hola, soy Chattia',
    verifyBottom: 'Al final, verifica que eres humano'
  }
};

let currentLang = document.documentElement.lang || 'en';

let form, input, log, sendBtn, honeypotInput, humanCheckbox;

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyI18n() {
  if (typeof input !== 'undefined') {
    const ph = input.dataset[currentLang + 'Placeholder'] || input.placeholder;
    input.placeholder = ph;
    const lab = input.dataset[currentLang + 'Label'];
    if (lab) input.setAttribute('aria-label', lab);
  }
  if (typeof sendBtn !== 'undefined') {
    const text = sendBtn.dataset[currentLang] || sendBtn.textContent;
    sendBtn.textContent = text;
    const label = sendBtn.dataset[currentLang + 'Label'];
    if (label) sendBtn.setAttribute('aria-label', label);
  }
  const recaptchaSpan = document.querySelector('.recaptcha-text');
  if (recaptchaSpan) {
    const txt = recaptchaSpan.dataset[currentLang] || recaptchaSpan.textContent;
    recaptchaSpan.textContent = txt;
  }
  const recaptchaLabel = document.querySelector('.recaptcha-label');
  if (recaptchaLabel) {
    const aria = recaptchaLabel.dataset[currentLang + 'Label'] || recaptchaLabel.getAttribute('aria-label');
    if (aria) recaptchaLabel.setAttribute('aria-label', aria);
  }
}

function setLanguage(lang) {
  if (!lang) return;
  currentLang = lang;
  document.documentElement.lang = lang; // Ensure this is set
  applyI18n();
}
window.setLanguage = setLanguage; // Expose globally

// Modify applyTheme to also handle body class for dark mode consistency
function applyTheme(theme) {
  if (theme) {
    document.body.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
window.applyTheme = applyTheme; // Expose globally


window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  const data = event.data || {};
  if (data.type === 'theme-change') {
    applyTheme(data.theme);
  } else if (data.type === 'language-change') {
    setLanguage(data.lang);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize theme and language from the current document
  // This makes it compatible with modal usage where parent might not be relevant
  // or when directly embedded.
  const initialTheme = document.body.getAttribute('data-theme') || (document.body.classList.contains('dark') ? 'dark' : 'light');
  applyTheme(initialTheme);

  const initialLang = document.documentElement.lang || 'en';
  // setLanguage(initialLang); // Call setLanguage to trigger i18n application

  form = document.getElementById('chat-form');
  input = document.getElementById('chat-input');
  log = document.getElementById('chat-log');
  sendBtn = form ? form.querySelector('[type="submit"]') : null;
  honeypotInput = form ? form.querySelector('[name="chatbot-honeypot"]') : null;
  humanCheckbox = document.getElementById('human-verification-checkbox');

  if (!form || !input || !log) {
    console.error('ERROR: Core chatbot UI elements not found in iframe.');
    return;
  }

  applyI18n();

  let lockedForBot = false;

  // Cloudflare Worker: Notify and block if honeypot triggered
  async function alertWorkerOfBotActivity(detail = "widget honeypot") {
    const workerBaseUrl = window.CHATBOT_CONFIG?.workerUrl || 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER';
    if (workerBaseUrl === 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER') {
      console.warn('Cloudflare Worker URL not configured. Bot activity alerts will not be sent.');
      // Optionally, you could disable chat or show a message if the worker URL isn't set.
      // For now, it just logs a warning.
    }
    try {
      await fetch(`${workerBaseUrl}/widget-bot-alert`, {
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

  function lockDownChat(reason = t('lockdownMessage')) {
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
        lockDownChat(t('suspiciousActivity'));
        alertWorkerOfBotActivity("honeypot filled (input)");
      }
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (lockedForBot) return;

    // Honeypot check
    if (honeypotInput && honeypotInput.value !== '') {
      lockDownChat(t('suspiciousActivity'));
      alertWorkerOfBotActivity("honeypot filled (submit)");
      return;
    }

    // Human check
    if (!humanCheckbox || !humanCheckbox.checked) {
      addMessage(t('verifyHuman'), 'bot');
      setHumanInteractionState(false);
      return;
    }

    // Google reCAPTCHA v3 (active, required before POST)
    let recaptchaToken = '';
    const recaptchaSiteKey = window.CHATBOT_CONFIG?.recaptchaSiteKey || 'YOUR_RECAPTCHA_SITE_KEY_PLACEHOLDER';
    if (recaptchaSiteKey === 'YOUR_RECAPTCHA_SITE_KEY_PLACEHOLDER') {
      console.error('reCAPTCHA Site Key not configured. Chatbot will not function correctly.');
      addMessage('Configuration error. Please contact support.', 'bot');
      // Optionally lock down chat if key is missing
      // lockDownChat('Configuration error.');
      return;
    }

    try {
      recaptchaToken = await grecaptcha.execute(recaptchaSiteKey, { action: 'chatbot_message' });
    } catch (err) {
      console.error('reCAPTCHA execution error:', err);
      addMessage(t('recaptchaFail'), 'bot');
      return;
    }

    // Message
    let userInput = input.value.trim();
    if (!userInput) return;

    const { sanitized, flagged } = sanitizeInput(userInput);
    if (userInput !== sanitized) {
        console.warn("Chatbot: User input was modified by sanitizer.");
    }
    if (flagged) {
        console.warn("Chatbot: user input flagged for potential sensitive content.");
    }
    userInput = sanitized; // Use the sanitized input

    addMessage(userInput, 'user');
    input.value = '';

    // POST to Cloudflare Worker (chatbot message check)
    const workerBaseUrl = window.CHATBOT_CONFIG?.workerUrl || 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER';
    if (workerBaseUrl === 'YOUR_CLOUDFLARE_WORKER_URL_PLACEHOLDER') {
      console.error('Cloudflare Worker URL not configured. Cannot send message.');
      addMessage('Chat service is temporarily unavailable.', 'bot');
      return;
    }

    try {
      const response = await fetch(`${workerBaseUrl}/chatbot_message_check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          recaptchaToken
        })
      });
      const result = await response.json();
      if (result.success && result.message) {
        addMessage(result.message, 'bot'); // Display LLM response
      } else {
        addMessage(result.message || t('messageBlocked'), 'bot');
      }
    } catch (err) {
      console.error('Error fetching from Cloudflare Worker:', err);
      addMessage(t('serverError'), 'bot');
      return;
    }
  });

  // Removed getSimulatedBotReply function as its logic is now replaced by the worker call.

  setTimeout(() => {
    // The user requested literal strings including the [data=...] parts.
    if (document.documentElement.lang === 'es') {
      addMessage("[data=es Hola, soy Chattia]", 'bot');
    } else {
      addMessage("[data=en Hi, I'm Chattia]", 'bot');
    }
    addMessage("[data=en data=es At the bottom; please verify you are human]", 'bot');
  }, 500);
});
