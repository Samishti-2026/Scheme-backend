/**
 * Creates the users table in scheme_tool_db and seeds an admin user.
 * Run with: node setup-tenant-users.js
 */
require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const TENANT_URL = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

async function run() {
  const client = new Client({ connectionString: TENANT_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Create users table
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id          SERIAL PRIMARY KEY,
      username    VARCHAR(100) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      role        VARCHAR(50)  NOT NULL DEFAULT 'user',
      created_at  TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('users table ready');

  // Seed admin user — change password as needed
  const hash = await bcrypt.hash('admin123', 10);
  await client.query(`
    INSERT INTO users (username, password, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
  `, ['admin', hash, 'admin']);
  console.log('Admin user seeded: username=admin password=admin123');

  await client.end();
}

run().catch(err => { console.error(err.message); process.exit(1); });
