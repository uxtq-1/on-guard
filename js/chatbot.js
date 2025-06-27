// js/chatbot_creation/chatbot.js
// This script runs *inside* the chatbot-widget.html iframe

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const log = document.getElementById('chat-log');
  const sendButton = document.getElementById('chat-send-button');
  const honeypotInput = form ? form.querySelector('[name="chatbot-honeypot"]') : null;
  const humanCheckbox = document.getElementById('human-verification-checkbox');

  if (!form || !input || !log || !sendButton) {
    console.error('ERROR:ChatbotWidget/DOMContentLoaded: Core chatbot UI elements (#chat-form, #chat-input, #chat-log, #chat-send-button) not found in iframe.');
    return;
  }
  if (!honeypotInput) {
    console.warn('WARN:ChatbotWidget/DOMContentLoaded: Honeypot field not found.');
  }
  if (!humanCheckbox) {
    console.warn('WARN:ChatbotWidget/DOMContentLoaded: Human verification checkbox not found.');
  }

  // Function to toggle chat input and send button state
  const setChatControlsDisabled = (disabled) => {
    input.disabled = disabled;
    sendButton.disabled = disabled;
    input.placeholder = disabled ? "Please check 'I am human' to chat." : "Ask me anything...";
  };

  // Initial state: disable chat controls, ensure checkbox is unticked
  if (humanCheckbox) {
    humanCheckbox.checked = false;
    setChatControlsDisabled(true);
  } else {
    setChatControlsDisabled(true);
    console.error('ERROR:ChatbotWidget/DOMContentLoaded: Human verification checkbox is missing, chat controls disabled.');
  }

  // Event listener for the human verification checkbox
  if (humanCheckbox) {
    humanCheckbox.addEventListener('change', () => {
      setChatControlsDisabled(!humanCheckbox.checked);
      if (humanCheckbox.checked) input.focus();
    });
  }

  // Function to enable/disable form elements based on checkbox state
  const updateFormState = () => {
    if (humanCheckbox) {
      const isHuman = humanCheckbox.checked;
      input.disabled = !isHuman;
      sendButton.disabled = !isHuman;
      input.placeholder = isHuman ? "Ask me anything..." : "Please check 'I am human' to type.";
    } else {
      input.disabled = false;
      sendButton.disabled = false;
    }
  };

  if (humanCheckbox) {
    humanCheckbox.addEventListener('change', updateFormState);
  }

  updateFormState();

  const addMessage = (text, sender = 'user', isHTML = false) => {
    const msg = document.createElement('div');
    msg.classList.add('message', sender === 'bot' ? 'bot-message' : 'user-message');
    if (isHTML) {
      msg.innerHTML = text;
    } else {
      msg.textContent = text;
    }
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
  };

  // Simulate bot responding (replace with actual bot logic / API call)
  const getSimulatedBotReply = async (userInput) => {
    const lowerInput = userInput.toLowerCase();
    let botResponse = "Thanks for your message! A support agent will be with you shortly.";
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      botResponse = "Hello there! How can I assist you today?";
    } else if (lowerInput.includes('help')) {
      botResponse = "I can help with general questions. For specific account issues, an agent will assist you. What do you need help with?";
    } else if (lowerInput.includes('price') || lowerInput.includes('pricing')) {
      botResponse = "You can find our pricing d
