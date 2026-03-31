const { Client } = require('pg');

const COMMON_URL = 'postgresql://commondb_2ghk_user:djrqVCuEgrz4tBhRC4xfSYdC9Teq0ZlD@dpg-d75p3umdqaus73bg9iq0-a.oregon-postgres.render.com/commondb_2ghk';
const TENANT_URL = 'postgresql://scheme_tool_db_user:hfKvphAnz286scgROcOuvi1fG4ZkK8He@dpg-d75mv4juibrs73bqltrg-a.singapore-postgres.render.com/scheme_tool_db';

async function query(label, url, sql) {
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query(sql);
  console.log('\n=== ' + label + ' ===');
  console.table(res.rows);
  await client.end();
}

(async () => {
  await query('commondb - tables',   COMMON_URL, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  await query('commondb - tenants',  COMMON_URL, 'SELECT tenant_id, tenant_name, slug FROM tenants');
  await query('commondb - users',    COMMON_URL, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%user%'");

  await query('scheme_tool_db - tables', TENANT_URL, "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  await query('scheme_tool_db - row counts', TENANT_URL, 'SELECT relname AS "table", n_live_tup AS rows FROM pg_stat_user_tables ORDER BY relname');
})().catch(err => { console.error(err.message); process.exit(1); });
