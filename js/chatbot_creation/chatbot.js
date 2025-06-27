// js/chatbot.js - Iframe Loader for the new chatbot system

document.addEventListener('DOMContentLoaded', () => {
  const chatbotPlaceholder = document.getElementById('chatbot-placeholder');
  const mobileChatLauncher = document.getElementById('mobileChatLauncher');
  const desktopChatFab = document.getElementById('chatbot-fab-trigger');

  const chatbotUrl = 'chatbot_creation/chatbot-widget.html'; // Path relative to project root
  let iframeLoaded = false;
  let chatbotIframe = null;
  let themeObserver = null;

  const desktopLangToggle = document.getElementById('language-toggle-desktop');
  const mobileLangToggle = document.getElementById('mobile-language-toggle');
  const languageChangeMessage = "Check the I'm Human Checkbox  - It is a pleasure to answer all your concerns and questions";

  const sendLangMessageToChatbot = () => {
    if (chatbotIframe && chatbotIframe.contentWindow) {
      chatbotIframe.contentWindow.postMessage(languageChangeMessage, '*');
    }
  };

  if (desktopLangToggle) {
    desktopLangToggle.addEventListener('click', sendLangMessageToChatbot);
  }
  if (mobileLangToggle) {
    mobileLangToggle.addEventListener('click', sendLangMessageToChatbot);
  }

  // Function to apply theme to iframe
  function applyThemeToIframe(theme) {
    if (chatbotIframe && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document && chatbotIframe.contentWindow.document.body) {
      chatbotIframe.contentWindow.document.body.setAttribute('data-theme', theme);
    }
  }

  // Function to set up theme synchronization
  function setupThemeSync() {
    if (!chatbotIframe) return;
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    chatbotIframe.onload = () => {
      applyThemeToIframe(currentTheme);

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
    };
    if (chatbotIframe.contentDocument && chatbotIframe.contentDocument.readyState === 'complete') {
      applyThemeToIframe(currentTheme);
      if (!themeObserver && chatbotIframe.contentWindow && chatbotIframe.contentWindow.document) {
