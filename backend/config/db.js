const sqlite3 = require('sqlite3').verbose();
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const DB_TYPE = process.env.DB_TYPE || 'sqlite';
let mysqlPool = null;
let sqliteDb = null;

if (DB_TYPE === 'mysql') {
  mysqlPool = mysql.createPool({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sales_analytics_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('[DB Config] Configured for MySQL server connection');
} else {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  // On Vercel: use /tmp (writable, persists for the warm instance lifetime)
  // Locally: use the file next to the backend folder
  const dbPath = isVercel
    ? '/tmp/sales_analytics.sqlite'
    : process.env.DB_FILE === ':memory:'
      ? ':memory:'
      : path.resolve(__dirname, '../database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB Config] Error opening SQLite database:', err.message);
    } else {
      console.log('[DB Config] Connected to SQLite database at:', dbPath);
      // Enable WAL mode for better concurrency (especially on Vercel /tmp)
      sqliteDb.run('PRAGMA journal_mode=WAL;');
      // Enforce foreign key constraints (disabled by default in SQLite)
      sqliteDb.run('PRAGMA foreign_keys = ON;');
      // Set busy timeout to prevent immediate lock contention errors
      sqliteDb.run('PRAGMA busy_timeout = 5000;');
    }
  });
}

// Universal query runner supporting both MySQL and SQLite
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (DB_TYPE === 'mysql') {
      mysqlPool.query(sql, params)
        .then(([rows]) => resolve(rows))
        .catch(err => reject(err));
    } else {
      const cleanSql = sql.trim();
      const upperSql = cleanSql.toUpperCase();
      const isSelect = upperSql.startsWith('SELECT') || upperSql.startsWith('PRAGMA') || upperSql.startsWith('WITH');
      
      if (isSelect) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, affectedRows: this.changes });
        });
      }
    }
  });
};

const queryOne = async (sql, params = []) => {
  const rows = await query(sql, params);
  return rows && rows.length > 0 ? rows[0] : null;
};

module.exports = {
  query,
  queryOne,
  DB_TYPE
};
