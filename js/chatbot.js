// js/chatbot.js - Iframe Loader for the new chatbot system

document.addEventListener('DOMContentLoaded', () => {
  const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
  const mobileChatLauncher = document.getElementById('mobileChatLauncher');
  const desktopChatFab = document.getElementById('chatbot-fab-trigger');

  const chatbotUrl = 'chatbot_creation/chatbot-widget.html'; // Path relative to project root
  let iframeLoaded = false;
  // chatbotVisible state is now managed by the presence of 'active' class on chatbotPlaceholder

  function loadAndShowChatbot() {
    if (!chatbotPlaceholder) {
      console.error('ERROR:ChatbotLoader/loadAndShowChatbot: chatbot-placeholder element not found.');
      return;
    }

    // Ensure placeholder has a close button if not already present from HTML structure
    // This is a fallback; ideally, the close mechanism is part of the placeholder's initial HTML or styled wrapper
    if (!chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn')) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.className = 'chatbot-placeholder-close-btn'; // For styling via iframe-chat-wrapper.css
        closeButton.setAttribute('aria-label', 'Close Chat');
        // Styling for this button should be in iframe-chat-wrapper.css
        // Example minimal styles if CSS doesn't cover it:
        // closeButton.style.position = 'absolute'; closeButton.style.top = '10px'; closeButton.style.right = '10px';
        // closeButton.style.zIndex = '10'; closeButton.style.background='transparent'; closeButton.style.border='none';
        // closeButton.style.fontSize='1.5rem'; closeButton.style.color='var(--text-current)'; closeButton.style.cursor='pointer';
        closeButton.onclick = hideChatbot;
        chatbotPlaceholder.appendChild(closeButton);
    }

    if (!iframeLoaded) {
      const iframe = document.createElement('iframe');
      iframe.src = chatbotUrl;
      iframe.title = 'Live Chat Support';
      // Styling for iframe (width:100%, height:100%, border:none) should be in iframe-chat-wrapper.css
      // targeting #chatbot-placeholder.active iframe

      // Clear previous content (like a 'Loading...' message or old iframe)
      // Keep close button if it was added dynamically
      const currentCloseBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
      chatbotPlaceholder.innerHTML = ''; // Clear
      if(currentCloseBtn) chatbotPlaceholder.appendChild(currentCloseBtn); // Re-add close button

      chatbotPlaceholder.appendChild(iframe);
      iframeLoaded = true;
      console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot iframe loaded into placeholder.');
    }

    chatbotPlaceholder.classList.add('active'); // Show the placeholder (styled by CSS)
    console.log('INFO:ChatbotLoader/loadAndShowChatbot: Chatbot placeholder displayed.');
    // Focus management: focus the iframe or a close button after opening
    const closeBtn = chatbotPlaceholder.querySelector('.chatbot-placeholder-close-btn');
    if(closeBtn) closeBtn.focus();
    else if (chatbotPlaceholder.querySelector('iframe')) chatbotPlaceholder.querySelector('iframe').focus();

  }

  function hideChatbot() {
    if (chatbotPlaceholder) {
      chatbotPlaceholder.classList.remove('active'); // Hide the placeholder
      console.log('INFO:ChatbotLoader/hideChatbot: Chatbot placeholder hidden.');
      // Optional: To save resources, you could also remove the iframe content when hidden for a long time
      // This means it reloads fully next time.
      // setTimeout(() => {
      //   if (!chatbotPlaceholder.classList.contains('active')) { // Check if still hidden
      //     const iframe = chatbotPlaceholder.querySelector('iframe');
      //     if (iframe) chatbotPlaceholder.removeChild(iframe);
      //     iframeLoaded = false;
      //     console.log('INFO:ChatbotLoader/hideChatbot: Chatbot iframe removed after timeout.');
      //   }
      // }, 60000); // e.g., remove after 1 minute of being hidden
    }
  }

  function toggleChatbot(event) {
    if(event) event.preventDefault(); // Prevent default action if it's from an anchor click
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

  // ESC key to close the chatbot placeholder if it's visible
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatbotPlaceholder && chatbotPlaceholder.classList.contains('active')) {
        hideChatbot();
        console.log('EVENT:ChatbotLoader/document#keydown[Escape] - Chatbot placeholder closed via ESC.');
        // Return focus to the trigger if possible
        if(document.activeElement === chatbotPlaceholder || chatbotPlaceholder.contains(document.activeElement)){
            if(desktopChatFab) desktopChatFab.focus(); // Or whichever trigger was last used
        }
    }
  });

  console.log('INFO:ChatbotLoader/DOMContentLoaded: Chatbot loader initialized.');
});
