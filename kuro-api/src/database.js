const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/kuro.db');

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur ouverture BDD:', err.message);
  }
});

db.serialize(() => {
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  db.run(`
    CREATE TABLE IF NOT EXISTS msps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      msp_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS licenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      msp_id TEXT,
      client_domain TEXT,
      status TEXT DEFAULT 'active',
      r2_access_key TEXT NOT NULL,
      r2_secret_key TEXT NOT NULL,
      r2_bucket TEXT NOT NULL,
      r2_endpoint TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (msp_id) REFERENCES msps(msp_id) ON DELETE SET NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS heartbeats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT NOT NULL,
      client_domain TEXT,
      ip_address TEXT,
      last_ping DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (license_key) REFERENCES licenses(license_key) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
