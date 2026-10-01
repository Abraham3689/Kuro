const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'kuro_admin_secret_2026';

app.use(cors());
app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Kuro API', timestamp: new Date().toISOString() });
});

// Middleware d'authentification Admin
const requireAdminAuth = (req, res, next) => {
  const apiKey = req.headers['x-admin-api-key'] || req.query.admin_key;
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ status: 'error', message: 'Clé API d\'administration invalide ou manquante' });
  }
  next();
};

// ------------------------------------------------------------------------------
// 1. POST /api/v1/license/validate
// ------------------------------------------------------------------------------
app.post('/api/v1/license/validate', (req, res) => {
  const { license_key, msp_id, domain } = req.body;

  if (!license_key) {
    return res.status(400).json({ status: 'error', message: 'La clé de licence (license_key) est requise' });
  }

  db.get('SELECT * FROM licenses WHERE license_key = ?', [license_key], (err, license) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }

    if (!license) {
      return res.status(404).json({ status: 'error', message: 'Licence non trouvée ou invalide' });
    }

    if (license.status !== 'active') {
      return res.status(403).json({ status: 'error', message: `Licence inactive (Statut: ${license.status})` });
    }

    // Mise à jour de l'affiliation MSP et du domaine
    db.run(`
      UPDATE licenses 
      SET client_domain = COALESCE(?, client_domain),
          msp_id = COALESCE(?, msp_id)
      WHERE license_key = ?
    `, [domain || null, msp_id || null, license_key], (updateErr) => {
      if (updateErr) {
        console.error('Erreur mise à jour licence:', updateErr.message);
      }

      res.json({
        status: 'success',
        message: 'Licence valide',
        data: {
          license_key: license.license_key,
          status: license.status,
          msp_id: msp_id || license.msp_id,
          client_domain: domain || license.client_domain,
          r2_access_key: license.r2_access_key,
          r2_secret_key: license.r2_secret_key,
          r2_bucket: license.r2_bucket,
          r2_endpoint: license.r2_endpoint
        }
      });
    });
  });
});

// ------------------------------------------------------------------------------
// 2. POST /api/v1/license/heartbeat
// ------------------------------------------------------------------------------
app.post('/api/v1/license/heartbeat', (req, res) => {
  const { license_key, domain } = req.body;
  const ip_address = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!license_key) {
    return res.status(400).json({ status: 'error', message: 'La clé de licence est requise' });
  }

  db.get('SELECT status FROM licenses WHERE license_key = ?', [license_key], (err, license) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }

    if (!license) {
      return res.status(404).json({ status: 'error', message: 'Licence non trouvée' });
    }

    db.run(`
      INSERT INTO heartbeats (license_key, client_domain, ip_address)
      VALUES (?, ?, ?)
    `, [license_key, domain || null, ip_address], (insertErr) => {
      if (insertErr) {
        console.error('Erreur enregistrement heartbeat:', insertErr.message);
      }

      res.json({
        status: 'success',
        license_status: license.status,
        timestamp: new Date().toISOString()
      });
    });
  });
});

// ------------------------------------------------------------------------------
// 3. POST /api/v1/admin/licenses/create (Sécurisé Admin)
// ------------------------------------------------------------------------------
app.post('/api/v1/admin/licenses/create', requireAdminAuth, (req, res) => {
  const { license_key, msp_id, client_domain, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint } = req.body;

  if (!license_key || !r2_access_key || !r2_secret_key || !r2_bucket || !r2_endpoint) {
    return res.status(400).json({
      status: 'error',
      message: 'Champs requis manquants (license_key, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint)'
    });
  }

  db.run(`
    INSERT INTO licenses (license_key, msp_id, client_domain, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [license_key, msp_id || null, client_domain || null, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint], function (err) {
    if (err) {
      return res.status(400).json({ status: 'error', message: err.message });
    }

    res.status(201).json({
      status: 'success',
      message: 'Nouvelle licence créée avec succès',
      data: { id: this.lastID, license_key, msp_id, client_domain, r2_bucket }
    });
  });
});

// Seed initial
require('./seed');

app.listen(PORT, () => {
  console.log(`🚀 Kuro API Server démarré sur le port ${PORT}`);
});
