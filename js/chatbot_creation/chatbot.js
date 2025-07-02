// js/chatbot_creation/chatbot.js
// Triple-guarded: honeypot, Cloudflare Worker, reCAPTCHA v3

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
    intro: "Hello I'm Chattia",
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
}

function setLanguage(lang) {
  if (!lang) return;
  currentLang = lang;
  document.documentElement.lang = lang;
  applyI18n();
}

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
  try {
    const parentTheme = window.parent.document.body.getAttribute('data-theme');
    applyTheme(parentTheme || 'light');
    const parentLang = window.parent.document.documentElement.getAttribute('lang');
    if (parentLang) setLanguage(parentLang);
  } catch (err) {
    console.warn('Unable to sync theme with parent on load.', err);
  }
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
    try {
      recaptchaToken = await grecaptcha.execute('YOUR_SITE_KEY', { action: 'chatbot_message' });
    } catch (err) {
      addMessage(t('recaptchaFail'), 'bot');
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
        addMessage(result.message || t('messageBlocked'), 'bot');
        return;
      }
    } catch (err) {
      addMessage(t('serverError'), 'bot');
      return;
    }

    // Simulated bot reply (replace with your logic)
    getSimulatedBotReply(userInput);
  });

  function getSimulatedBotReply(userInput) {
    const lowerInput = userInput.toLowerCase();
    let botResponse = t('defaultReply');
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      botResponse = t('hello');
    } else if (lowerInput.includes('help')) {
      botResponse = t('help');
    } else if (lowerInput.includes('price') || lowerInput.includes('pricing')) {
      botResponse = t('pricing');
    } else if (lowerInput.includes('bye')) {
      botResponse = t('bye');
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
    addMessage("Verifica que eres humano, luego pregúntame lo que quieras", 'bot');
  }, 500);
});
