const express = require('express');
const router = express.Router();
const db = require('../database');

// ------------------------------------------------------------------------------
// 1. POST /api/v1/msp/register
// Inscription / Onboarding initial MSP (Nom, Email, MSP_ID)
// ------------------------------------------------------------------------------
router.post('/register', (req, res) => {
  const { msp_id, name, email } = req.body;

  if (!msp_id || !name || !email) {
    return res.status(400).json({
      status: 'error',
      message: 'msp_id, name et email sont obligatoires'
    });
  }

  db.run(`
    INSERT INTO msps (msp_id, name, email)
    VALUES (?, ?, ?)
    ON CONFLICT(msp_id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email
  `, [msp_id, name, email], function (err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }

    res.status(201).json({
      status: 'success',
      message: 'Compte MSP enregistré avec succès',
      data: { id: this.lastID || 1, msp_id, name, email }
    });
  });
});

// ------------------------------------------------------------------------------
// 2. GET /api/v1/msp/licenses?msp_id=MSP-ALPHA
// Liste toutes les licences créées pour un MSP
// ------------------------------------------------------------------------------
router.get('/licenses', (req, res) => {
  const { msp_id } = req.query;

  if (!msp_id) {
    return res.status(400).json({ status: 'error', message: 'msp_id est requis' });
  }

  db.all(`
    SELECT l.id, l.license_key, l.msp_id, l.client_domain, l.status, l.created_at,
           (SELECT MAX(last_ping) FROM heartbeats h WHERE h.license_key = l.license_key) as last_ping
    FROM licenses l
    WHERE l.msp_id = ?
    ORDER BY l.created_at DESC
  `, [msp_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }

    res.json({
      status: 'success',
      msp_id,
      count: rows.length,
      licenses: rows
    });
  });
});

// ------------------------------------------------------------------------------
// 3. POST /api/v1/msp/licenses/create
// Génère une nouvelle clé de licence pour un MSP
// ------------------------------------------------------------------------------
router.post('/licenses/create', (req, res) => {
  const { msp_id, client_domain } = req.body;

  if (!msp_id) {
    return res.status(400).json({ status: 'error', message: 'msp_id est requis' });
  }

  const cleanMsp = msp_id.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  const license_key = `LIC-${cleanMsp}-${randStr}`;

  // Valeurs par défaut pour R2 (R2 Kuro Suite partagé)
  const r2_access_key = process.env.DEFAULT_R2_ACCESS_KEY || '936168efd7bd0ac3c5a66e08b3280bcc';
  const r2_secret_key = process.env.DEFAULT_R2_SECRET_KEY || '303af1a8f5803d06675de0fbe5997c15c8c9c04969dbafdacac9e8ee9ad201eb';
  const r2_bucket = process.env.DEFAULT_R2_BUCKET || 'kuro';
  const r2_endpoint = process.env.DEFAULT_R2_ENDPOINT || 'eeec0d6140d3af376c84946de39146f2.r2.cloudflarestorage.com';

  db.run(`
    INSERT INTO licenses (license_key, msp_id, client_domain, status, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint)
    VALUES (?, ?, ?, 'active', ?, ?, ?, ?)
  `, [license_key, msp_id, client_domain || null, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint], function (err) {
    if (err) {
      return res.status(500).json({ status: 'error', message: err.message });
    }

    res.status(201).json({
      status: 'success',
      message: 'Licence générée avec succès',
      data: {
        license_key,
        msp_id,
        client_domain: client_domain || null,
        status: 'active',
        created_at: new Date().toISOString()
      }
    });
  });
});

module.exports = router;
