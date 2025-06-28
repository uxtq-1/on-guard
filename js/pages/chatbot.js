// js/chatbot.js - Iframe Loader for the new chatbot modal system
// Loader for chatbot modal: Cloudflare Worker POST & honeypot check

let chatbotIframe = null;
let themeObserver = null;
let iframeLoaded = false;
const chatbotUrl = '../html/chatbot_creation/chatbot-widget.html';

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

// Main loader function
function initializeChatbotModal(modalElement) {
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
    chatbotModalBody.innerHTML = '';
    chatbotModalBody.appendChild(chatbotIframe);
    iframeLoaded = true;
    chatbotIframe.onload = () => { setupThemeSync(); };
    if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
      setupThemeSync();
    }
    console.log('Chatbot iframe created and appended.');
  } else {
    if (!chatbotModalBody.contains(chatbotIframe)) {
      chatbotModalBody.innerHTML = '';
      chatbotModalBody.appendChild(chatbotIframe);
    }
    setupThemeSync();
  }
  if (typeof window.updateDynamicContentLanguage === 'function') {
    window.updateDynamicContentLanguage(modalElement);
  }
  console.log('Modal initialized.');
}

// Theme sync logic omitted for brevity — keep your previous implementation here.

window.initializeChatbotModal = initializeChatbotModal;

window.addEventListener('unload', () => {
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
  chatbotIframe = null;
  iframeLoaded = false;
});
