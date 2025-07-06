// js/chatbot_creation/chatbot.js
// Triple-guarded: honeypot, Cloudflare Worker, reCAPTCHA v3
import { sanitizeInput } from '../utils/sanitize.js';

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
    verifyBottom: 'At the bottom; please verify you are human',
    // Fallbacks for applyI18n if dataset attributes are missing
    askAnythingPlaceholder: "Ask me anything...",
    askAnythingLabel: "Ask me anything...",
    sendButtonText: "Send",
    sendButtonLabel: "Send Message",
    iAmHumanText: "I am human",
    iAmHumanLabel: "I am human"
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
    verifyBottom: 'Al final, verifica que eres humano',
    // Fallbacks for applyI18n if dataset attributes are missing
    askAnythingPlaceholder: "Pregúntame lo que sea...",
    askAnythingLabel: "Pregúntame lo que sea...",
    sendButtonText: "Enviar",
    sendButtonLabel: "Enviar Mensaje",
    iAmHumanText: "Soy humano",
    iAmHumanLabel: "Soy humano"
  }
};

let currentLang = 'en'; // Default, will be updated by sync logic

let form, input, log, sendBtn, honeypotInput, humanCheckbox, closeButton;

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyI18n() {
  if (!input || !input.dataset || !sendBtn || !sendBtn.dataset) {
    // Elements might not be ready yet if called too early by a rapid language change message
    // console.warn("applyI18n called before elements were fully initialized.");
    return;
  }

  // Input field
  const phKey = currentLang + 'Placeholder';
  const inputLabelKey = currentLang + 'Label';
  input.placeholder = input.dataset[phKey] || t('askAnythingPlaceholder');
  const inputLabelText = input.dataset[inputLabelKey] || t('askAnythingLabel');
  input.setAttribute('aria-label', inputLabelText);

  // Send button
  const buttonTextKey = currentLang; // dataset stores 'en' or 'es' directly for button text from HTML (e.g. data-en="Send")
  const buttonLabelKey = currentLang + 'Label';
  sendBtn.textContent = sendBtn.dataset[buttonTextKey] || t('sendButtonText');
  const buttonLabelText = sendBtn.dataset[buttonLabelKey] || t('sendButtonLabel');
  sendBtn.setAttribute('aria-label', buttonLabelText);

  // Recaptcha text
  const recaptchaSpan = document.querySelector('.recaptcha-text');
  if (recaptchaSpan && recaptchaSpan.dataset) {
    const recaptchaTextKey = currentLang; // data-en="I am human"
    recaptchaSpan.textContent = recaptchaSpan.dataset[recaptchaTextKey] || t('iAmHumanText');
  }

  // Recaptcha label
  const recaptchaLabelElement = document.querySelector('.recaptcha-label');
  if (recaptchaLabelElement && recaptchaLabelElement.dataset) {
    const recaptchaLabelKey = currentLang + 'Label'; // data-en-label="I am human"
    const recaptchaLabelText = recaptchaLabelElement.dataset[recaptchaLabelKey] || t('iAmHumanLabel');
    recaptchaLabelElement.setAttribute('aria-label', recaptchaLabelText);
  }
}

function setLanguage(lang) {
  if (!lang || (lang !== 'en' && lang !== 'es')) {
    console.warn(`Unsupported language: ${lang}. Defaulting to 'en'.`);
    currentLang = 'en';
  } else {
    currentLang = lang;
  }
  document.documentElement.lang = currentLang;
  applyI18n();
}

