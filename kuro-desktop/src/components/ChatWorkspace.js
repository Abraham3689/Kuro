/**
 * Interface Chat Workspace avec Dropzone RAG local
 */
class ChatWorkspace {
  constructor(localInference) {
    this.inference = localInference;
    this.messages = [];
  }

  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="workspace-layout">
        <!-- Zone RAG & Fichiers Locaux -->
        <div class="sidebar-rag">
          <h4>📂 Workspace RAG Local</h4>
          <p class="small">Déposez vos fichiers pour les analyser en 100% privé (Zero-Cloud)</p>
          <div id="dropzone" class="dropzone">
            <span>📥 Glissez vos fichiers ici (.pdf, .txt, .csv)</span>
            <input type="file" id="file-input" multiple hidden />
          </div>
          <ul id="indexed-files-list" class="files-list"></ul>
        </div>

        <!-- Zone Chat IA -->
        <div class="chat-container">
          <div class="chat-header">
            <h3>🤖 Little Abraham (IA Locale Souveraine)</h3>
            <span class="security-badge">🔒 Inférence locale RAM/GPU Client</span>
          </div>
          <div id="messages-box" class="messages-box">
            <div class="message system">Bienvenue dans Kuro Desktop. Vos questions et fichiers restent exclusivement sur votre poste.</div>
          </div>
          <div class="input-area">
            <textarea id="prompt-input" placeholder="Posez une question à Little Abraham ou analysez vos documents..."></textarea>
            <button id="send-btn">Envoyer</button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', async (e) => {
      const files = Array.from(e.target.files);
      for (const file of files) {
        const res = await this.inference.indexDocument(file);
        this.addFileToList(res.fileName, res.indexedChunks);
      }
    });

    document.getElementById('send-btn')?.addEventListener('click', () => this.handleSend());
  }

  addFileToList(fileName, chunks) {
    const list = document.getElementById('indexed-files-list');
    if (!list) return;
    const li = document.createElement('li');
    li.innerHTML = `📄 <strong>${fileName}</strong> <small>(${chunks} segments indexés)</small>`;
    list.appendChild(li);
  }

  async handleSend() {
    const input = document.getElementById('prompt-input');
    const prompt = input?.value.trim();
    if (!prompt) return;

    this.appendMessage('user', prompt);
    input.value = '';

    const response = await this.inference.generateResponse(prompt);
    this.appendMessage('assistant', response);
  }

  appendMessage(role, text) {
    const box = document.getElementById('messages-box');
    if (!box) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.innerText = text;
    box.appendChild(msgDiv);
    box.scrollTop = box.scrollHeight;
  }
}

if (typeof module !== 'undefined') module.exports = ChatWorkspace;
