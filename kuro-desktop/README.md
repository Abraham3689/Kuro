# Architecture Kuro Desktop — Little Abraham (IA Locale Sovereign)

**Kuro Desktop (Little Abraham)** est l'assistant IA souverain autonome qui s'exécute directement sur le poste de travail client (PC/Mac/Linux).

---

## 🔒 Principes de Sécurité & Architecture Zero-Server

1. **Inférence 100% Locale** :
   - Les calculs du Modèle de Langage (LLM) s'exécutent intégralement sur la RAM/GPU/CPU de la machine locale (via WebGPU / Ollama / llama.cpp embarqué).
   - **Aucune donnée textuelle, invite ou document scanné ne quitte la machine client vers un serveur tiers ou vers le VPS.**

2. **Connecteur VPS & Nextcloud OAuth2** :
   - L'application se connecte au VPS Kuro Suite (`https://drive.client.com`) uniquement pour synchroniser les documents autorisés et vérifier le statut de l'abonnement.

3. **Workspace RAG (Retrieval-Augmented Generation)** :
   - Indexation vectorielle locale des documents (`.pdf`, `.docx`, `.csv`, `.txt`).
   - Recherche sémantique et réponses contextualisées en temps réel sans cloud.

---

## 📁 Structure du Projet

```
kuro-desktop/
├── src/
│   ├── main.js                        # Point d'entrée Electron
│   ├── preload.js                     # Pont IPC sécurisé
│   ├── components/
│   │   ├── AuthNextcloud.js           # Module d'authentification VPS Kuro / Nextcloud OAuth2
│   │   └── ChatWorkspace.js           # Interface Chat + Dropzone RAG
│   └── services/
│       └── localInference.js          # Moteur d'inférence LLM local (Zero-Server)
├── index.html                         # Interface UI
├── package.json
└── README.md
```
