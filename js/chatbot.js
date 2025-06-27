// js/chatbot.js - Iframe Loader for the new chatbot modal system

let chatbotIframe = null; // Store the iframe element
let themeObserver = null; // Store the MutationObserver
let iframeLoaded = false; // Flag to track if iframe has been loaded into the modal
const chatbotUrl = 'chatbot_creation/chatbot-widget.html'; // Path relative to project root

// Function to apply theme to iframe
function applyThemeToIframe(theme) {
  if (chatbotIframe && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document && chatbotIframe.contentWindow.document.body) {
    chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
    console.log(`INFO:ChatbotModal/applyThemeToIframe: Applied theme "${theme}" to chatbot iframe.`);
  } else {
    // This can happen if the iframe content hasn't loaded yet.
    // setupThemeSync's onload handler should cover this.
    console.warn('WARN:ChatbotModal/applyThemeToIframe: Chatbot iframe content not fully accessible yet.');
  }
}

// Function to set up theme synchronization
function setupThemeSync() {
  if (!chatbotIframe) {
    console.error("ERROR:ChatbotModal/setupThemeSync: Chatbot iframe element not available.");
    return;
  }

  const currentTheme = document.body.getAttribute('data-theme') || 'light';

  const handleIframeLoad = () => {
    console.log('INFO:ChatbotModal/setupThemeSync: Chatbot iframe "onload" event triggered.');
    applyThemeToIframe(currentTheme); // Apply theme once iframe content is loaded

    // Setup MutationObserver after iframe is loaded and theme initially applied
    if (themeObserver) themeObserver.disconnect();

    themeObserver = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.body.getAttribute('data-theme') || 'light';
          applyThemeToIframe(newTheme);
        }
      }
    });
    themeObserver.observe(document.body, { attributes: true });
    console.log('INFO:ChatbotModal/setupThemeSync: MutationObserver set up for theme changes on parent body.');
  };

  // Check if iframe is already loaded (e.g. src already set and content is there)
  if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
    handleIframeLoad();
  } else {
    chatbotIframe.onload = handleIframeLoad;
  }
}

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

  if (!iframeLoaded) {
    const iframe = document.createElement('iframe');
    iframe.src = chatbotUrl;
    iframe.title = 'AI Chatbot'; // Updated title
    // CSS will handle width, height, border (from chatbot_modal.css)

    chatbotModalBody.innerHTML = ''; // Clear "Loading..." text
    chatbotModalBody.appendChild(iframe);
    chatbotIframe = iframe; // Store the iframe globally within this script
    iframeLoaded = true;
    console.log('INFO:ChatbotModal/initializeChatbotModal: Chatbot iframe created and appended to modal body.');
    setupThemeSync(); // Setup theme synchronization for the new iframe
  } else if (chatbotIframe) {
    // If iframe already exists (e.g. modal was hidden and re-shown), ensure it's in the modal body
    // and theme is current. This might be redundant if modal content isn't cleared on hide.
    if (!chatbotModalBody.contains(chatbotIframe)) {
        chatbotModalBody.innerHTML = ''; // Clear "Loading..." text or old content
        chatbotModalBody.appendChild(chatbotIframe);
    }
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    applyThemeToIframe(currentTheme);
    // Ensure observer is active
    if (!themeObserver || (themeObserver && !document.body.hasAttribute('data-theme-observed-by-chatbot'))) {
        console.log('INFO:ChatbotModal/initializeChatbotModal: Re-initializing theme sync for existing iframe.');
        setupThemeSync();
        document.body.setAttribute('data-theme-observed-by-chatbot', 'true');
    }
  }

  // Language update for the modal content (e.g. header, footer buttons)
  if (window.updateDynamicContentLanguage) {
    window.updateDynamicContentLanguage(modalElement);
  }

  console.log('INFO:ChatbotModal/initializeChatbotModal: AI Chatbot modal initialized.');
}


// Note: The old DOMContentLoaded, mobileChatLauncher, and desktopChatFab event listeners
// are removed. The modal opening is now handled by js/main.js, which will call
// initializeChatbotModal when the chatbot modal is triggered and its HTML is loaded.
// The ESC key handling for closing the modal is also handled by js/main.js globally.
// The old chatbotPlaceholder logic is no longer needed as the iframe is now inside the modal.
