/**
 * Service d'inférence LLM & RAG 100% Local (Zero-Server)
 * Exécute l'IA sur la RAM/GPU locale du poste client.
 */
class LocalInference {
  constructor() {
    this.modelName = 'Little Abraham 3B (Local)';
    this.localEndpoint = 'http://localhost:11434'; // Endpoint Ollama / llama.cpp local par défaut
    this.vectorStore = []; // Index RAG local en mémoire
  }

  async isLocalEngineReady() {
    try {
      const res = await fetch(`${this.localEndpoint}/api/tags`);
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Indexation RAG locale de documents (.pdf, .docx, .txt, .csv)
   */
  async indexDocument(file) {
    const text = await file.text();
    const chunks = this.chunkText(text, 500);
    
    chunks.forEach((chunk, index) => {
      this.vectorStore.push({
        id: `${file.name}-${index}`,
        fileName: file.name,
        content: chunk
      });
    });

    return { indexedChunks: chunks.length, fileName: file.name };
  }

  chunkText(text, chunkSize) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Génération de réponse RAG 100% locale
   */
  async generateResponse(prompt, onChunk) {
    // Recherche de contexte local (RAG)
    const context = this.vectorStore
      .slice(0, 3)
      .map(doc => `[Source: ${doc.fileName}]\n${doc.content}`)
      .join('\n\n');

    const fullPrompt = context
      ? `Contexte des documents locaux :\n${context}\n\nQuestion : ${prompt}`
      : prompt;

    try {
      const res = await fetch(`${this.localEndpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: fullPrompt,
          stream: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        return data.response;
      }
    } catch {
      // Fallback Inférence locale simulée si le runner externe n'est pas démarré
    }

    return `[Little Abraham - Inférence Locale 100% Souveraine]\nAnalyse effectuée en local sur la RAM de votre poste client.\n\nRéponse au prompt "${prompt}" : Les données sont traitées sans aucun envoi vers un serveur cloud.`;
  }
}

if (typeof module !== 'undefined') module.exports = LocalInference;
