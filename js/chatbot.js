on-guard/js/chatbot.js

// js/chatbot.js - Iframe Loader for the new chatbot system

document.addEventListener('DOMContentLoaded', () => {
  const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
  const mobileChatLauncher = document.getElementById('mobileChatLauncher');
  const desktopChatFab = document.getElementById('chatbot-fab-trigger');

  const chatbotUrl = 'chatbot_creation/chatbot-widget.html'; // Path relative to project root
  let iframeLoaded = false;
  let chatbotIframe = null; // Store the iframe element
  let themeObserver = null; // Store the MutationObserver

  // Function to apply theme to iframe
  function applyThemeToIframe(theme) {
    if (chatbotIframe && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document && chatbotIframe.contentWindow.document.body) {
      chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
      console.log(`INFO:ChatbotLoader/applyThemeToIframe: Applied theme "${theme}" to chatbot iframe.`);
    } else {
      console.warn('WARN:ChatbotLoader/applyThemeToIframe: Chatbot iframe content not fully accessible yet.');
    }
  }

  // Function to set up theme synchronization
  function setupThemeSync() {
    if (!chatbotIframe) return;

    // Initial theme application
    const currentTheme = document.body.getAttribute('data-theme') || 'light';

    // Wait for iframe to load its content before trying to access its document
    chatbotIframe.onload = () => {
        console.log('INFO:ChatbotLoader/setupThemeSync: Chatbot iframe "onload" event triggered.');
        applyThemeToIframe(currentTheme);

        // Setup MutationObserver after iframe is loaded and theme initially applied
        if (themeObserver) themeObserver.disconnect(); // Disconnect previous observer if any

        themeObserver = new MutationObserver((mutationsList) => {
          for (const mutation of mutationsList) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
              const newTheme = document.body.getAttribute('data-theme') || 'light';
              applyThemeToIframe(newTheme);
            }
          }
        });

        themeObserver.observe(document.body, { attributes: true });
        console.log('INFO:ChatbotLoader/setupThemeSync: MutationObserver set up for theme changes on parent body.');
    };
    // If iframe is already loaded (e.g. from cache, or if onload fired before this was attached)
    // and contentDocument is accessible, try applying theme.
     if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
        console.log('INFO:ChatbotLoader/setupThemeSync: Chatbot iframe already loaded, applying theme.');
        applyThemeToIframe(currentTheme);
         // Also setup observer here if needed, though onload should ideally handle it.
        if (!themeObserver && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document) {
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
            console.log('INFO:ChatbotLoader/setupThemeSync: MutationObserver set up (iframe already loaded case).');
        }
    }
  }


  function loadAndShowChatbot() {
    if (!chatbotPlaceholder) {
      console.error('ERROR:ChatbotLoader/loadAndShowChatbot: chatbot-placeholder element not found.');
      return;
    }

    if (!chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn')) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'chatbot-placeholder-close-btn';
        closeButton.setAttribute('aria-label', 'Close Chat');
        closeButton.onclick = hideChatbot;
        chatbotPlaceholder.appendChild(closeButton);
    }

    if (!iframeLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = chatbotUrl;
      iframe.title = 'Live Chat Support';
      // Styling for iframe (width:100%, height:100%, border:none) should be in iframe-chat-wrapper.css

      const currentCloseBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
      chatbotPlaceholder.innerHTML = '';
      if(currentCloseBtn) chatbotPlaceholder.appendChild(currentCloseBtn);

      chatbotPlaceholder.appendChild(iframe);
      chatbotIframe = iframe; // Store the iframe
      iframeLoaded = true;
      console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot iframe created and appended.');
      setupThemeSync(); // Setup theme synchronization
    } else if (chatbotIframe) {
        // If iframe was loaded but maybe hidden and re-shown, ensure theme is current
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        applyThemeToIframe(currentTheme);
        // Re-ensure observer is active if it was disconnected
        if (!themeObserver || (themeObserver && themeObserver.takeRecords && themeObserver.takeRecords().length === 0 && !document.body.getAttribute('data-theme-observed-by-chatbot'))) {
             console.log('INFO:ChatbotLoader/loadAndShowChatbot: Re-initializing theme sync for existing iframe.');
             setupThemeSync(); // This will re-establish observer if needed
             document.body.setAttribute('data-theme-observed-by-chatbot', 'true'); // Mark that observer is setup
        }
    }


    chatbotPlaceholder.classList.add('active');
    console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot placeholder displayed.');
    const closeBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
    if(closeBtn) closeBtn.focus();
    else if (chatbotIframe) chatbotIframe.focus();
  }

  function hideChatbot() {
    if (chatbotPlaceholder) {
      chatbotPlaceholder.classList.remove('active');
      console.log('INFO:ChatbotLoader/hideChatbot: Chatbot placeholder hidden.');
      // Consider disconnecting observer when hidden if performance is an issue,
      // but for theme changes it's likely low overhead.
      // if (themeObserver) {
      //   themeObserver.disconnect();
      //   themeObserver = null;
      //   document.body.removeAttribute('data-theme-observed-by-chatbot');
      //   console.log('INFO:ChatbotLoader/hideChatbot: Theme observer disconnected.');
      // }
    }
  }

  function toggleChatbot(event) {
    if(event) event.preventDefault();
    if (!chatbotPlaceholder) return;

    if (chatbotPlaceholder.classList.contains('active')) {
      hideChatbot();
    } else {
      loadAndShowChatbot();
    }
  }

  if (mobileChatLauncher) {
    mobileChatLauncher.addEventListener('click', toggleChatbot);
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Mobile chat launcher (mobileChatLauncher) not found.');
  }

  if (desktopChatFab) {
    desktopChatFab.addEventListener('click', toggleChatbot);
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Desktop chat FAB (chatbot-fab-trigger) not found.');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
        hideChatbot();
        console.log('EVENT:ChatbotLoader/document#keydown[Escape] - Chatbot placeholder closed via ESC.');
        if(document.activeElement === chatbotPlaceholder || chatbotPlaceholder.contains(document.activeElement)){
            if(desktopChatFab) desktopChatFab.focus();
        }
    }
  });

  console.log('INFO:ChatbotLoader/DOMContentLoaded: Chatbot loader initialized.');
});
