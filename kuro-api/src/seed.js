const db = require('./database');

console.log('🌱 Seed de la base de données Kuro API...');

db.serialize(() => {
  db.run(`
    INSERT OR IGNORE INTO msps (msp_id, name, email)
    VALUES (?, ?, ?)
  `, ['MSP-ALPHA', 'Partner Alpha MSP', 'contact@partner-alpha.com']);

  db.run(`
    INSERT OR IGNORE INTO licenses (license_key, msp_id, client_domain, status, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'LIC-TEST-2026',
    'MSP-ALPHA',
    'cloud.entreprise.com',
    'active',
    '936168efd7bd0ac3c5a66e08b3280bcc',
    '303af1a8f5803d06675de0fbe5997c15c8c9c04969dbafdacac9e8ee9ad201eb',
    'kuro',
    'eeec0d6140d3af376c84946de39146f2.r2.cloudflarestorage.com'
  ]);

  db.run(`
    INSERT OR IGNORE INTO licenses (license_key, msp_id, client_domain, status, r2_access_key, r2_secret_key, r2_bucket, r2_endpoint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'LIC-DEMO-CORE',
    'MSP-ALPHA',
    'demo.kurosuite.fr',
    'active',
    '936168efd7bd0ac3c5a66e08b3280bcc',
    '303af1a8f5803d06675de0fbe5997c15c8c9c04969dbafdacac9e8ee9ad201eb',
    'kuro',
    'eeec0d6140d3af376c84946de39146f2.r2.cloudflarestorage.com'
  ], (err) => {
    if (!err) {
      console.log('✅ Seed terminé avec succès !');
      console.log('  - MSP : MSP-ALPHA');
      console.log('  - Licence Test : LIC-TEST-2026');
      console.log('  - Licence Démo : LIC-DEMO-CORE');
    }
  });
});
