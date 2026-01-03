
const chatBox = document.getElementById('chat-box');
const input   = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);

  if (sender === 'bot') {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }

  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}


function sanitizeHTML(dirty) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');

  const whitelist = new Set(['BR','B','STRONG','I','EM','U','UL','OL','LI','P']);

  function clean(node) {
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        if (!whitelist.has(child.tagName)) {
          const frag = document.createDocumentFragment();
          while (child.firstChild) frag.appendChild(child.firstChild);
          node.replaceChild(frag, child);
        } else {
          for (const attr of Array.from(child.attributes)) child.removeAttribute(attr.name);
          clean(child);
        }
      } else if (child.nodeType === Node.TEXT_NODE) {
        // keep text
      } else {
        node.removeChild(child);
      }
    }
  }

  clean(doc.body);
  return doc.body.innerHTML;
}

function appendMessageLetterByLetter(safeHTML, speed = 40) {
  const botMsg = document.createElement('div');
  botMsg.classList.add('message', 'bot');
  chatBox.appendChild(botMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  let i = 0;
  let currentHTML = '';

  const interval = setInterval(() => {
    if (i < safeHTML.length) {
      if (safeHTML[i] === '<') {
        const tagEnd = safeHTML.indexOf('>', i);
        if (tagEnd !== -1) {
          currentHTML += safeHTML.slice(i, tagEnd + 1);
          i = tagEnd + 1;
        } else {
          currentHTML += safeHTML[i];
          i++;
        }
      } else {
        currentHTML += safeHTML[i];
        i++;
      }

      botMsg.innerHTML = currentHTML;
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, speed);
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, 'user');
  input.value = '';

  console.log('→ Sending to /chat:', text);

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });

    if (!res.ok) {
      const t = await res.text().catch(()=>'');
      console.error('Network response not ok', res.status, t);
      appendMessage('⚠️ Server returned status ' + res.status, 'bot');
      return;
    }

    let data;
    try {
      data = await res.json();
      console.log('← JSON received:', data);
    } catch (err) {
      const txt = await res.text();
      console.warn('← Non-JSON response, fallback to text:', txt);
      data = { reply: txt };
    }

    let replyRaw = '';
    if (typeof data === 'string') replyRaw = data;
    else if (data.reply) replyRaw = data.reply;
    else if (data.bot) replyRaw = data.bot;
    else if (data.message) replyRaw = data.message;
    else replyRaw = JSON.stringify(data);

    replyRaw = String(replyRaw).replace(/\r\n/g, '\n').replace(/\n/g, '<br>');

    const safe = sanitizeHTML(replyRaw);

    appendMessageLetterByLetter(safe, 40);

  } catch (err) {
    console.error('Fetch error:', err);
    appendMessage('⚠️ Network or server error. Open DevTools Console for details.', 'bot');
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
