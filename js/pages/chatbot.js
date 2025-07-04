// js/chatbot.js - Iframe Loader for the new chatbot modal system
// Loader for chatbot modal: Cloudflare Worker POST & honeypot check

import { ROOT_PATH } from '../utils/rootPath.js';

let chatbotIframe = null;
let themeObserver = null;
let langObserver = null;

let iframeLoaded = false;
const chatbotUrl = `${ROOT_PATH}html/chatbot_creation/chatbot-widget.html`;
const chatbotOrigin = new URL(chatbotUrl, window.location.href).origin;

function postThemeToIframe(theme) {
  if (chatbotIframe && chatbotIframe.contentWindow) {
    chatbotIframe.contentWindow.postMessage({ type: 'theme-change', theme }, chatbotOrigin);
  }
}

function postLanguageToIframe(lang) {
  if (chatbotIframe && chatbotIframe.contentWindow) {
    chatbotIframe.contentWindow.postMessage({ type: 'language-change', lang }, chatbotOrigin);
  }
}

function setupThemeSync() {
  if (!chatbotIframe) return;
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  postThemeToIframe(currentTheme);
  if (themeObserver) return;
  themeObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'data-theme') {
        const newTheme = m.target.getAttribute('data-theme');
        postThemeToIframe(newTheme);
      }
    }
  });
  themeObserver.observe(document.body, { attributes: true });
}

function setupLanguageSync() {
  if (!chatbotIframe) return;
  const currentLang = document.documentElement.getAttribute('lang') || 'en';
  postLanguageToIframe(currentLang);
  if (langObserver) return;
  langObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.attributeName === 'lang') {
        const newLang = m.target.getAttribute('lang') || 'en';
        postLanguageToIframe(newLang);
      }
    }
  });
  langObserver.observe(document.documentElement, { attributes: true });
}

// Hidden honeypot field for outer loader (not visible in modal)
function createLoaderHoneypot() {
  let honeypot = document.getElementById('chatbot-loader-honeypot');
  if (!honeypot) {
    honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'chatbot-loader-honeypot';
    honeypot.id = 'chatbot-loader-honeypot';
    honeypot.style.display = 'none';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    honeypot.setAttribute('aria-hidden', 'true');
    document.body.appendChild(honeypot);
  }
  return honeypot;
}

// Cloudflare Worker: Notify/block if honeypot is filled
async function alertWorkerLoaderBotActivity(detail = "loader honeypot") {
  try {
    await fetch('https://YOUR_CLOUDFLARE_WORKER_URL/loader-bot-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

// Main loader function - EXPORT this
export function initializeChatbotModal(modalElement) {
  const honeypot = createLoaderHoneypot();

  // Check honeypot before loading chatbot
  if (honeypot.value && honeypot.value !== '') {
    alertWorkerLoaderBotActivity("loader honeypot filled (init)");
    alert("Suspicious activity detected. Chatbot access denied.");
    return;
  }

  // Setup honeypot detection (alert if filled later)
  honeypot.addEventListener('input', () => {
    if (honeypot.value !== '') {
      alertWorkerLoaderBotActivity("loader honeypot filled (input)");
      alert("Suspicious activity detected. Chatbot access denied.");
    }
  });

  if (!modalElement) {
    console.error("ERROR: Modal element not provided.");
    return;
  }
  const chatbotModalBody = modalElement.querySelector('#chatbot-modal-body');
  if (!chatbotModalBody) {
    console.error("ERROR: #chatbot-modal-body not found in modal.");
    return;
  }

  if (!iframeLoaded) {
    chatbotIframe = document.createElement('iframe');
    chatbotIframe.src = chatbotUrl;
    chatbotIframe.title = 'AI Chatbot';
    chatbotIframe.setAttribute('tabindex', '0');
    chatbotIframe.setAttribute('aria-label', 'AI Chatbot Widget');
    chatbotIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    chatbotModalBody.innerHTML = '';
    chatbotModalBody.appendChild(chatbotIframe);
    iframeLoaded = true;
    chatbotIframe.onload = () => { setupThemeSync(); setupLanguageSync(); };
    if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
      setupThemeSync();
      setupLanguageSync();
    }
  } else {
    if (!chatbotModalBody.contains(chatbotIframe)) {
      chatbotModalBody.innerHTML = '';
      chatbotModalBody.appendChild(chatbotIframe);
    }
    setupThemeSync();
    setupLanguageSync();
  }
  if (typeof window.updateDynamicContentLanguage === 'function') {
    window.updateDynamicContentLanguage(modalElement);
  }
}

// window.initializeChatbotModal = initializeChatbotModal; // Removed: now exported

window.addEventListener('pagehide', (event) => {
  // event.persisted is true if the page is going into the back/forward cache
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
  if (langObserver) {
    langObserver.disconnect();
    langObserver = null;
  }
  // Resetting iframe status is good practice if page might be bf-cached.
  chatbotIframe = null;
  iframeLoaded = false;
});
