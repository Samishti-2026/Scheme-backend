/**
 * Recreates users table on Render to match local schema, then migrates all users.
 * Run with: node migrate-users.js
 */
require('dotenv').config();
const { Client } = require('pg');

const TARGET_URL = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

const LOCAL = { host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'scheme_tool_db' };

async function run() {
  const src = new Client(LOCAL);
  const tgt = new Client({ connectionString: TARGET_URL, ssl: { rejectUnauthorized: false } });

  await src.connect();
  await tgt.connect();

  // Recreate users table on Render to match local schema
  await tgt.query(`DROP TABLE IF EXISTS users`);
  await tgt.query(`
    CREATE TABLE users (
      user_id      SERIAL PRIMARY KEY,
      username     VARCHAR(100) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      display_name VARCHAR(150),
      role         VARCHAR(50) NOT NULL DEFAULT 'user',
      is_active    BOOLEAN DEFAULT true,
      created_at   TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('users table recreated on Render');

  const rows = await src.query('SELECT * FROM users');
  let inserted = 0;
  for (const row of rows.rows) {
    await tgt.query(`
      INSERT INTO users (user_id, username, password_hash, display_name, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (username) DO UPDATE
        SET password_hash = EXCLUDED.password_hash,
            display_name  = EXCLUDED.display_name,
            role          = EXCLUDED.role
    `, [row.user_id, row.username, row.password_hash, row.display_name, row.role, row.is_active, row.created_at]);
    inserted++;
    console.log(`  Migrated: ${row.username} (${row.role})`);
  }

  // Reset sequence to avoid PK conflicts
  await tgt.query(`SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users))`);

  console.log(`\nDone — ${inserted} users migrated`);
  await src.end();
  await tgt.end();
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
