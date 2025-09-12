class PerplexityChatWidget {
  constructor() {
    this.apiKey = localStorage.getItem('perplexity_api_key');
    this.isOpen = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkApiKey();
  }

  bindEvents() {
    const chatBubble = document.getElementById('chat-bubble');
    const chatModal = document.getElementById('chat-modal');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const cancelApiKeyBtn = document.getElementById('cancel-api-key');

    chatBubble?.addEventListener('click', () => this.toggleChat());
    closeBtn?.addEventListener('click', () => this.closeChat());
    sendBtn?.addEventListener('click', () => this.sendMessage());
    chatInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    saveApiKeyBtn?.addEventListener('click', () => this.saveApiKey());
    cancelApiKeyBtn?.addEventListener('click', () => this.hideApiKeyModal());
  }

  checkApiKey() {
    if (!this.apiKey) {
      this.showApiKeyModal();
    }
  }

  showApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    modal?.classList.remove('hidden');
  }

  hideApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    modal?.classList.add('hidden');
  }

  saveApiKey() {
    const input = document.getElementById('api-key-input');
    const apiKey = input?.value.trim();
    
    if (apiKey) {
      this.apiKey = apiKey;
      localStorage.setItem('perplexity_api_key', apiKey);
      this.hideApiKeyModal();
      input.value = '';
    } else {
      alert('Please enter a valid API key');
    }
  }

  toggleChat() {
    if (!this.apiKey) {
      this.showApiKeyModal();
      return;
    }

    const modal = document.getElementById('chat-modal');
    if (this.isOpen) {
      this.closeChat();
    } else {
      modal?.classList.remove('hidden');
      this.isOpen = true;
      document.getElementById('chat-input')?.focus();
    }
  }

  closeChat() {
    const modal = document.getElementById('chat-modal');
    modal?.classList.add('hidden');
    this.isOpen = false;
  }

  async sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input?.value.trim();
    
    if (!message || !this.apiKey) return;

    // Add user message to chat
    this.addMessage(message, 'user');
    input.value = '';

    // Show loading
    this.showLoading();

    try {
      const response = await this.callPerplexityAPI(message);
      this.hideLoading();
      this.addMessage(response, 'bot');
    } catch (error) {
      this.hideLoading();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      console.error('Perplexity API Error:', error);
    }
  }

  async callPerplexityAPI(message) {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert quiz generator. Here is the complete JSON schema for valid quiz files:\data\Quiz JSON Schema Specification.md.  You should populate with 25 questions unless otherwise specified'
          },
          {
            role: 'user',
            content: 'Create a 25-question quiz on [topic] using this schema.'
          }
        ],
        max_tokens: 500,
        temperature: 0.0,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.message?.content || 'Sorry, I could not generate a response.';
  }

  addMessage(content, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer?.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showLoading() {
    document.getElementById('loading')?.classList.remove('hidden');
    document.getElementById('send-btn').disabled = true;
  }

  hideLoading() {
    document.getElementById('loading')?.classList.add('hidden');
    document.getElementById('send-btn').disabled = false;
  }
}

// Initialize the chat widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PerplexityChatWidget();
});
