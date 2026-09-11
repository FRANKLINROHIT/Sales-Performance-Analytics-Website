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
  const dbPath = isVercel || process.env.DB_FILE === ':memory:'
    ? ':memory:'
    : path.resolve(__dirname, '../database.sqlite');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[DB Config] Error opening SQLite database:', err.message);
    } else {
      console.log('[DB Config] Connected to SQLite database at:', dbPath);
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
      const isSelect = cleanSql.toUpperCase().startsWith('SELECT') || cleanSql.toUpperCase().startsWith('PRAGMA');
      
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
