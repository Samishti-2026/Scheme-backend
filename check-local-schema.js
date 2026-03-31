const { Client } = require('pg');
const src = new Client({ host: 'localhost', port: 5432, user: 'postgres', password: 'root', database: 'scheme_tool_db' });

src.connect().then(async () => {
  const tables = ['products', 'recipients', 'settings', 'schemes', 'scheme_configs'];
  for (const t of tables) {
    try {
      const cnt = await src.query('SELECT COUNT(*) FROM ' + t);
      const cols = await src.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name=$1', [t]);
      console.log('\n' + t + ' (' + cnt.rows[0].count + ' rows):');
      cols.rows.forEach(r => console.log('  ' + r.column_name + ' : ' + r.data_type));
    } catch(e) {
      console.log(t + ': ' + e.message);
    }
  }
  await src.end();
}).catch(e => console.error(e.message));