window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin && event.origin !== "null") { // "null" for local file testing
    // console.warn('Blocked message from different origin:', event.origin);
    return;
  }
  const data = event.data || {};
  if (data.type === 'theme-change') {
    applyTheme(data.theme);
  } else if (data.type === 'language-change') {
    setLanguage(data.lang);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements first
  form = document.getElementById('chat-form');
  input = document.getElementById('chat-input');
  log = document.getElementById('chat-log');
  sendBtn = form ? form.querySelector('[type="submit"]') : null;
  honeypotInput = form ? form.querySelector('[name="chatbot-honeypot"]') : null;
  humanCheckbox = document.getElementById('human-verification-checkbox');
  closeButton = document.getElementById('chatbot-close-button');
  if (!form || !input || !log || !closeButton) {
    console.error('ERROR: Core chatbot UI elements not found in iframe.');
    if (!closeButton) console.error("Missing: closeButton");
    return;
  }

  // Attempt to set language from parent first.
  let initialLangSet = false;
  try {
    // Important: Accessing window.parent properties can fail due to cross-origin restrictions
    // if the iframe and parent are not same-origin. Check this if issues persist.
    const parentLang = window.parent.document.documentElement.getAttribute('lang');
    if (parentLang && (parentLang === 'en' || parentLang === 'es')) {
      setLanguage(parentLang); // This calls applyI18n()
      initialLangSet = true;
    }
  } catch (err) {
    // This catch block will be hit if parent is cross-origin.
    console.warn('Unable to sync language with parent on load (cross-origin or parent not ready). Falling back.', err.message);
  }

  // If not set by parent, try to use the iframe's HTML lang attribute, then default to 'en'.
  if (!initialLangSet) {
    const docLang = document.documentElement.lang;
    if (docLang && (docLang === 'en' || docLang === 'es')) {
      setLanguage(docLang);
    } else {
      setLanguage('en'); // Default if no valid lang found
    }
  }
  // applyI18n() is called by setLanguage, so no need for an extra call here.

  // Theme syncing (similar cross-origin caveats apply)
  try {
    const parentTheme = window.parent.document.body.getAttribute('data-theme');
    applyTheme(parentTheme || 'light');
  } catch (err) {
    console.warn('Unable to sync theme with parent on load (cross-origin or parent not ready).', err.message);
  }

  // ---- Language toggle for chat input placeholder on click ----
  let isInputPlaceholderAlternate = false; // false = currentLang, true = other lang

  if (input) {
    input.addEventListener('click', () => {
      if (!input.dataset) return;

      let placeholderLangToSet;
      let ariaLabelLangToSet;

      if (isInputPlaceholderAlternate) {
        // Switch back to current global language for placeholder
        placeholderLangToSet = currentLang;
      } else {
        // Switch to the other language for placeholder
        placeholderLangToSet = (currentLang === 'en') ? 'es' : 'en';
      }

      // The aria-label should ideally also toggle, or consistently match the global language.
      // For this implementation, let's make aria-label also toggle with the placeholder.
      ariaLabelLangToSet = placeholderLangToSet;

      const placeholderKey = placeholderLangToSet + 'Placeholder';
      const ariaLabelKey = ariaLabelLangToSet + 'Label';

      input.placeholder = input.dataset[placeholderKey] || I18N[placeholderLangToSet]?.askAnythingPlaceholder || input.placeholder;
      const newAriaLabel = input.dataset[ariaLabelKey] || I18N[ariaLabelLangToSet]?.askAnythingLabel || input.getAttribute('aria-label');
      input.setAttribute('aria-label', newAriaLabel);

      isInputPlaceholderAlternate = !isInputPlaceholderAlternate;
    });

    // Optional: Reset placeholder to match global lang when input loses focus (blur)
    // This prevents confusion if user clicks, changes placeholder, then parent lang changes.
    input.addEventListener('blur', () => {
      if (!input.dataset) return;
      // Reset placeholder and aria-label to match current global language
      const placeholderKey = currentLang + 'Placeholder';
      const ariaLabelKey = currentLang + 'Label';
      input.placeholder = input.dataset[placeholderKey] || t('askAnythingPlaceholder');
      input.setAttribute('aria-label', input.dataset[ariaLabelKey] || t('askAnythingLabel'));
      isInputPlaceholderAlternate = false; // Reset toggle state
    });
  }
  // ---- End language toggle for chat input ----

  // Function to close the chatbot (by notifying the parent window)
  function closeChatbot() {
    // Inform the parent window to hide/remove the chatbot iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'chatbot-close' }, window.location.origin);
    } else {
      // Fallback if not in an iframe (e.g., direct testing)
      console.warn("Chatbot close requested, but not in an iframe or parent communication failed. Hiding body.");
      document.body.style.display = 'none';
    }
  }

  // Event listener for the close button
  closeButton.addEventListener('click', closeChatbot);

  // Event listener for the ESC key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeChatbot();
    }
  });

  // Placeholder for parent window handling "click outside to close"
  // This needs to be implemented in the script that manages the chatbot iframe on the parent page.
  // Example message type to listen for from parent:
  // window.addEventListener('message', (event) => {
  //   if (event.origin !== window.location.origin) return; // Or specific parent origin
  //   if (event.data && event.data.type === 'chatbot-request-close-from-parent') {
  //     closeChatbot(); // Or directly hide if logic allows
  //   }
  // });


  // Function to close the chatbot (by notifying the parent window)
  function closeChatbot() {
    // Inform the parent window to hide/remove the chatbot iframe
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'chatbot-close' }, window.location.origin);
    } else {
      // Fallback if not in an iframe (e.g., direct testing)
      console.warn("Chatbot close requested, but not in an iframe or parent communication failed. Hiding body.");
      document.body.style.display = 'none';
    }
  }

  // Event listener for the close button
  closeButton.addEventListener('click', closeChatbot);

  // Event listener for the ESC key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeChatbot();
    }
  });

  // Placeholder for parent window handling "click outside to close"
  // This needs to be implemented in the script that manages the chatbot iframe on the parent page.
  // Example message type to listen for from parent:
  // window.addEventListener('message', (event) => {
  //   if (event.origin !== window.location.origin) return; // Or specific parent origin
  //   if (event.data && event.data.type === 'chatbot-request-close-from-parent') {
  //     closeChatbot(); // Or directly hide if logic allows
  //   }
  // });


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
    addMessage(t('intro'), 'bot');
    addMessage(t('verifyBottom'), 'bot');
  }, 500);
});
