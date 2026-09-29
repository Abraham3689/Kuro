# Kuro Suite - Plateforme Collaborative & Cloud Unifiée

**Kuro Suite** est une suite logicielle open-source complète, modulaire et auto-hébergeable, proposant une alternative souveraine aux suites cloud propriétaires.

---

## 🚀 Tableau des Modules Officiels Kuro Suite

| Module Kuro | Projet Open-Source Sous-Jacent | Pack | Description / Rôle |
| :--- | :--- | :--- | :--- |
| **Kuro Office** | OnlyOffice DesktopEditors / Server | `Core` / `Pro` | Suite bureautique intégrée (Docs, Sheets, Slides, Reader, Forms) |
| **Kuro Notes** | Obsidian / HedgeDoc Integration | `Core` / `Pro` | Prise de notes et base de connaissances Markdown |
| **Kuro Drive** | Nextcloud | `Core` / `Pro` | Stockage cloud, partage de fichiers et synchronisation |
| **Kuro Chat** | Mattermost | `Core` / `Pro` | Messagerie d'équipe et canaux de discussion instantanée |
| **Kuro Meet** | Jitsi Meet | `Core` / `Pro` | Visioconférence et réunions virtuelles |
| **Kuro Mail** | Stalwart Mail | `Core` / `Pro` | Serveur de messagerie sécurisé (IMAP/JMAP/SMTP) |
| **Kuro PDF** | Stirling-PDF | `Core` / `Pro` | Manipulation et édition complète de fichiers PDF |
| **Kuro Diagram** | Draw.io | `Core` / `Pro` | Éditeur de schémas, organigrammes et diagrammes |
| **Kuro Send** | LocalSend | `Core` / `Pro` | Partage rapide de fichiers sur réseau local et réseau sécurisé |
| **Kuro Sign** | DocuSeal | `Pro` | Signature électronique sécurisée de documents |
| **Kuro CRM** | Twenty CRM | `Pro` | Gestion de la relation client et pipelines de vente |
| **Kuro Data** | Baserow | `Pro` | Base de données relationnelle et gestionnaires de tableaux no-code |
| **Kuro Apps** | Budibase | `Pro` | Plateforme de création d'applications internes no-code / low-code |
| **KuroWatch** | ChangeDetection | `Pro` | Surveillance et alertes de changements sur les pages web |
| **Kuro Studio** | Shotcut / Media tools | `Pro` | Édition et outils de traitement multimédia |
| **Abraham AI** | Open WebUI + BitNet | `Pro` | Assistant IA génératif local et interface LLM |

---

## 📦 Découpage des Offres et Profils Docker

La Kuro Suite est structurée en deux packs d'abonnements distincts contrôlés par des profils Docker Compose (`docker-compose.prod.yml`) :

### 1. Pack Core (`profiles: ["core", "pro"]`)
Inclus les modules essentiels de bureautique, de stockage, de prise de notes et de communication :
- `Kuro Office`, `Kuro Notes`, `Kuro Drive`, `Kuro Chat`, `Kuro Meet`, `Kuro Mail`, `Kuro PDF`, `Kuro Diagram`, `Kuro Send` + Reverse Proxy `Caddy`.

### 2. Pack Pro (`profiles: ["pro"]`)
Inclus l'intégralité du Pack Core enrichi d'outils métiers avancés, de signature électronique, d'automatisation no-code et de l'assistant IA :
- Pack Core + `Kuro Sign`, `Kuro CRM`, `Kuro Data`, `Kuro Apps`, `KuroWatch`, `Kuro Studio`, `Abraham AI`.

---

## 🛠️ Instructions de Déploiement sur VPS (OVH)

### Prérequis
- Docker et Docker Compose v2+ installés sur votre VPS.
- Nom de domaine configuré avec wildcard DNS (`*.kurosuite.fr`).

### Déploiement du Pack Core
```bash
docker compose -f docker-compose.prod.yml --profile core up -d
```

### Déploiement du Pack Pro (Complet)
```bash
docker compose -f docker-compose.prod.yml --profile pro up -d
```

---

## 🎨 Thème Graphique Kuro
- **Background Principal** : `#020617` (Slate 950)
- **Background Secondaire (Cartes / Panneaux)** : `#0F172A` (Slate 900)
- **SSL & Reverse Proxy** : Automatisation HTTPS automatique via Caddy.
