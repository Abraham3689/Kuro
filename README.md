# Kuro Suite — Suite Collaborative Souveraine Auto-Hébergée

> **L'alternative aux GAFAM.** Vos données d'entreprise sur votre propre serveur dédié — stockage, bureautique et IA locale réunis, sans aucune fuite vers l'extérieur.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com/Abraham3689/Kuro/releases)

---

## ⚡ Installation One-Line (MSP / Intégrateurs)

Sur un VPS Debian/Ubuntu, exécutez simplement :

```bash
curl -sSL https://raw.githubusercontent.com/Abraham3689/Kuro/main/install.sh | bash
```

Le script installe automatiquement les dépendances, valide votre licence, génère le fichier `.env`, configure Caddy (HTTPS automatique) et lance la stack Docker.

📖 [Guide d'installation MSP](GUIDE_INSTALLATION_MSP.md)

---

## 🧩 Ce que contient Kuro Suite

| Module Kuro | Projet Sous-Jacent | Pack | Description |
| :--- | :--- | :--- | :--- |
| **Kuro Drive** | Nextcloud | `Core` | Stockage cloud, partage & synchronisation de fichiers |
| **Kuro Office** | OnlyOffice | `Core` | Suite bureautique compatible Word, Excel, PowerPoint |
| **Kuro Chat** | Mattermost | `Core` | Messagerie d'équipe & canaux de discussion |
| **Kuro Meet** | Jitsi Meet | `Core` | Visioconférence et réunions virtuelles |
| **Kuro Mail** | Stalwart Mail | `Core` | Serveur mail sécurisé (IMAP/SMTP/JMAP) |
| **Kuro PDF** | Stirling-PDF | `Core` | Édition et manipulation complète de PDF |
| **Kuro Diagram** | Draw.io | `Core` | Éditeur de schémas, diagrammes et organigrammes |
| **Kuro Send** | LocalSend | `Core` | Partage rapide de fichiers (réseau local & sécurisé) |
| **Kuro Notes** | HedgeDoc | `Core` | Prise de notes Markdown collaboratives |
| **Kuro Sign** | DocuSeal | `Pro` | Signature électronique sécurisée |
| **Kuro CRM** | Twenty CRM | `Pro` | Gestion relation client & pipelines de vente |
| **Kuro Data** | Baserow | `Pro` | Base de données no-code & tableaux relationnels |
| **Kuro Apps** | Budibase | `Pro` | Création d'applications internes no-code / low-code |
| **Abraham AI** | Open WebUI + BitNet | `Pro` | Assistant IA local (Zero Cloud) — inférence sur le poste client |

---

## 📦 Packs & Profils Docker

```bash
# Pack Core (Fondamentaux)
sudo docker compose --profile core -f docker-compose.prod.yml --env-file .env up -d

# Pack Pro (Core + Outils métiers & IA)
sudo docker compose --profile pro -f docker-compose.prod.yml --env-file .env up -d
```

---

## 🔒 Pourquoi Kuro Suite ?

- **Propriété Absolue** : Vos données restent sur votre infrastructure, zéro cloud tiers mutualisé.
- **IA 100% Locale** : L'assistant "Abraham AI" s'exécute sur le RAM/CPU du poste client, aucune donnée n'est envoyée sur Internet.
- **Déploiement Mondial** : Installez votre VPS dans le pays de votre choix — aucune dépendance géographique.
- **Tarif Prédictible** : 22,99 $ / utilisateur / mois, 100 Go de stockage inclus.

---

## 🛠️ Prérequis

- VPS **Debian 12 / Ubuntu 22.04+** (minimum 4 Go RAM, 2 vCPU)
- Nom de domaine avec DNS configuré (ex: `cloud.monentreprise.com`)
- Ports **80** et **443** ouverts
- Clé de licence Kuro Suite (`KURO_LICENSE_KEY`)

---

## 🌐 Architecture des Sous-Domaines générés

| Sous-domaine | Service |
| :--- | :--- |
| `cloud.mondomaine.com` | Kuro Drive (Nextcloud) |
| `office.mondomaine.com` | Kuro Office (OnlyOffice) |
| `meet.mondomaine.com` | Kuro Meet (Jitsi) |
| `mail.mondomaine.com` | Kuro Mail |
| `pdf.mondomaine.com` | Kuro PDF |
| `diagram.mondomaine.com` | Kuro Diagram |
| `send.mondomaine.com` | Kuro Send |
| `notes.mondomaine.com` | Kuro Notes |

---

## 🤝 Programme Partenaires MSP

Devenez revendeur Kuro Suite et percevez **15% de commission mensuelle récurrente** sur chaque licence client.

👉 [Accéder au Portail Partenaire MSP](https://console.aeorost.org)

---

## 🎨 Charte Graphique

- **Background Principal** : `#020617` (Slate 950)
- **Background Secondaire** : `#0F172A` (Slate 900)
- **HTTPS** : Automatique via Caddy (Let's Encrypt)

---

© 2026 Kuro Suite — Indépendance Numérique Mondiale.
