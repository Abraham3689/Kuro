# Portail Affiliation MSP — Kuro Suite (`kuro-portal`)

Le **Portail Affiliation MSP** permet aux partenaires certifiés Kuro Suite de :
- Consulter leurs commissions récurrentes et statistiques de parc VPS.
- Générer de nouvelles clés de licence attribuées à leur `MSP_ID` pour le déploiement `install.sh`.
- Suivre la santé du parc client (Heartbeats en temps réel).
- Effectuer des demandes de retrait de commissions (compatibilité Stripe Connect).

---

## 🛠️ Stack & Architecture

- **Front-end** : Interface Web Responsive sous la charte graphique officielle Kuro Suite (#0F172A / #0284C7).
- **Back-end Server** : Node.js / Express léger servant l'application Web.
- **Connecteur API** : Liaison dynamique avec `https://api.kurosuite.com`.

---

## 🚀 Démarrage

```bash
npm install
npm start
```

Portail accessible par défaut sur `http://localhost:3001` (ou via Caddy sur `https://partners.kurosuite.fr`).
