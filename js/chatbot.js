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
  let lastChatbotTrigger = null; // To store the element that opened the chatbot

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


  function loadAndShowChatbot(triggerElement) {
    if (!chatbotPlaceholder) {
      console.error('ERROR:ChatbotLoader/loadAndShowChatbot: chatbot-placeholder element not found.');
      return;
    }

    if (triggerElement) {
        lastChatbotTrigger = triggerElement; // Store the element that triggered the chatbot
    }

    // Add click outside listener if not already added
    if (!chatbotPlaceholder.classList.contains('click-outside-listener-added')) {
        chatbotPlaceholder.addEventListener('click', (e) => {
            // If click is on the placeholder itself (the overlay) and it's active
            if (e.target === chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
                hideChatbot();
                if (lastChatbotTrigger) { // Return focus to the original trigger
                    lastChatbotTrigger.focus();
                    lastChatbotTrigger = null; // Clear it after use
                } else if (desktopChatFab) { // Fallback
                    desktopChatFab.focus();
                }
            }
        });
        chatbotPlaceholder.classList.add('click-outside-listener-added');
    }

    if (!chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn')) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'chatbot-placeholder-close-btn';
        closeButton.setAttribute('aria-label', 'Close Chat');
        closeButton.onclick = () => { // Modified to also handle focus like other close methods
            hideChatbot();
            if (lastChatbotTrigger) {
                lastChatbotTrigger.focus();
                lastChatbotTrigger = null;
            } else if (desktopChatFab) {
                 desktopChatFab.focus();
            }
        };
        chatbotPlaceholder.appendChild(closeButton);
    }

    if (!iframeLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = chatbotUrl;
      iframe.title = 'Live Chat Support';
      // Styling for iframe (width:100%, height:100%, border:none) should be in iframe-chat-wrapper.css

      const currentCloseBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
      chatbotPlaceholder.innerHTML = ''; // Clear placeholder before adding iframe and button back
      if(currentCloseBtn) chatbotPlaceholder.appendChild(currentCloseBtn); // Re-append close button first

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
    // Focus management: focus the close button, or the iframe content after it loads.
    const closeBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
    if(closeBtn) {
        closeBtn.focus();
    } else if (chatbotIframe && chatbotIframe.contentWindow) {
        // Focusing iframe directly can be tricky; better to focus a specific element inside if possible,
        // or allow user to tab into it. For now, focusing placeholder or close button is safer.
        // chatbotIframe.focus(); // This might not be effective for iframe content accessibility.
    }
  }

  function hideChatbot() {
    if (chatbotPlaceholder) {
      chatbotPlaceholder.classList.remove('active');
      console.log('INFO:ChatbotLoader/hideChatbot: Chatbot placeholder hidden.');
      // Focus return is handled by the respective close event (ESC, X button, click outside, toggle)
    }
  }

  function toggleChatbot(event) {
    if(event) event.preventDefault();
    if (!chatbotPlaceholder) return;

    const trigger = event ? event.currentTarget : null;

    if (chatbotPlaceholder.classList.contains('active')) {
      hideChatbot();
      if (trigger) trigger.focus(); // If closing via toggle, focus back on trigger
      lastChatbotTrigger = null; // Clear trigger since it's closed
    } else {
      loadAndShowChatbot(trigger); // Pass the trigger
    }
  }

  if (mobileChatLauncher) {
    mobileChatLauncher.addEventListener('click', toggleChatbot); // Pass event implicitly
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Mobile chat launcher (mobileChatLauncher) not found.');
  }

  if (desktopChatFab) {
    desktopChatFab.addEventListener('click', toggleChatbot); // Pass event implicitly
  } else {
    console.warn('WARN:ChatbotLoader/DOMContentLoaded: Desktop chat FAB (chatbot-fab-trigger) not found.');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
        hideChatbot();
        console.log('EVENT:ChatbotLoader/document#keydown[Escape] - Chatbot placeholder closed via ESC.');
        if (lastChatbotTrigger) { // Return focus to the original trigger
            lastChatbotTrigger.focus();
            lastChatbotTrigger = null; // Clear it after use
        } else if (desktopChatFab) { // Fallback if no specific trigger was stored
            desktopChatFab.focus();
        }
    }
  });

  console.log('INFO:ChatbotLoader/DOMContentLoaded: Chatbot loader initialized.');
});
