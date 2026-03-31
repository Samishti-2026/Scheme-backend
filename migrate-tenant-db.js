/**
 * Migrates data from local scheme_tool_db → Render scheme_tool_db
 * Run with: node migrate-tenant-db.js
 */
require('dotenv').config();
const { Client } = require('pg');

const SOURCE = {
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'root',
  database: 'scheme_tool_db',
};

const TARGET = {
  connectionString: 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db',
  ssl: { rejectUnauthorized: false },
};

async function migrateTable(src, tgt, table) {
  const count = await src.query(`SELECT COUNT(*) FROM "${table}"`);
  const total = parseInt(count.rows[0].count);
  if (total === 0) {
    console.log(`  [SKIP] ${table} — 0 rows`);
    return;
  }

  const rows = await src.query(`SELECT * FROM "${table}"`);
  const cols = Object.keys(rows.rows[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');

  let inserted = 0;
  for (const row of rows.rows) {
    const vals = cols.map((_, i) => `$${i + 1}`).join(', ');
    const values = cols.map(c => row[c]);
    try {
      await tgt.query(
        `INSERT INTO "${table}" (${colList}) VALUES (${vals}) ON CONFLICT DO NOTHING`,
        values
      );
      inserted++;
    } catch (err) {
      console.warn(`  [WARN] ${table} row skipped: ${err.message}`);
    }
  }
  console.log(`  [OK] ${table}: ${inserted}/${total} rows migrated`);
}

async function run() {
  const src = new Client(SOURCE);
  const tgt = new Client(TARGET);

  console.log('Connecting to source (local scheme_tool_db)...');
  await src.connect();

  // Get all user tables from source
  const tablesRes = await src.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
  );
  const tables = tablesRes.rows.map(r => r.table_name);
  console.log('Tables found locally:', tables);

  console.log('Connecting to target (Render scheme_tool_db)...');
  await tgt.connect();

  for (const table of tables) {
    process.stdout.write(`Migrating ${table}...\n`);
    try {
      await migrateTable(src, tgt, table);
    } catch (err) {
      console.log(`  [ERROR] ${table}: ${err.message}`);
    }
  }

  await src.end();
  await tgt.end();
  console.log('\nMigration complete.');
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
