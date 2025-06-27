// js/chatbot.js - Iframe Loader for the new chatbot modal system

let chatbotIframe = null; // Stores the iframe element globally
let themeObserver = null; // Stores the MutationObserver
let iframeLoaded = false; // Tracks if iframe has been loaded into the modal
const chatbotUrl = '../html/chatbot_creation/chatbot-widget.html'; // Update this if path changes

// ---- Function to apply theme to the iframe's body ----
function applyThemeToIframe(theme) {
  try {
    if (
      chatbotIframe &&
      chatbotIframe.contentWindow &&
      chatbotIframe.contentWindow.document &&
      chatbotIframe.contentWindow.document.body
    ) {
      chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
      // Optionally: chatbotIframe.contentWindow.postMessage({ theme }, '*');
      console.log(`INFO:ChatbotModal/applyThemeToIframe: Applied theme "${theme}" to chatbot iframe.`);
    } else {
      // Iframe may not have loaded its content yet
      // Theme will be set on iframe onload
      console.warn('WARN:ChatbotModal/applyThemeToIframe: Iframe not accessible yet. Will retry on load.');
    }
  } catch (err) {
    console.warn('WARN:ChatbotModal/applyThemeToIframe: Caught exception when setting theme:', err);
  }
}

// ---- Function to set up theme synchronization (MutationObserver) ----
function setupThemeSync() {
  if (!chatbotIframe) {
    console.error("ERROR:ChatbotModal/setupThemeSync: Iframe not present.");
    return;
  }
  // Remove any old observer before creating a new one
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
  // Handler for updating iframe theme when parent changes
  const handleThemeChange = () => {
    const theme = document.body.getAttribute('data-theme') || 'light';
    applyThemeToIframe(theme);
  };
  // Apply once immediately
  handleThemeChange();

  // Setup observer for future theme changes
  themeObserver = new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
        handleThemeChange();
      }
    }
  });
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['data-theme'] });
  // Mark that observation is active
  document.body.setAttribute('data-theme-observed-by-chatbot', 'true');
  console.log('INFO:ChatbotModal/setupThemeSync: Theme MutationObserver set up.');
}

// ---- Main initializer called by main.js when opening chatbot modal ----
function initializeChatbotModal(modalElement) {
  if (!modalElement) {
    console.error("ERROR:ChatbotModal/initializeChatbotModal: Modal element not provided.");
    return;
  }
  const chatbotModalBody = modalElement.querySelector('#chatbot-modal-body');
  if (!chatbotModalBody) {
    console.error("ERROR:ChatbotModal/initializeChatbotModal: #chatbot-modal-body not found in modal.");
    return;
  }

  // If iframe not loaded, create it and inject
  if (!iframeLoaded) {
    chatbotIframe = document.createElement('iframe');
    chatbotIframe.src = chatbotUrl;
    chatbotIframe.title = 'AI Chatbot';
    chatbotIframe.setAttribute('tabindex', '0');
    chatbotIframe.setAttribute('aria-label', 'AI Chatbot Widget');
    // CSS handles width/height/border
    chatbotModalBody.innerHTML = ''; // Remove loader text or stale content
    chatbotModalBody.appendChild(chatbotIframe);

    iframeLoaded = true;

    chatbotIframe.onload = () => {
      // Wait for iframe to fully load before setting theme and observer
      setupThemeSync();
    };
    // Defensive: In case iframe loads too quickly for onload (rare)
    if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
      setupThemeSync();
    }

    console.log('INFO:ChatbotModal/initializeChatbotModal: Chatbot iframe created and appended.');
  } else {
    // If iframe exists, ensure it is in the DOM and re-sync theme
    if (!chatbotModalBody.contains(chatbotIframe)) {
      chatbotModalBody.innerHTML = '';
      chatbotModalBody.appendChild(chatbotIframe);
    }
    setupThemeSync();
  }

  // Update language on modal content if supported
  if (typeof window.updateDynamicContentLanguage === 'function') {
    window.updateDynamicContentLanguage(modalElement);
  }
  console.log('INFO:ChatbotModal/initializeChatbotModal: Modal initialized.');
}

// ---- Export (global for main.js to call) ----
window.initializeChatbotModal = initializeChatbotModal;

// ---- Cleanup on page unload (optional, best practice) ----
window.addEventListener('unload', () => {
  if (themeObserver) {
    themeObserver.disconnect();
    themeObserver = null;
  }
  chatbotIframe = null;
  iframeLoaded = false;
});

