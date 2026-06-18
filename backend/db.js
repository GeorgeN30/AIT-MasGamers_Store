const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'masgamers.db');

let db = null;
let SQL = null;

async function getDb() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run('PRAGMA foreign_keys = ON');
  initTables();
  saveDb();
  return db;
}

function initTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      securityWord TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      avatar TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      categoria TEXT NOT NULL DEFAULT 'Soporte Técnico',
      equipo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      imageUri TEXT,
      audioUri TEXT,
      latitude REAL,
      longitude REAL,
      estado TEXT NOT NULL DEFAULT 'Recibido',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS ticket_logs (
      id TEXT PRIMARY KEY,
      ticketId TEXT NOT NULL,
      estado_anterior TEXT,
      estado_nuevo TEXT NOT NULL,
      changedBy TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (ticketId) REFERENCES tickets(id)
    )
  `);
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function prepare(sql) {
  if (!db) throw new Error('Database not initialized');
  return {
    get: (params) => {
      const stmt = db.prepare(sql);
      if (params) stmt.bind(params);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      }
      stmt.free();
      return undefined;
    },
    all: (params) => {
      const stmt = db.prepare(sql);
      if (params) stmt.bind(params);
      const rows = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject());
      }
      stmt.free();
      return rows;
    },
    run: (params) => {
      const stmt = db.prepare(sql);
      if (params) stmt.bind(params);
      stmt.step();
      stmt.free();
      saveDb();
    },
  };
}

module.exports = { getDb, prepare, saveDb };
