const qs = (s, c = document) => c.querySelector(s);

const log = qs('#chat-log'),
      input = qs('#chatbot-input'),
      form  = qs('#chatbot-input-row'),
      send  = qs('#chatbot-send'),
      human = qs('#human-check');

human.onchange = () => {
  send.disabled = !human.checked;
};

function addMsg(text, cls) {
  const div = document.createElement('div');
  div.className = `chat-msg ${cls}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}

form.onsubmit = async e => {
  e.preventDefault();
  if (!human.checked) return;

  const msg = input.value.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  input.value = '';
  send.disabled = true;

  addMsg('…', 'bot');

  try {
    const r = await fetch('https://your-cloudflare-worker.example.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const d = await r.json();
    log.lastChild.textContent = d.reply || 'No reply.';
  } catch {
    log.lastChild.textContent = "Error: Can't reach AI.";
  }
  send.disabled = false;
};
