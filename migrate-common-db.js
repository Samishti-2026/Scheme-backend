/**
 * Migrates data from local Common-DB → Render commondb_2ghk
 * Run with: node migrate-common-db.js
 */
require('dotenv').config();
const { Client } = require('pg');

const SOURCE = {
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'root',
  database: 'Common-DB',
};

const TARGET = {
  connectionString: 'postgresql://commondb_2ghk_user:djrqVCuEgrz4tBhRC4xfSYdC9Teq0ZlD@dpg-d75p3umdqaus73bg9iq0-a.oregon-postgres.render.com/commondb_2ghk',
  ssl: { rejectUnauthorized: false },
};

const TABLES = ['tenants', 'customer', 'material', 'billing', 'payment'];

async function migrateTable(src, tgt, table) {
  const count = await src.query(`SELECT COUNT(*) FROM "${table}"`);
  const total = parseInt(count.rows[0].count);
  if (total === 0) {
    console.log(`  [SKIP] ${table} — 0 rows`);
    return;
  }

  const rows = await src.query(`SELECT * FROM "${table}"`);
  if (rows.rows.length === 0) return;

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

  console.log('Connecting to source (local Common-DB)...');
  await src.connect();
  console.log('Connecting to target (Render commondb_2ghk)...');
  await tgt.connect();

  for (const table of TABLES) {
    process.stdout.write(`Migrating ${table}... `);
    try {
      await migrateTable(src, tgt, table);
    } catch (err) {
      console.log(`\n  [ERROR] ${table}: ${err.message}`);
    }
  }

  await src.end();
  await tgt.end();
  console.log('\nMigration complete.');
}

run().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
