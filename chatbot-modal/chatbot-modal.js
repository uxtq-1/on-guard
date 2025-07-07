// chatbot-modal/chatbot-modal.js — Chatbot modal loader with hardened iframe security

import { ROOT_PATH } from '../js/core/root-path-handler.js';
import { closeModal as closeModalUtility } from '../js/core/modal-handler.js';

let chatbotIframe = null;
let themeObserver = null;
let langObserver = null;
let iframeLoaded = false;

const chatbotUrl = `${ROOT_PATH}chatbot-modal/chatbot-landingpage.html`;
const chatbotOrigin = new URL(chatbotUrl, window.location.href).origin;

// Send theme to iframe
function postThemeToIframe(theme) {
  if (chatbotIframe?.contentWindow) {
    chatbotIframe.contentWindow.postMessage({ type: 'theme-change', theme }, chatbotOrigin);
  }
}

// Send language to iframe
function postLanguageToIframe(lang) {
  if (chatbotIframe?.contentWindow) {
    chatbotIframe.contentWindow.postMessage({ type: 'language-change', lang }, chatbotOrigin);
  }
}

// Allow other modules to push language changes directly
export function notifyChatbotLanguageChange(lang) {
  postLanguageToIframe(lang);
}

// Sync theme with iframe
function setupThemeSync() {
  if (!chatbotIframe) return;
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  postThemeToIframe(currentTheme);

  if (!themeObserver) {
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
}

// Sync language with iframe
function setupLanguageSync() {
  if (!chatbotIframe) return;
  const currentLang = document.documentElement.getAttribute('lang') || 'en';
  postLanguageToIframe(currentLang);

  if (!langObserver) {
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
}

// Create honeypot field to trap bots
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

// Alert Cloudflare Worker of suspicious bot
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
    console.warn("Bot alert failed:", err);
  }
}

// Main initializer
export function initializeChatbotModal(modalElement) {
  const honeypot = createLoaderHoneypot();

  if (honeypot.value?.trim() !== '') {
    alertWorkerLoaderBotActivity("loader honeypot filled (init)");
    alert("Suspicious activity detected. Chatbot access denied.");
    return;
  }

  honeypot.addEventListener('input', () => {
    if (honeypot.value.trim() !== '') {
      alertWorkerLoaderBotActivity("loader honeypot filled (input)");
      alert("Suspicious activity detected. Chatbot access denied.");
    }
  });

  if (!modalElement) return console.error("ERROR: Chatbot modal element not provided.");

  const chatbotModalBody = modalElement.querySelector('#chatbot-modal-body');
  if (!chatbotModalBody) return console.error("ERROR: #chatbot-modal-body not found.");

  if (!iframeLoaded) {
    chatbotIframe = document.createElement('iframe');
    chatbotIframe.src = chatbotUrl;
    chatbotIframe.title = 'AI Chatbot';
    chatbotIframe.setAttribute('tabindex', '0');
    chatbotIframe.setAttribute('aria-label', 'AI Chatbot Widget');
    chatbotIframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
    chatbotIframe.setAttribute('referrerpolicy', 'no-referrer');
    chatbotModalBody.replaceChildren(chatbotIframe);
    iframeLoaded = true;

    chatbotIframe.onload = () => {
      setupThemeSync();
      setupLanguageSync();
    };
  } else {
    if (!chatbotModalBody.contains(chatbotIframe)) {
      chatbotModalBody.replaceChildren(chatbotIframe);
    }
    setupThemeSync();
    setupLanguageSync();
  }

  if (typeof window.updateDynamicContentLanguage === 'function') {
    window.updateDynamicContentLanguage(modalElement);
  }
}

// Listen for close messages from the iframe
window.addEventListener('message', (event) => {
  // Ensure message is from our chatbot iframe and has the correct origin
  if (event.source !== chatbotIframe?.contentWindow || (event.origin !== chatbotOrigin && event.origin !== window.location.origin)) {
    // Allow same origin for local file testing where chatbotOrigin might be "null" but window.location.origin is also "null"
    if (!(event.origin === "null" && window.location.origin === "null" && event.source === chatbotIframe?.contentWindow)) {
        return;
    }
  }

  const data = event.data || {};
  if (data.type === 'chatbot-close') {
    const chatbotModalElement = document.getElementById('chatbot-modal'); // Get the modal shell
    if (chatbotModalElement && chatbotModalElement.classList.contains('active')) {
      const triggerButton = document.getElementById('chatbot-fab-trigger'); // Assuming this is the main trigger
      closeModalUtility(chatbotModalElement, triggerButton);
    }
  }
});

// Cleanup on navigation
window.addEventListener('pagehide', () => {
  themeObserver?.disconnect();
  langObserver?.disconnect();
  themeObserver = null;
  langObserver = null;
  chatbotIframe = null;
  iframeLoaded = false;
});
