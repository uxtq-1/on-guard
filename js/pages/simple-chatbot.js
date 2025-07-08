const qs = (s, c = document) => c.querySelector(s);

const log = qs('#chat-log'),
      input = qs('#chatbot-input'),
      form  = qs('#chatbot-input-row'),
      send  = qs('#chatbot-send'),
      human = qs('#human-check'),
      themeBtn = qs('#themeCtrl'),
      langBtn  = qs('#langCtrl'),
      closeBtn = qs('#closeCtrl');

let LANG = document.documentElement.lang || 'en';

function save() {
  localStorage.setItem('opsChatLog', log.innerHTML);
}

function load() {
  const hist = localStorage.getItem('opsChatLog');
  if (hist) log.innerHTML = hist;
}

function addMsg(text, cls) {
  const div = document.createElement('div');
  div.className = `chat-msg ${cls}`;
  div.textContent = text;
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
  save();
  return div;
}

function typing(on) {
  if (on) {
    addMsg(LANG === 'en' ? 'OPS AI is typing…' : 'OPS AI escribiendo…', 'bot typing');
  } else {
    const t = log.querySelector('.typing');
    if (t) t.remove();
  }
}

async function ask(msg) {
  typing(true);
  try {
    const r = await fetch('https://your-cloudflare-worker.example.com/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, lang: LANG })
    });
    if (!r.ok) throw new Error(r.status);
    const d = await r.json();
    addMsg(d.reply || 'No reply.', 'bot');
  } catch (e) {
    addMsg((LANG === 'en' ? 'Error: ' : 'Error: ') + e.message, 'bot');
  }
  typing(false);
}

form.onsubmit = e => {
  e.preventDefault();
  if (!human.checked) return;
  const msg = input.value.trim();
  if (!msg) return;
  addMsg(msg, 'user');
  input.value = '';
  send.disabled = true;
  ask(msg).finally(() => { send.disabled = false; });
};

human.addEventListener('change', () => {
  send.disabled = !human.checked;
});

themeBtn?.addEventListener('click', () => {
  const html = document.documentElement;
  const dark = html.dataset.theme === 'dark';
  html.dataset.theme = dark ? 'light' : 'dark';
  parent.postMessage({ type: 'theme-change', theme: html.dataset.theme }, '*');
});

langBtn?.addEventListener('click', () => {
  LANG = LANG === 'en' ? 'es' : 'en';
  document.documentElement.lang = LANG;
  langBtn.textContent = LANG === 'en' ? 'ES' : 'EN';
  input.placeholder = input.dataset[LANG + 'Ph'] || input.placeholder;
  parent.postMessage({ type: 'language-change', lang: LANG }, '*');
});

closeBtn?.addEventListener('click', () => {
  parent.postMessage({ type: 'chatbot-close' }, '*');
});

window.addEventListener('message', ev => {
  const d = ev.data || {};
  if (d.type === 'theme-change') {
    document.documentElement.dataset.theme = d.theme;
  } else if (d.type === 'language-change') {
    LANG = d.lang || 'en';
    document.documentElement.lang = LANG;
    langBtn.textContent = LANG === 'en' ? 'ES' : 'EN';
    input.placeholder = input.dataset[LANG + 'Ph'] || input.placeholder;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  load();
  send.disabled = !human.checked;
});
