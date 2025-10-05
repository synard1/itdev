const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const apiKeyForm = document.getElementById('api-key-form');
const apiKeyInput = document.getElementById('api-key-input');
const clearApiKeyButton = document.getElementById('clear-api-key');

// Array to store the conversation history
const conversationHistory = [];

// Load API key from localStorage on page load
window.addEventListener('load', () => {
  const savedApiKey = localStorage.getItem('geminiApiKey');
  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
  }
});

// Save API key to localStorage
apiKeyForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    alert('API Key cannot be empty!');
    return;
  }
  localStorage.setItem('geminiApiKey', apiKey);
  alert('API Key saved successfully!');
});

// Clear API key from localStorage
clearApiKeyButton.addEventListener('click', () => {
  localStorage.removeItem('geminiApiKey');
  apiKeyInput.value = '';
  alert('API Key cleared successfully!');
});

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Frontend validation to block JSON-like strings
  try {
    const parsed = JSON.parse(userMessage);
    if (typeof parsed === 'object' && parsed !== null) {
      appendMessage('bot', 'Error: Input cannot be a JSON object or array.');
      return;
    }
  } catch (e) {
    // Not a valid JSON document, check for JSON-like patterns (e.g., "key": "value")
    if (/"[^"]*"\s*:/.test(userMessage)) {
      appendMessage('bot', 'Error: JSON-like input is not allowed.');
      return;
    }
    console.log('Input is not JSON, proceeding: ' + userMessage);
    // Not a JSON string, which is good.
  }

  // Add user message to history and display it
  conversationHistory.push({ role: 'user', text: userMessage });
  appendMessage('user', userMessage);
  input.value = '';

  // Display a "thinking" message from the bot
  const thinkingMessageElement = appendMessage('bot', 'Gemini is thinking...');

  try {
    // Get API key from localStorage
    const userApiKey = localStorage.getItem('geminiApiKey');
    console.log('Using API Key:', userApiKey);

    // Send the conversation history to the backend
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Send conversation and optional API key
      body: JSON.stringify({ conversation: conversationHistory, apiKey: userApiKey }),
    });

    const data = await response.json();

    // Remove the "thinking" message
    chatBox.removeChild(thinkingMessageElement);

    if (data.success) {
      // Add model's response to history and display it
      conversationHistory.push({ role: 'model', text: data.data });
      appendMessage('bot', data.data);
    } else {
      // Display error message from the backend
      appendMessage('bot', `Error: ${data.message}`);
    }
  } catch (error) {
    // Remove the "thinking" message
    chatBox.removeChild(thinkingMessageElement);
    console.error('Error sending message:', error);
    appendMessage('bot', 'Oops! Something went wrong. Please try again.');
  }

  // appendMessage('user', userMessage);
  // input.value = '';

  // Simulasi dummy balasan bot (placeholder)
  // setTimeout(() => {
  //   appendMessage('bot', 'Gemini is thinking... (this is dummy response)');
  // }, 1000);
});

// function appendMessage(sender, text) {
//   const msg = document.createElement('div');
//   msg.classList.add('message', sender);
//   msg.textContent = text;
//   chatBox.appendChild(msg);
//   chatBox.scrollTop = chatBox.scrollHeight;
// }

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  // Gunakan innerHTML untuk merender styling HTML dari respons AI.
  // Untuk pesan dari user, kita tetap menggunakan textContent untuk keamanan.
  if (sender === 'bot') {
    msg.innerHTML = text;
  } else {
    msg.textContent = text;
  }
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element so it can be removed later
}